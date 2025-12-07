# Pipeline Features Roadmap

## Progress Tracker

### Phase 1: Application & Admin Workflows
- [x] Application status transitions (admin controls)
- [x] Candidate approval workflow
- [ ] Email notifications system

### Phase 2: Verification & Profile Completeness
- [x] Document verification UI
- [x] Profile completion progress bar

### Phase 3: Communication
- [x] In-platform messaging
- [x] Interview scheduling (text-based MVP via messaging)

### Phase 4: Recruiter Power Features
- [x] Saved searches
- [x] Bulk candidate export (CSV)
- [x] Match recommendations

---

## Phase 1: Application & Admin Workflows

These three features are tightly coupled—status changes trigger emails, and approval workflows need the same admin UI patterns.

### 1.1 Application Status Transitions

**Priority:** High
**Effort:** Medium
**Dependencies:** None

The Capital application system has 6 statuses (`pending`, `reviewing`, `interviewed`, `accepted`, `rejected`, `withdrawn`) but no admin UI to transition between them.

**Implementation:**
1. Add status transition buttons to `/admin/applications` page
2. Create server action `updateApplicationStatus(applicationId, newStatus, notes?)`
3. Add confirmation modal for destructive actions (reject)
4. Log status changes to `moderation_actions` or new `application_history` table
5. Add optional notes field for internal tracking

**Files to modify:**
- `apps/www/app/(app)/admin/applications/page.tsx`
- `apps/www/app/(app)/admin/actions.ts` (new server actions)
- `apps/www/components/admin/application-card.tsx` (add status buttons)

**Database changes:**
- Consider adding `application_status_history` table for audit trail

---

### 1.2 Candidate Approval Workflow

**Priority:** High
**Effort:** Medium
**Dependencies:** Builds on same patterns as 1.1

Candidates have status (`pending_verification`, `verified`, `active`, `placed`, `rejected`) but no admin workflow to approve them.

**Implementation:**
1. Create `/admin/candidates` page (or enhance existing)
2. Add approval/rejection buttons with notes
3. Implement `updateCandidateStatus(candidateId, newStatus, notes?)` server action
4. Add filter tabs: Pending Review | Verified | Active | Rejected
5. Show candidate snapshot (school, GPA, resume link) for quick decisions

**Files to modify:**
- `apps/www/app/(app)/admin/candidates/page.tsx` (enhance or create)
- `apps/www/app/(app)/admin/actions.ts`

---

### 1.3 Email Notifications System

**Priority:** High
**Effort:** Medium-High
**Dependencies:** Should implement after 1.1 and 1.2 so we know what events to trigger on

Resend is configured but no transactional emails are being sent.

**Implementation:**

1. **Create email templates** (`apps/www/lib/emails/`):
   - `application-received.tsx` - Confirm Capital application submitted
   - `application-status-change.tsx` - Status updates (reviewing, accepted, rejected)
   - `candidate-approved.tsx` - Welcome to the network
   - `candidate-rejected.tsx` - Rejection with feedback option
   - `new-applicant-alert.tsx` - Admin notification

2. **Create email service** (`apps/www/lib/email.ts`):
   ```typescript
   export async function sendEmail(template: string, to: string, data: object)
   ```

3. **Add email triggers** to server actions from 1.1 and 1.2

4. **Environment variables:**
   - `RESEND_API_KEY`
   - `EMAIL_FROM` (e.g., `notifications@coastalhavenpartners.com`)

**Files to create:**
- `apps/www/lib/emails/` directory with React Email templates
- `apps/www/lib/email.ts` - email service wrapper

**Files to modify:**
- Server actions to call email service on status changes

---

## Phase 2: Verification & Profile Completeness

These features build trust in the platform—verified documents and complete profiles make candidates more attractive to recruiters.

### 2.1 Document Verification UI

**Priority:** High
**Effort:** Medium-High
**Dependencies:** None (but benefits from Phase 1 admin patterns)

Candidates can upload resumes and transcripts, but there's no admin review process.

**Implementation:**

1. **Admin verification queue** (`/admin/verification`):
   - List candidates with pending document review
   - Show uploaded resume/transcript previews
   - Verify GPA matches transcript
   - Mark documents as verified/rejected

