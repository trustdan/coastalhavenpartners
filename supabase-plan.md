# Supabase Database Plan - Coastal Haven Partners

This document outlines the database schema and flows for Coastal Haven Partners, including the integration with Coastal Haven Capital.

---

## Core User Flows

### Flow 1: Candidate Signs Up & Builds Profile
```
1. User signs up (Google/LinkedIn OAuth or email)
2. Creates candidate profile (education, GPA, resume, etc.)
3. Profile marked as "complete" when required fields filled
4. Can browse firms and opportunities
```

### Flow 2: One-Click Apply to Coastal Haven Capital
```
1. User has completed profile on Partners
2. Clicks "Apply to Coastal Haven Capital" button
3. Application created with profile snapshot
4. Capital team reviews in admin dashboard
```

### Flow 3: Apply to Partner Firms
```
1. User browses firm listings
2. Clicks "Apply" on a firm
3. Application created (same flow as Capital)
4. Firm receives notification / reviews in dashboard
```

---

## Schema Design

### 1. Profiles (extends auth.users)

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,

  -- Basic Info
  email text not null,
  full_name text,
  phone text,
  linkedin_url text,
  calendar_url text,         -- Calendly or similar scheduling link

  -- Education
  university text,
  major text,
  graduation_year int,
  gpa numeric(3,2),

  -- Documents
  resume_url text,           -- Supabase Storage path
  transcript_url text,       -- Supabase Storage path

  -- Profile Status
  profile_complete boolean default false,

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 2. Applications

```sql
create type application_status as enum (
  'pending',
  'reviewing',
  'interviewed',
  'accepted',
  'rejected',
  'withdrawn'
);

create type application_target as enum (
  'capital',    -- Coastal Haven Capital
  'firm'        -- Partner firm
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),

  -- Who applied
  profile_id uuid references public.profiles not null,

  -- Where they applied
  target_type application_target not null,
  firm_id uuid references public.firms,  -- null if target_type = 'capital'

  -- Application Data (snapshot at time of application)
  snapshot jsonb not null,  -- Copy of profile data at application time

  -- Application Questions (filled out per application)
  cover_letter text not null,           -- "Why are you interested?"
  outreach_approach text not null,      -- "How would you reach out to business owners..."

  -- Status
  status application_status default 'pending',

  -- Notes (internal)
  internal_notes text,

  -- Metadata
  applied_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Prevent duplicate applications
  unique(profile_id, target_type, firm_id)
);

-- Index for querying applications
create index idx_applications_profile on applications(profile_id);
create index idx_applications_target on applications(target_type, firm_id);
create index idx_applications_status on applications(status);
```

### 3. Firms (Partner Firms)

```sql
create table public.firms (
  id uuid primary key default gen_random_uuid(),

  -- Basic Info
  name text not null,
  slug text unique not null,  -- URL-friendly identifier
  description text,
  logo_url text,
  website_url text,

  -- Firm Details
  firm_type text,  -- 'investment_bank', 'pe', 'hedge_fund', 'vc', etc.
  location text,
  size text,       -- 'boutique', 'middle_market', 'bulge_bracket'

  -- Recruiting
  is_hiring boolean default true,
  positions_available text[],  -- ['analyst', 'associate', 'intern']

  -- Visibility
  is_featured boolean default false,
  is_active boolean default true,

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 4. Admin Users (for reviewing applications)

```sql
create type admin_role as enum (
  'super_admin',     -- Full access
  'capital_admin',   -- Coastal Haven Capital team
  'firm_admin'       -- Partner firm recruiters
);

create table public.admin_users (
  id uuid references auth.users on delete cascade primary key,
  role admin_role not null,
  firm_id uuid references public.firms,  -- null for super_admin and capital_admin

  created_at timestamptz default now()
);
```

---

## Row Level Security (RLS)

### Profiles RLS

```sql
alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can view all profiles (for application review)
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
    )
  );
```

### Applications RLS

```sql
alter table public.applications enable row level security;

-- Users can view their own applications
create policy "Users can view own applications"
  on public.applications for select
  using (profile_id = auth.uid());

-- Users can create applications (if profile complete)
create policy "Users can create applications"
  on public.applications for insert
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and profile_complete = true
    )
  );

-- Users can withdraw their applications
create policy "Users can withdraw applications"
  on public.applications for update
  using (profile_id = auth.uid())
  with check (status = 'withdrawn');

-- Capital admins can view/update Capital applications
create policy "Capital admins can manage Capital applications"
  on public.applications for all
  using (
    target_type = 'capital'
    and exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
      and admin_users.role in ('super_admin', 'capital_admin')
    )
  );

-- Firm admins can view/update their firm's applications
create policy "Firm admins can manage their firm applications"
  on public.applications for all
  using (
    target_type = 'firm'
    and exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
      and (
        admin_users.role = 'super_admin'
        or admin_users.firm_id = applications.firm_id
      )
    )
  );
