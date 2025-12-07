# Career Services Feedback & Feature Requests

Tracking items identified from career services feedback that need implementation.

---

## Transcript & Document Management

- [x] **Multiple transcript viewing for recruiters** - Updated recruiter candidate view to display all transcripts from `candidate_transcripts` table
- [x] **Role-specific resume uploads** - Created `candidate_resumes` table and ResumeManager component for multiple labeled resumes

---

## Job Board

- [x] **Job listings page** - Create a job board where recruiters can post positions
- [x] **Job board browsing** - Allow candidates to browse and apply to posted jobs

---

## Recruiter Vetting & Trust

- [x] **Domain verification** - Auto-extracts email domain and compares to company website domain
- [x] **LinkedIn profile verification** - Displays LinkedIn links in admin review UI for manual verification
- [x] **Recruiter bio field** - Already existed, now prominently displayed in admin review cards
- [x] **Manual review workflow** - Enhanced admin UI with detailed review cards, verification notes, and domain status badges
- [x] **PII restrictions for unverified recruiters** - Unverified recruiters see limited candidate data (no names, contact info, or documents)
- [ ] **Internet footprint validation** - Could be added as additional manual review step (lower priority)

---

## Navigation & UX

- [x] **Dashboard button for logged-in recruiters** - Renamed first nav link from "Candidates" to "Dashboard"
- [x] **Audit candidate dashboard navigation** - Already has "Dashboard" link, no change needed
- [x] **Audit career services dashboard navigation** - Renamed first nav link from "Students" to "Dashboard"

---

## Notes

### 2024-12-03: Navigation fixes

- Recruiter portal: Changed first nav link from "Candidates" to "Dashboard" (points to `/recruiter`)
- School portal: Changed first nav link from "Students" to "Dashboard" (points to `/school`)
- Candidate portal: Already had clear "Dashboard" link, no changes needed

### 2024-12-03: Multiple transcript viewing

- Updated `/recruiter/candidates/[id]/page.tsx` to fetch from `candidate_transcripts` table
- Displays all uploaded transcripts with education level, degree type, school, GPA, and verification status
- Falls back to legacy `transcript_url` field for candidates who haven't migrated to new system

### 2024-12-03: Role-specific resume uploads

- Created `candidate_resumes` table (migration: `20251203000000_candidate_resumes.sql`)
- Fields: label (e.g., "Investment Banking", "Private Equity"), description, is_default, is_verified
- Created `ResumeManager` component for candidate edit-profile page
- Candidates can upload multiple resumes with role-specific labels
- One resume can be marked as "default"
- Updated recruiter candidate view to display all resumes with labels and default badge
- Falls back to legacy `resume_url` field for candidates who haven't migrated
- Suggested labels: General, Investment Banking, Private Equity, Venture Capital, Consulting, Asset Management, Hedge Fund, Corporate Finance

### 2024-12-03: Recruiter verification system

**Database changes** (migration: `20251203100000_recruiter_verification.sql`):

- Added `email_domain` field - auto-extracted from recruiter's email
- Added `email_domain_matches_company` boolean - compares email domain to company website
- Added `verification_notes` field - admin notes about verification decisions
- Created `extract_domain()` and `check_domain_match()` PostgreSQL functions
- Added trigger to auto-populate domain fields on recruiter profile create/update

**Admin UI enhancements**:

- New `RecruiterReviewCard` component for pending recruiters with:
  - Domain verification status (green check if match, yellow warning if mismatch)
  - LinkedIn profile link for manual verification
  - Company website link
  - Bio display
  - Verification notes textarea for admin documentation
- Updated Active Recruiters table to show domain verification status badges
- Verification notes are saved automatically when approving/rejecting

**PII restrictions for unverified recruiters**:

- Unverified recruiters can now browse the candidate pool with limited visibility
- Hidden from unverified recruiters: names, emails, phone, scheduling links, resumes, transcripts
- Visible to unverified recruiters: school, major, GPA, graduation year, target roles, firm interest indicators
- Yellow banner explains what's visible and what becomes available after verification
- Candidate detail pages redirect unverified recruiters back to dashboard

### 2024-12-03: Job Board Implementation

**Database changes** (migration: `20251203200000_job_listings.sql`):

- Created `job_listings` table with fields for title, description, requirements, responsibilities
- Added `job_listing_status` enum: draft, active, paused, closed, filled
- Added `job_type` enum: full_time, internship, summer_analyst, off_cycle
- Targeting fields: target_roles, locations, target_schools, min_gpa, target_grad_years
- Application settings: deadline, start_date, external_url, application_instructions
- Added `job_listing_id` column to `applications` table
- Created `apply_to_job()` function for secure job applications with candidate snapshot
- RLS policies for recruiters to manage their firm's jobs, candidates to view active jobs

**Recruiter Features** (`/recruiter/jobs`):

- Job listings dashboard with stats (active, drafts, applications, views)
- Create new job form with all fields
- Edit existing jobs
- Status management: publish, pause, close, reopen, delete drafts
- View applications per job with status management
- Update application status (pending, reviewing, interviewed, accepted, rejected)

**Candidate Features** (`/candidate/jobs`):

- Job board with filters: job type, location, role, search
- Job detail page with full description, requirements, firm info
- Apply with cover letter and resume selection
- "My Applications" page to track application status
- Withdraw pending applications

**Navigation Updates**:

- Added "Jobs" link to recruiter portal navigation
- Added "Browse Jobs" and "My Applications" links to candidate portal navigation
