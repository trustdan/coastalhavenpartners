# Job Board Implementation Plan

## Overview

This plan implements a job board feature that allows:
- **Recruiters**: Post job listings for their firms
- **Candidates**: Browse and apply to posted jobs
- **Admins**: Moderate job listings

## Architecture Decisions

### Database Approach
We'll create a `job_listings` table rather than extending `hiring_roles` on `firms` because:
1. Individual jobs need their own metadata (description, requirements, deadline, etc.)
2. Applications should track which specific job was applied to
3. Jobs have lifecycle states (draft, active, closed, filled)
4. Multiple recruiters at a firm may post different jobs

### Leverage Existing Infrastructure
- Extend `applications` table (already has `target_type: 'firm'` and `firm_id`)
- Add `job_listing_id` to applications for specific job tracking
- Reuse existing RLS patterns, UI components, and authentication flow

---

## Phase 1: Database Schema

### New Table: `job_listings`

```sql
-- Migration: 20251203200000_job_listings.sql

CREATE TYPE job_listing_status AS ENUM (
  'draft',       -- Not yet visible
  'active',      -- Visible to candidates
  'paused',      -- Temporarily hidden
  'closed',      -- No longer accepting applications
  'filled'       -- Position filled
);

CREATE TYPE job_type AS ENUM (
  'full_time',
  'internship',
  'summer_analyst',
  'off_cycle'
);

CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES recruiter_profiles(id),

  -- Job Details
  title TEXT NOT NULL,                    -- "Summer Analyst 2026"
  slug TEXT UNIQUE NOT NULL,              -- "blackstone-summer-analyst-2026"
  job_type job_type NOT NULL,
  description TEXT NOT NULL,              -- Rich text/markdown
  requirements TEXT,                      -- Qualifications
  responsibilities TEXT,                  -- Day-to-day tasks

  -- Filters/Tags
  target_roles TEXT[],                    -- "Investment Banking", "Private Equity"
  locations TEXT[],                       -- "New York", "Chicago"
  target_schools TEXT[],                  -- Optional school targeting
  min_gpa DECIMAL(3,2),                   -- Optional GPA requirement
  target_grad_years INTEGER[],            -- [2025, 2026]

  -- Compensation (optional)
  compensation_range TEXT,                -- "$100k-$120k" or "Competitive"

  -- Application Settings
  application_deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  external_url TEXT,                      -- Link to external application if any
  application_instructions TEXT,

  -- Status
  status job_listing_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,      -- Admin can feature jobs

  -- Counts (denormalized for performance)
  application_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_job_listings_firm ON job_listings(firm_id);
CREATE INDEX idx_job_listings_status ON job_listings(status) WHERE status = 'active';
CREATE INDEX idx_job_listings_deadline ON job_listings(application_deadline) WHERE status = 'active';
CREATE INDEX idx_job_listings_slug ON job_listings(slug);
CREATE INDEX idx_job_listings_target_roles ON job_listings USING gin(target_roles);
CREATE INDEX idx_job_listings_locations ON job_listings USING gin(locations);
```

### Extend Applications Table

```sql
-- Add job_listing_id to applications
ALTER TABLE applications
ADD COLUMN job_listing_id UUID REFERENCES job_listings(id) ON DELETE SET NULL;

-- Index for job-specific applications
CREATE INDEX idx_applications_job_listing ON applications(job_listing_id);
```

### RLS Policies for job_listings