```

---

## Key Functions

### Check if Profile is Complete

All fields are required for profile completion:

```sql
create or replace function public.check_profile_complete()
returns trigger as $$
begin
  new.profile_complete := (
    -- Basic Info
    new.full_name is not null
    and new.phone is not null
    and new.linkedin_url is not null
    and new.calendar_url is not null
    -- Education
    and new.university is not null
    and new.major is not null
    and new.graduation_year is not null
    and new.gpa is not null
    -- Documents
    and new.resume_url is not null
    and new.transcript_url is not null
  );
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_update
  before update on public.profiles
  for each row execute procedure public.check_profile_complete();
```

### Create Application with Profile Snapshot

```sql
create or replace function public.create_application(
  p_target_type application_target,
  p_firm_id uuid default null
)
returns uuid as $$
declare
  v_profile record;
  v_application_id uuid;
begin
  -- Get profile
  select * into v_profile
  from public.profiles
  where id = auth.uid();

  -- Check profile complete
  if not v_profile.profile_complete then
    raise exception 'Profile must be complete before applying';
  end if;

  -- Create application with snapshot
  insert into public.applications (
    profile_id,
    target_type,
    firm_id,
    snapshot
  ) values (
    auth.uid(),
    p_target_type,
    p_firm_id,
    jsonb_build_object(
      'full_name', v_profile.full_name,
      'email', v_profile.email,
      'phone', v_profile.phone,
      'linkedin_url', v_profile.linkedin_url,
      'calendar_url', v_profile.calendar_url,
      'university', v_profile.university,
      'major', v_profile.major,
      'graduation_year', v_profile.graduation_year,
      'gpa', v_profile.gpa,
      'resume_url', v_profile.resume_url,
      'transcript_url', v_profile.transcript_url
    )
  )
  returning id into v_application_id;

  return v_application_id;
end;
$$ language plpgsql security definer;
```

---

## Storage Buckets

```sql
-- Resume uploads
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false);

-- Resume upload policy (users can upload to their own folder)
create policy "Users can upload own resume"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own resumes
create policy "Users can read own resume"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can read all resumes
create policy "Admins can read all resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid()
    )
  );
```

---

## API Routes (Next.js)

### Partners App Routes

```
POST /api/auth/signup          - Create account
POST /api/auth/login           - Login
GET  /api/profile              - Get current user profile
PUT  /api/profile              - Update profile
POST /api/profile/resume       - Upload resume

GET  /api/firms                - List partner firms
GET  /api/firms/[slug]         - Get firm details

POST /api/applications         - Create application
GET  /api/applications         - List user's applications
PUT  /api/applications/[id]    - Withdraw application
```

### Admin Routes (could be separate app or protected routes)

```
GET  /api/admin/applications              - List applications (filtered by role)
GET  /api/admin/applications/[id]         - Get application details
PUT  /api/admin/applications/[id]/status  - Update application status
```

---

## One-Click Apply Flow (Detailed)

### From Partners Site

```typescript
// components/apply-to-capital-button.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ApplyToCapitalButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleApply() {
    const { data, error } = await supabase
      .rpc('create_application', {
        p_target_type: 'capital',
        p_firm_id: null
      })

    if (error) {
      // Handle error (show toast, etc.)
      return
    }

    // Redirect to success page or application status
    router.push('/applications?success=capital')
  }

  return (
    <button onClick={handleApply}>
      Apply to Coastal Haven Capital
    </button>
  )
}
```

### From Capital Site (via redirect)

```
1. User on coastalhavencapital.com clicks "Apply Now"
2. Redirects to: coastalhavenpartners.com/apply/capital
3. If logged in + profile complete → show confirmation modal → submit
4. If logged in + profile incomplete → redirect to profile page
5. If not logged in → redirect to signup with ?redirect=/apply/capital
```

---

---

## Admin Portal

### Applicant List View

A table/grid showing all applicants with at-a-glance info and quick action buttons.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  Applications to Coastal Haven Capital                                    [Filter ▼] [Sort ▼]│
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ John Smith              Harvard '26    Finance    3.85 GPA    Applied 2 days ago       │  │
│  │ john.smith@college.edu                                        ● Pending                │  │
│  │                                                                                        │  │
│  │ [📄 Resume] [📜 Transcript] [📅 Schedule] [💼 LinkedIn] [✉️ Email]    [Review ▼]      │  │
│  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Sarah Johnson           Wharton '25    Economics  3.92 GPA    Applied 5 days ago       │  │
│  │ sarah.j@wharton.edu                                           ● Reviewing              │  │
│  │                                                                                        │  │
│  │ [📄 Resume] [📜 Transcript] [📅 Schedule] [💼 LinkedIn] [✉️ Email]    [Review ▼]      │  │
│  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Applicant Card Component

```tsx
// components/admin/applicant-card.tsx
interface ApplicantCardProps {
  application: {
    id: string
    status: ApplicationStatus
    applied_at: string
    snapshot: {
      full_name: string
      email: string
      phone: string
      linkedin_url: string
      calendar_url: string
      university: string
      major: string
      graduation_year: number
      gpa: number
      resume_url: string
      transcript_url: string
    }
  }
}

