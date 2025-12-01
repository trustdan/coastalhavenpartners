# Pipeline Features Roadmap - Phase 2

## Progress Tracker

### Quick Wins
- [ ] Candidate bookmarking/favorites
- [ ] Profile view analytics for candidates
- [ ] Application deadlines with countdown
- [ ] Dark mode polish

### Medium Effort
- [ ] Recruiter notes on candidates
- [ ] Candidate status tags (Contacted, Interviewing, Passed, etc.)
- [ ] Bulk actions (select multiple candidates)
- [ ] Search history

### Differentiating Features
- [ ] Mutual interest matching
- [ ] Cohort/class pages
- [ ] Recruiter firm profiles
- [ ] Interview prep resources

### Growth Features
- [ ] Referral system
- [ ] School ambassador program
- [ ] Waitlist for candidates

---

## Quick Wins

### 1. Candidate Bookmarking/Favorites

**Priority:** High
**Effort:** Low
**Dependencies:** None

Let recruiters save candidates to a shortlist without starting a conversation.

**Implementation:**

1. **Database:**
   ```sql
   create table bookmarked_candidates (
     id uuid primary key default gen_random_uuid(),
     recruiter_id uuid references recruiter_profiles(id) on delete cascade,
     candidate_id uuid references candidate_profiles(id) on delete cascade,
     notes text,
     created_at timestamptz default now(),
     unique(recruiter_id, candidate_id)
   );
   ```

2. **UI:**
   - Bookmark icon on candidate cards and profile pages
   - "Saved Candidates" tab on recruiter dashboard
   - Optional quick notes when bookmarking

**Files to create:**
- `apps/www/supabase/migrations/YYYYMMDD_bookmarked_candidates.sql`
- `apps/www/app/(portal)/recruiter/saved/page.tsx`

**Files to modify:**
- `apps/www/app/(portal)/recruiter/candidates/[id]/page.tsx` (add bookmark button)
- `apps/www/app/(portal)/recruiter/page.tsx` (add saved tab link)

---

### 2. Profile View Analytics for Candidates

**Priority:** High
**Effort:** Low
**Dependencies:** Uses existing `analytics_events` table

Show candidates "X recruiters viewed your profile this week" to encourage engagement.

**Implementation:**

1. **Query existing data:**
   - Count `profile_view` events where `target_id` = candidate's user_id
   - Group by time period (this week, this month, all time)

2. **UI:**
   - Stats card on candidate dashboard
   - "Your profile was viewed X times this week"
   - Optional: Show which firms (if recruiter allows visibility)

**Files to modify:**
- `apps/www/app/(portal)/candidate/page.tsx` (add analytics card)

---

### 3. Application Deadlines with Countdown

**Priority:** Medium
**Effort:** Low
**Dependencies:** None

Add deadline field to Capital applications with visual countdown.

**Implementation:**

1. **Database:**
   - Add `deadline` timestamptz field to relevant table or create application cycles table

2. **UI:**
   - Countdown component showing days/hours remaining
   - Color coding: green (>7 days), yellow (3-7 days), red (<3 days)
   - "Applications closed" state

**Files to modify:**
- Capital application page
- Landing page hero section

---

### 4. Dark Mode Polish

**Priority:** Low
**Effort:** Low
**Dependencies:** None

Audit all new components to ensure they respect dark mode theme.

**Implementation:**

1. Review all components added in Phase 1 for dark mode support
2. Ensure gradients, borders, and backgrounds have dark variants
3. Test all pages in both modes

---

## Medium Effort

### 5. Recruiter Notes on Candidates

**Priority:** High
**Effort:** Medium
**Dependencies:** None

Private notes only the recruiter can see, persisted per candidate.

**Implementation:**

1. **Database:**
   ```sql
   create table recruiter_candidate_notes (
     id uuid primary key default gen_random_uuid(),
     recruiter_id uuid references recruiter_profiles(id) on delete cascade,
     candidate_id uuid references candidate_profiles(id) on delete cascade,
     content text not null,
     updated_at timestamptz default now(),
     created_at timestamptz default now(),
     unique(recruiter_id, candidate_id)
   );
   ```

2. **UI:**
   - Collapsible notes section on candidate profile page
   - Auto-save on blur or debounced typing
   - "Last updated" timestamp

**Files to create:**
- `apps/www/supabase/migrations/YYYYMMDD_recruiter_notes.sql`
- `apps/www/components/recruiter/candidate-notes.tsx`

**Files to modify:**
- `apps/www/app/(portal)/recruiter/candidates/[id]/page.tsx`

---

### 6. Candidate Status Tags

**Priority:** High
**Effort:** Medium
**Dependencies:** Could combine with bookmarks table

Let recruiters tag candidates with their pipeline status.

**Implementation:**

1. **Statuses:**
   - `new` (default)
   - `contacted`
   - `interviewing`
   - `offer_extended`
   - `hired`
   - `passed`
   - `not_a_fit`

2. **Database:**
   - Add `status` enum field to `bookmarked_candidates` or create separate table

3. **UI:**
   - Dropdown on candidate profile
   - Filter by status on saved candidates page
   - Color-coded status badges

---

### 7. Bulk Actions

**Priority:** Medium
**Effort:** Medium
**Dependencies:** None

Select multiple candidates for export, messaging, or tagging.

**Implementation:**

1. **UI:**
   - Checkbox column in candidate table
   - "Select all" checkbox in header
   - Floating action bar when candidates selected
   - Actions: Export Selected, Message All, Add to Saved

2. **Backend:**
   - Batch export endpoint
   - Batch bookmark endpoint