```sql
-- Anyone can view active job listings
CREATE POLICY "Anyone can view active job listings"
  ON job_listings FOR SELECT
  USING (status = 'active');

-- Recruiters can view their firm's job listings (all statuses)
CREATE POLICY "Recruiters can view own firm jobs"
  ON job_listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = job_listings.posted_by
      AND rp.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.firm_id = job_listings.firm_id
      AND rp.user_id = auth.uid()
      AND rp.is_approved = true
    )
  );

-- Approved recruiters can create jobs for their firm
CREATE POLICY "Approved recruiters can create jobs"
  ON job_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = posted_by
      AND rp.firm_id = firm_id
      AND rp.user_id = auth.uid()
      AND rp.is_approved = true
    )
  );

-- Recruiters can update their own jobs
CREATE POLICY "Recruiters can update own jobs"
  ON job_listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = job_listings.posted_by
      AND rp.user_id = auth.uid()
    )
  );

-- Recruiters can delete their own draft jobs
CREATE POLICY "Recruiters can delete own draft jobs"
  ON job_listings FOR DELETE
  USING (
    status = 'draft'
    AND EXISTS (
      SELECT 1 FROM recruiter_profiles rp
      WHERE rp.id = job_listings.posted_by
      AND rp.user_id = auth.uid()
    )
  );

-- Admins can manage all jobs
CREATE POLICY "Admins can manage all jobs"
  ON job_listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );
```

---

## Phase 2: Recruiter Job Management

### 2.1 New Pages

#### `/recruiter/jobs` - Job Listings Dashboard
- List all jobs posted by the recruiter
- Status tabs: All | Active | Draft | Closed
- Quick stats per job (views, applications)
- Actions: Edit, Pause, Close, Delete (draft only)

#### `/recruiter/jobs/new` - Create Job Posting
- Form with all job fields
- Preview mode before publishing
- Save as draft or publish immediately

#### `/recruiter/jobs/[id]` - Job Detail/Edit
- View job details
- Edit form (if owner)
- View applications for this job
- Quick status toggle

#### `/recruiter/jobs/[id]/applications` - Job Applications
- Table of candidates who applied
- Application status management
- Link to full candidate profile

### 2.2 Components

```
components/
  recruiter/
    job-form.tsx              # Create/edit job form
    job-card.tsx              # Job listing card in recruiter dashboard
    job-status-badge.tsx      # Status indicator
    job-applications-table.tsx # Applicants for a specific job
```

### 2.3 Server Actions

```typescript
// app/(portal)/recruiter/jobs/actions.ts

export async function createJobListing(data: JobListingInput): Promise<JobListing>
export async function updateJobListing(id: string, data: Partial<JobListingInput>): Promise<JobListing>
export async function publishJobListing(id: string): Promise<void>
export async function pauseJobListing(id: string): Promise<void>
export async function closeJobListing(id: string): Promise<void>
export async function deleteJobListing(id: string): Promise<void>
export async function getJobListings(): Promise<JobListing[]>
export async function getJobApplications(jobId: string): Promise<Application[]>
```

---

## Phase 3: Candidate Job Browsing

### 3.1 New Pages

#### `/candidate/jobs` - Job Board
- Grid/list of active job listings
- Filters: Role type, Location, Job type, Deadline
- Search by keyword
- Sort: Newest, Deadline, Featured

#### `/candidate/jobs/[slug]` - Job Detail
- Full job description
- Firm info sidebar
- Apply button (or "Applied" badge)
- Similar jobs section