export function ApplicantCard({ application }: ApplicantCardProps) {
  const { snapshot, status, applied_at } = application

  return (
    <div className="rounded-lg border p-4">
      {/* Header: Name, School, Major, GPA, Date */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{snapshot.full_name}</h3>
          <p className="text-sm text-muted-foreground">{snapshot.email}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">
            {snapshot.university} '{snapshot.graduation_year % 100}
          </p>
          <p className="text-sm text-muted-foreground">
            {snapshot.major} · {snapshot.gpa} GPA
          </p>
        </div>
      </div>

      {/* Status Badge + Applied Date */}
      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={status} />
        <span className="text-xs text-muted-foreground">
          Applied {formatRelativeTime(applied_at)}
        </span>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton
          icon={FileText}
          label="Resume"
          href={getStorageUrl(snapshot.resume_url)}
          external
        />
        <ActionButton
          icon={GraduationCap}
          label="Transcript"
          href={getStorageUrl(snapshot.transcript_url)}
          external
        />
        <ActionButton
          icon={Calendar}
          label="Schedule"
          href={snapshot.calendar_url}
          external
        />
        <ActionButton
          icon={Linkedin}
          label="LinkedIn"
          href={snapshot.linkedin_url}
          external
        />
        <ActionButton
          icon={Mail}
          label="Email"
          href={`mailto:${snapshot.email}`}
        />
      </div>

      {/* Status Change Dropdown */}
      <div className="mt-4">
        <StatusDropdown
          applicationId={application.id}
          currentStatus={status}
        />
      </div>
    </div>
  )
}
```

### Admin Routes

```
/admin                        - Dashboard overview
/admin/applications           - List all applications (filterable)
/admin/applications/[id]      - Single application detail view
/admin/applications/capital   - Capital applications only
/admin/applications/firms     - Partner firm applications
```

### Status Flow

```
pending → reviewing → interviewed → accepted
                   ↘             ↘→ rejected
                     → rejected

withdrawn (can happen from any state except accepted/rejected)
```

### Filters & Sorting

**Filters:**
- Status (pending, reviewing, interviewed, accepted, rejected)
- Target (Capital, specific firm)
- University
- Graduation year
- GPA range
- Applied date range

**Sort by:**
- Applied date (newest/oldest)
- Name (A-Z, Z-A)
- GPA (high to low)
- University
- Status

### Admin Dashboard Metrics

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│      24         │  │       8         │  │       3         │  │       2         │
│  Total Apps     │  │    Pending      │  │   Reviewing     │  │   Interviewed   │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Decisions Made

1. **Profile fields** - All required:
   - Basic: name, email, phone, LinkedIn, calendar link (Calendly)
   - Education: university, major, graduation year, GPA
   - Documents: resume, transcript

2. **Storage**: Supabase Storage for resumes and transcripts

3. **Notifications**: Email to admin on new application (via Resend)

4. **Application fields** - Three text fields per application:
   - Cover letter / "Why are you interested?"
   - Custom question: "If selected, how would you reach out to business owners to ask if they're interested in selling some or all of their company to PE?"

5. **Admin portal**: Route in Partners app (`/admin`) with role-based middleware

## Questions to Resolve

1. **Firm admin access**: How do partner firms get accounts?
   - Manual creation by super admin?
   - Self-serve with approval?

2. **Analytics/tracking**:
   - Track where applications come from (utm_source)?
   - Track profile completion funnel?

---

## Implementation Order

### Phase 1: Core Auth & Profiles
- [x] Set up Supabase project
- [x] Configure Google/LinkedIn OAuth
- [x] Create profiles table + trigger
- [x] Build profile form UI
- [x] Resume upload to Storage

### Phase 2: Applications
- [x] Create applications table
- [x] Build "Apply to Capital" flow
- [x] Application status page for candidates
- [x] Basic admin view for Capital team

### Phase 2.5: Capital Admin Improvements
- [x] Add internal notes editing UI (action exists but no UI to add/edit notes in applicant card)
- [x] Fix `updated_at` field on status change (currently only `reviewed_at` is updated, breaking "Last updated" display on candidate dashboard)
- [x] Add filtering capabilities (by university, GPA range, graduation year, date range)
- [x] Add sorting options (by date, name, GPA, university)
- [ ] Email notifications on status change (notify candidates when their application status changes via Resend)

### Phase 3: Partner Firms
- [ ] Create firms table
- [ ] Firm listing page
- [ ] Apply to firm flow
- [ ] Firm admin dashboard

### Phase 4: Polish
- [ ] Email notifications (new application alerts to admin)
- [ ] Application tracking/analytics
- [ ] Profile completion prompts
- [ ] Mobile optimization

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only

# OAuth (configured in Supabase dashboard)
# Google Client ID/Secret
# LinkedIn Client ID/Secret

# Email (if using Resend)
RESEND_API_KEY=xxx
```
