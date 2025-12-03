# Career Services Feedback & Feature Requests

Tracking items identified from career services feedback that need implementation.

---

## Transcript & Document Management

- [x] **Multiple transcript viewing for recruiters** - Updated recruiter candidate view to display all transcripts from `candidate_transcripts` table
- [ ] **Role-specific resume uploads** - Allow candidates to add specific resumes for specific job types/applications

---

## Job Board

- [ ] **Job listings page** - Create a job board where recruiters can post positions
- [ ] **Job board browsing** - Allow candidates to browse and apply to posted jobs

---

## Recruiter Vetting & Trust

- [ ] **Domain verification** - Verify recruiter email domains match their claimed company
- [ ] **LinkedIn profile verification** - Check/link recruiter LinkedIn profiles
- [ ] **Internet footprint validation** - Verify recruiter legitimacy through online presence
- [ ] **Recruiter bio field** - Add 120-character "about me" field for recruiters to describe themselves
- [ ] **Manual review workflow** - Process for flagging/approving recruiters (open to automation ideas)

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