**Files to modify:**
- `apps/www/app/(portal)/recruiter/page.tsx`
- `apps/www/app/api/export/candidates/route.ts` (support IDs param)

---

### 8. Search History

**Priority:** Low
**Effort:** Low
**Dependencies:** None

Show recent searches without needing to explicitly save them.

**Implementation:**

1. **Storage:**
   - Use localStorage for simplicity (no database needed)
   - Store last 10 search filter combinations

2. **UI:**
   - "Recent Searches" dropdown next to saved searches
   - Click to apply filters
   - Clear history button

**Files to modify:**
- `apps/www/app/(portal)/recruiter/candidate-filters.tsx`

---

## Differentiating Features

### 9. Mutual Interest Matching

**Priority:** High
**Effort:** Medium-High
**Dependencies:** Recruiter firm profiles (optional but helpful)

Candidates can "express interest" in firms; show recruiters when there's a match.

**Implementation:**

1. **Database:**
   ```sql
   create table candidate_firm_interests (
     id uuid primary key default gen_random_uuid(),
     candidate_id uuid references candidate_profiles(id) on delete cascade,
     firm_name text not null, -- or firm_id if we have firm profiles
     created_at timestamptz default now(),
     unique(candidate_id, firm_name)
   );
   ```

2. **Candidate UI:**
   - "Interested Firms" section in profile
   - Search/select from known firms
   - Limit to 10 firms

3. **Recruiter UI:**
   - Badge on candidates who expressed interest in their firm
   - Filter: "Interested in my firm"

---

### 10. Cohort/Class Pages

**Priority:** Medium
**Effort:** Medium
**Dependencies:** None

Group candidates by school or graduation year for easier browsing.

**Implementation:**

1. **Routes:**
   - `/recruiter/schools/[school]` - All candidates from a school
   - `/recruiter/class/[year]` - All candidates graduating in a year

2. **UI:**
   - School cards with candidate counts
   - Class year tabs
   - Quick stats per cohort (avg GPA, top majors)

---

### 11. Recruiter Firm Profiles

**Priority:** Medium
**Effort:** Medium
**Dependencies:** None

Public profiles for firms so candidates can learn about them.

**Implementation:**

1. **Database:**
   - Enhance `recruiter_profiles` or create `firms` table
   - Fields: logo, description, culture, open roles, locations, website

2. **UI:**
   - `/firms/[slug]` public page
   - Firm cards on candidate dashboard
   - "Learn about firms recruiting from our network"

---

### 12. Interview Prep Resources

**Priority:** Low
**Effort:** Medium
**Dependencies:** None

Content section with finance interview guides (builds SEO + value).

**Implementation:**

1. **Content:**
   - MDX or CMS-based articles
   - Topics: IB technicals, PE case studies, HF stock pitches
   - Downloadable resources (templates, guides)

2. **Routes:**
   - `/resources` - Resource hub
   - `/resources/[slug]` - Individual articles

---

## Growth Features

### 13. Referral System

**Priority:** Medium
**Effort:** Medium
**Dependencies:** None

Let candidates invite classmates with tracking.

**Implementation:**

1. **Database:**
   ```sql
   create table referrals (
     id uuid primary key default gen_random_uuid(),
     referrer_id uuid references profiles(id),
     referred_email text not null,
     referred_user_id uuid references profiles(id),
     status text default 'pending', -- pending, signed_up, verified
     created_at timestamptz default now()
   );
   ```

2. **UI:**
   - Unique referral link per user
   - "Invite classmates" section on dashboard
   - Referral leaderboard (optional)
   - Rewards: priority verification, badges

---

### 14. School Ambassador Program

**Priority:** Low
**Effort:** Medium
**Dependencies:** Referral system

Special role for campus representatives.

**Implementation:**

1. **Ambassador features:**
   - Special badge on profile
   - Dashboard showing their school's candidates
   - Bulk invite tools
   - Analytics on their referrals

2. **Admin features:**
   - Appoint ambassadors
   - Track ambassador performance

---

### 15. Waitlist for Candidates

**Priority:** Low
**Effort:** Low
**Dependencies:** None

Control growth and create exclusivity.

**Implementation:**

1. **Flow:**
   - New signups go to waitlist by default
   - Admin approves in batches
   - Priority given to referrals, target schools

2. **UI:**
   - Waitlist position indicator
   - "Skip the line" referral incentive

---

## Implementation Priority

| Order | Feature | Effort | Impact | Why |
|-------|---------|--------|--------|-----|
| 1 | Candidate bookmarking | Low | High | Quick win, high recruiter value |
| 2 | Profile view analytics | Low | High | Drives candidate engagement |
| 3 | Recruiter notes | Medium | High | Essential for recruiter workflow |
| 4 | Candidate status tags | Medium | High | Completes recruiter pipeline |
| 5 | Mutual interest matching | Medium | High | Differentiator, drives engagement |
| 6 | Bulk actions | Medium | Medium | Power user feature |
| 7 | Recruiter firm profiles | Medium | Medium | Two-sided marketplace |
| 8 | Referral system | Medium | High | Growth engine |
| 9 | Cohort pages | Medium | Medium | Better UX for recruiters |
| 10 | Search history | Low | Low | Nice to have |
| 11 | Application deadlines | Low | Medium | Urgency driver |
| 12 | Dark mode polish | Low | Low | Quality |
| 13 | Interview prep | Medium | Medium | SEO + value add |
| 14 | Ambassador program | Medium | Medium | Growth |
| 15 | Waitlist | Low | Low | Only if needed |