2. **Database changes:**
   - Add `resume_verified`, `transcript_verified`, `gpa_verified` boolean fields to `candidate_profiles`
   - Add `verified_by`, `verified_at` fields for audit

3. **Candidate-facing:**
   - Show verification badges on profile
   - Display "Pending verification" status

4. **Recruiter-facing:**
   - Filter by "Verified candidates only"
   - Show verification badges in search results

**Files to create:**
- `apps/www/app/(app)/admin/verification/page.tsx`
- `apps/www/components/admin/document-viewer.tsx`

**Files to modify:**
- `candidate_profiles` table (migration)
- Recruiter search filters

---

### 2.2 Profile Completion Progress Bar

**Priority:** Medium
**Effort:** Low
**Dependencies:** Benefits from defining what "complete" means in 2.1

Candidates don't know what's missing from their profile or what makes them more visible to recruiters.

**Implementation:**

1. **Define completion criteria:**
   - Basic info (name, email) - 10%
   - Education (school, major, GPA, grad year) - 25%
   - Resume uploaded - 20%
   - Transcript uploaded - 15%
   - Target roles selected - 10%
   - Preferred locations selected - 10%
   - Bio written - 10%

2. **Create progress component:**
   - Visual progress bar (e.g., 75% complete)
   - Checklist of missing items with links to edit
   - "Complete your profile to appear in recruiter searches"

3. **Add to candidate dashboard** prominently at top

**Files to create:**
- `apps/www/components/candidate/profile-completion.tsx`

**Files to modify:**
- `apps/www/app/(app)/candidate/page.tsx` (dashboard)

---

## Phase 3: Communication

These features enable direct interaction between recruiters and candidates.

### 3.1 In-Platform Messaging

**Priority:** Medium
**Effort:** Medium (reduced by using polling instead of Realtime)
**Dependencies:** None, but should come after core workflows are solid

Recruiters currently have no way to contact candidates directly through the platform.

#### Architecture Decision: Polling over Realtime

We're using polling (check for new messages every 30 seconds) instead of Supabase Realtime for cost reasons:

- **Realtime:** Each open browser tab = 1 persistent WebSocket connection. Supabase free tier caps at 500 concurrent connections.
- **Polling:** Short-lived request/response cycles. 500 users polling every 30s = ~17 requests/second, each lasting milliseconds. No connection limits.

This keeps us on free tier indefinitely and simplifies implementation. Users see new messages within 30 seconds—acceptable for a recruiting platform (not a chat app).

#### Implementation

1. **Database schema:**
   ```sql
   create table conversations (
     id uuid primary key,
     recruiter_id uuid references recruiter_profiles,
     candidate_id uuid references candidate_profiles,
     created_at timestamptz,
     last_message_at timestamptz
   );

   create table messages (
     id uuid primary key,
     conversation_id uuid references conversations,
     sender_id uuid references profiles,
     content text,
     read_at timestamptz,
     created_at timestamptz
   );
   ```

2. **UI Components:**
   - Message button on candidate profile (for recruiters)
   - Inbox page for both roles
   - Conversation thread view
   - Unread message indicator in nav

3. **Polling implementation:**
   - `useEffect` with `setInterval` (30 seconds) to check for new messages
   - Query: `SELECT * FROM messages WHERE conversation_id = ? AND created_at > last_check`
   - Update unread count in nav on each poll
   - Polling only runs when user is on messages page (or optionally site-wide for unread badge)

4. **Email notifications:**
   - "You have a new message" email (immediate or batched hourly)
   - Users don't need to keep the tab open to know they have messages

**Files to create:**
- `apps/www/app/(app)/messages/page.tsx`
- `apps/www/app/(app)/messages/[conversationId]/page.tsx`
- `apps/www/components/messages/` directory
- `apps/www/hooks/use-message-polling.ts` - reusable polling hook
- Database migration

---

### 3.2 Interview Scheduling

**Priority:** High
**Effort:** Medium
**Dependencies:** Messaging (3.1) or can be standalone

Allow recruiters to schedule interviews with candidates.

**Implementation options:**

**Option A: Simple (Recommended for MVP)**
- Recruiter enters available times as text
- Candidate confirms via message
- Manual coordination

**Option B: Calendar Integration**
- Integrate Calendly or Cal.com embed
- Recruiter links their calendar
- Candidate books directly