#### `/candidate/jobs/[slug]/apply` - Application Form
- Cover letter field (required)
- Optional custom questions
- Resume selection (from candidate's uploaded resumes)
- Submit application

### 3.2 Components

```
components/
  candidate/
    job-board-filters.tsx     # Filter controls
    job-listing-card.tsx      # Job card in listing
    job-detail-view.tsx       # Full job detail display
    job-application-form.tsx  # Apply form
```

### 3.3 Navigation Update

Add "Jobs" link to candidate layout nav:
```tsx
<Link href="/candidate/jobs">
  Browse Jobs
</Link>
```

---

## Phase 4: Application Flow

### 4.1 Apply to Job Function

```sql
-- Function to apply for a job
CREATE OR REPLACE FUNCTION apply_to_job(
  p_job_listing_id UUID,
  p_cover_letter TEXT,
  p_resume_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_candidate_profile candidate_profiles%ROWTYPE;
  v_job job_listings%ROWTYPE;
  v_application_id UUID;
BEGIN
  -- Get candidate profile
  SELECT * INTO v_candidate_profile
  FROM candidate_profiles
  WHERE user_id = auth.uid();

  IF v_candidate_profile.id IS NULL THEN
    RAISE EXCEPTION 'Candidate profile not found';
  END IF;

  IF v_candidate_profile.status NOT IN ('verified', 'active') THEN
    RAISE EXCEPTION 'Profile must be verified to apply';
  END IF;

  -- Get job listing
  SELECT * INTO v_job
  FROM job_listings
  WHERE id = p_job_listing_id AND status = 'active';

  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found or not accepting applications';
  END IF;

  -- Check deadline
  IF v_job.application_deadline IS NOT NULL AND v_job.application_deadline < NOW() THEN
    RAISE EXCEPTION 'Application deadline has passed';
  END IF;

  -- Create application with snapshot
  INSERT INTO applications (
    candidate_profile_id,
    target_type,
    firm_id,
    job_listing_id,
    snapshot,
    cover_letter,
    outreach_approach,
    status
  ) VALUES (
    v_candidate_profile.id,
    'firm',
    v_job.firm_id,
    p_job_listing_id,
    -- snapshot of candidate data...
  )
  RETURNING id INTO v_application_id;

  -- Increment application count
  UPDATE job_listings
  SET application_count = application_count + 1
  WHERE id = p_job_listing_id;

  RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 Application Status for Candidates

Update candidate dashboard to show:
- "My Applications" section
- List of jobs applied to with status
- Link to view application details

---

## Phase 5: Admin Moderation

### 5.1 Admin Job Management

Add to admin dashboard:
- List of all job listings (pending review if needed)
- Feature/unfeature jobs
- Force close inappropriate listings
- View job posting analytics

### 5.2 Optional: Job Review Workflow

Could add approval workflow if spam becomes an issue:
- New jobs start as "pending_review"
- Admin approves before going live
- Auto-approve for verified recruiters (skip review)

---

## Implementation Order

### Sprint 1: Database & Backend (Day 1-2)
1. Create job_listings migration
2. Add job_listing_id to applications
3. Create RLS policies
4. Create apply_to_job function
5. Regenerate database types

### Sprint 2: Recruiter Features (Day 2-3)
1. Create job management pages
2. Job form component
3. Job card and list components
4. Server actions for CRUD
5. Update recruiter nav

### Sprint 3: Candidate Features (Day 3-4)
1. Job board page with filters
2. Job detail page
3. Application form
4. Update candidate nav
5. Add "My Applications" to dashboard

### Sprint 4: Polish & Integration (Day 5-6)
1. Job view tracking
2. Application notifications (optional)
3. Admin moderation features
4. Testing and bug fixes
5. Update career-services-feedback.md

---

## File Structure Summary

```
apps/www/
  app/
    (portal)/
      candidate/
        jobs/
          page.tsx                 # Job board listing
          [slug]/
            page.tsx               # Job detail
            apply/
              page.tsx             # Apply form
        my-applications/
          page.tsx                 # View my applications
      recruiter/
        jobs/
          page.tsx                 # My posted jobs
          new/
            page.tsx               # Create new job
          [id]/
            page.tsx               # Edit/view job
            applications/
              page.tsx             # View applicants
  components/
    jobs/
      job-card.tsx
      job-filters.tsx
      job-form.tsx
      job-status-badge.tsx
      apply-button.tsx
  lib/
    jobs/
      actions.ts                   # Server actions
      types.ts                     # TypeScript types
  supabase/
    migrations/
      20251203200000_job_listings.sql
```

---

## Questions for User

1. **Job Approval Workflow**: Should new job listings require admin approval before going live, or auto-approve for verified recruiters?

2. **External Applications**: Should we support jobs that link to external application systems (e.g., Workday), or require all applications through our platform?

3. **Resume Selection**: Should candidates be able to select which of their uploaded resumes to include with an application?

4. **Application Questions**: Should recruiters be able to add custom questions to their job applications?

5. **Notifications**: Should candidates receive email notifications when jobs matching their target roles are posted?