**Option C: Built-in Scheduling**
- Recruiter sets availability windows
- Candidate picks a slot
- Both get calendar invites

**Recommendation:** Start with Option A (text-based in messages), then add Option B (Calendly links) as enhancement.

**Files to modify:**
- Message composer (add "Propose interview times" template)
- Or recruiter profile (add Calendly link field)

---

## Phase 4: Recruiter Power Features

These features improve recruiter experience and stickiness.

### 4.1 Saved Searches

**Priority:** Medium
**Effort:** Low-Medium
**Dependencies:** None

Recruiters want to save filter combinations and get notified of new matches.

**Implementation:**

1. **Database:**
   ```sql
   create table saved_searches (
     id uuid primary key,
     recruiter_id uuid references recruiter_profiles,
     name text,
     filters jsonb, -- { gpa_min: 3.5, majors: [...], schools: [...] }
     notify_new_matches boolean default false,
     created_at timestamptz
   );
   ```

2. **UI:**
   - "Save this search" button on candidate search page
   - Name the search
   - Toggle for email notifications on new matches
   - Saved searches dropdown to quickly apply filters

3. **Notifications (if enabled):**
   - Daily/weekly digest of new candidates matching saved searches

**Files to create:**
- `apps/www/components/recruiter/saved-searches.tsx`
- Database migration

**Files to modify:**
- `apps/www/app/(app)/recruiter/candidates/page.tsx`

---

### 4.2 Bulk Candidate Export (CSV)

**Priority:** Medium
**Effort:** Low
**Dependencies:** None

Recruiters want to export candidate lists to share internally or import to their ATS.

**Implementation:**

1. **Export button** on candidate search results
2. **Server action** that:
   - Takes current filter criteria
   - Queries matching candidates
   - Generates CSV with: Name, Email, School, Major, GPA, Grad Year, LinkedIn
   - Returns as downloadable file

3. **Privacy considerations:**
   - Only export candidates who have visibility enabled for recruiters
   - Log exports in analytics_events
   - Consider rate limiting

**Files to create:**
- `apps/www/app/api/export/candidates/route.ts`

**Files to modify:**
- `apps/www/app/(app)/recruiter/candidates/page.tsx` (add export button)

---

### 4.3 Match Recommendations

**Priority:** Medium
**Effort:** Medium-High
**Dependencies:** Benefits from analytics data (profile views, saved searches)

Show recruiters "Candidates you might like" based on their activity.

**Implementation:**

1. **Simple approach (MVP):**
   - Track which candidate profiles recruiter views
   - Find similar candidates (same school, major, GPA range)
   - Show "Similar to candidates you've viewed" section

2. **Enhanced approach:**
   - Use saved search criteria to surface new matches
   - "New this week" candidates matching their preferences
   - Collaborative filtering (recruiters who viewed X also viewed Y)

3. **UI:**
   - Recommendations section on recruiter dashboard
   - "Recommended for you" tab in candidate search

**Files to create:**
- `apps/www/lib/recommendations.ts`
- `apps/www/components/recruiter/recommended-candidates.tsx`

**Files to modify:**
- `apps/www/app/(app)/recruiter/page.tsx` (dashboard)

---

## Implementation Order Summary

| Order | Feature | Phase | Effort | Why This Order |
|-------|---------|-------|--------|----------------|
| 1 | Application status transitions | 1 | Medium | Foundation for admin workflows |
| 2 | Candidate approval workflow | 1 | Medium | Same patterns, complete admin suite |
| 3 | Email notifications | 1 | Medium | Triggers from 1 & 2, high user value |
| 4 | Profile completion progress | 2 | Low | Quick win, improves data quality |
| 5 | Document verification | 2 | Medium-High | Builds trust, uses admin patterns |
| 6 | Saved searches | 4 | Low-Medium | Quick recruiter win |
| 7 | Bulk export | 4 | Low | Quick recruiter win |
| 8 | In-platform messaging | 3 | High | Core communication feature |
| 9 | Interview scheduling | 3 | Medium | Builds on messaging |
| 10 | Match recommendations | 4 | Medium-High | Nice-to-have, needs usage data |

---

## Notes

- Each phase can be deployed independently
- Phase 1 should be completed before announcing to recruiters
- Consider feature flags for gradual rollout
- Add analytics events to measure feature adoption
