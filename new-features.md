# New Features Plan

This document outlines upcoming features for Coastal Haven Partners, organized by implementation priority and effort level.

---

## 1. Progressive Web App (PWA) Support

**Effort:** Low (2-3 hours)
**Impact:** High - enables mobile home screen installation, offline access, push notification foundation

### Implementation Steps

1. **Create Web App Manifest** (`apps/www/app/manifest.ts`)
   ```typescript
   import type { MetadataRoute } from 'next'

   export default function manifest(): MetadataRoute.Manifest {
     return {
       name: 'Coastal Haven Partners',
       short_name: 'CHP',
       description: 'Elite finance talent network',
       start_url: '/',
       display: 'standalone',
       background_color: '#ffffff',
       theme_color: '#0ea5e9',
       icons: [
         { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
         { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
         { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
       ],
     }
   }
   ```

2. **Generate PWA Icons**
   - Create 192x192 and 512x512 PNG icons from existing logo
   - Place in `apps/www/public/`

3. **Add Service Worker** (optional, for offline caching)
   - Use `next-pwa` package or manual service worker
   - Cache static assets and API responses
   - Show offline fallback page

4. **Configure viewport and theme-color** in root layout
   ```typescript
   export const metadata: Metadata = {
     // ... existing metadata
     appleWebApp: {
       capable: true,
       statusBarStyle: 'default',
       title: 'Coastal Haven Partners',
     },
     formatDetection: {
       telephone: false,
     },
   }
   ```

5. **Add Apple-specific meta tags** for iOS support
   - apple-touch-icon
   - apple-mobile-web-app-capable
   - apple-mobile-web-app-status-bar-style

### Files to Create/Modify
- `apps/www/app/manifest.ts` (new)
- `apps/www/app/layout.tsx` (modify metadata)
- `apps/www/public/icon-192.png` (new)
- `apps/www/public/icon-512.png` (new)
- `apps/www/public/apple-touch-icon.png` (new)

---

## 2. Interview Scheduling Integration

**Effort:** Low-Medium (3-4 hours)
**Impact:** High - streamlines recruiter-candidate scheduling

### Current State
- Candidates already have a `scheduling_url` field in their profile
- Field is displayed but not prominently featured

### Implementation Steps

1. **Enhance Candidate Profile Display for Recruiters**
   - Add prominent "Schedule Interview" button when `scheduling_url` exists
   - Show Calendly/Cal.com widget in modal or sidebar

2. **Add Scheduling URL to Recruiter View**
   - In `apps/www/app/(portal)/recruiter/candidates/[id]/page.tsx`
   - Display as primary CTA button alongside "Message" button

3. **Create Embeddable Scheduling Modal**
   ```typescript
   // components/scheduling-modal.tsx
   interface SchedulingModalProps {
     url: string
     candidateName: string
   }

   // Detect provider and embed appropriately:
   // - Calendly: Use Calendly embed widget
   // - Cal.com: Use Cal.com embed
   // - Other: Open in new tab
   ```

4. **Track Scheduling Clicks** (analytics)
   - Log when recruiters click "Schedule Interview"
   - Show candidates which recruiters attempted to schedule

5. **Validate Scheduling URLs** on profile edit
   - Accept: calendly.com, cal.com, outlook booking pages
   - Warn on unrecognized domains

### Files to Create/Modify
- `apps/www/components/scheduling-modal.tsx` (new)
- `apps/www/app/(portal)/recruiter/candidates/[id]/page.tsx` (modify)
- `apps/www/app/(portal)/candidate/edit-profile/page.tsx` (add validation)

---

## 3. School Placement Analytics

**Effort:** Medium (6-8 hours)
**Impact:** Medium - valuable for career services, differentiator

### Overview
Allow career services administrators to see aggregate placement data for their students.

### Implementation Steps

1. **Create Analytics Dashboard for Schools**
   - New page: `apps/www/app/(portal)/school/analytics/page.tsx`

2. **Track Placement Data**
   - Add `placed_firm_id` and `placed_at` columns to `candidate_profiles`
   - Create migration for new fields
   ```sql
   ALTER TABLE candidate_profiles
   ADD COLUMN placed_firm_id uuid REFERENCES firms(id),
   ADD COLUMN placed_at timestamptz,
   ADD COLUMN placement_role text;
   ```

3. **Build Analytics Queries**
   - Students by placement status (placed, active, searching)
   - Placements by firm type (IB, PE, VC, HF)
   - Placements by firm
   - Average time to placement
   - GPA distribution of placed students
   - Year-over-year comparison

4. **Create Visualization Components**
   - Use recharts or chart.js for graphs
   - Cards showing key metrics
   - Exportable reports (PDF/CSV)

5. **Admin Ability to Mark Placements**
   - When candidate status changes to "placed"
   - Record which firm, what role, when

### Dashboard Sections
```
┌─────────────────────────────────────────────────────────┐
│  School Placement Analytics                             │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 45       │ │ 12       │ │ 89%      │ │ 3.2mo    │   │
│  │ Students │ │ Placed   │ │ Rate     │ │ Avg Time │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│  [Placements by Firm Type - Pie Chart]                 │
│  [Placements Over Time - Line Chart]                   │
│  [Top Destination Firms - Bar Chart]                   │
│                                                         │
│  Recent Placements                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ John D. → Goldman Sachs (IB) - Nov 2025        │   │
│  │ Sarah M. → Blackstone (PE) - Oct 2025          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Files to Create/Modify
- `apps/www/supabase/migrations/YYYYMMDD_placement_tracking.sql` (new)
- `apps/www/app/(portal)/school/analytics/page.tsx` (new)
- `apps/www/components/school/placement-charts.tsx` (new)
- `apps/www/app/(portal)/school/layout.tsx` (add nav link)

---

## 4. Recruiter Campaigns (Bulk Outreach)

**Effort:** Medium-High (8-10 hours)
**Impact:** Medium - productivity boost for recruiters

### Overview
Allow recruiters to send templated messages to multiple candidates at once based on saved searches.

### Implementation Steps

1. **Create Campaign Data Model**
   ```sql
   CREATE TABLE recruiter_campaigns (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     recruiter_profile_id uuid REFERENCES recruiter_profiles(id) NOT NULL,
     name text NOT NULL,
     subject text NOT NULL,
     message_template text NOT NULL,
     filters jsonb, -- saved search criteria
     status text DEFAULT 'draft', -- draft, scheduled, sent, paused
     scheduled_at timestamptz,
     sent_at timestamptz,
     created_at timestamptz DEFAULT now()
   );

   CREATE TABLE campaign_recipients (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     campaign_id uuid REFERENCES recruiter_campaigns(id) NOT NULL,
     candidate_profile_id uuid REFERENCES candidate_profiles(id) NOT NULL,
     status text DEFAULT 'pending', -- pending, sent, opened, replied
     sent_at timestamptz,
     opened_at timestamptz,
     UNIQUE(campaign_id, candidate_profile_id)
   );
   ```

2. **Campaign Builder UI**
   - Start from saved search or current filters
   - Preview recipient list
   - Template editor with variables: `{{candidate_name}}`, `{{school}}`, etc.
   - Preview rendered message

3. **Template Variables**
   - `{{candidate_name}}` - Full name
   - `{{first_name}}` - First name only
   - `{{school}}` - School name
   - `{{major}}` - Major
   - `{{graduation_year}}` - Grad year
   - `{{recruiter_name}}` - Sender's name
   - `{{firm_name}}` - Recruiter's firm

4. **Sending Logic**
   - Create conversation and message for each recipient
   - Rate limit: max 50 messages per campaign
   - Stagger sends to avoid spam appearance

5. **Campaign Analytics**
   - Sent count
   - Open rate (when candidate views message)
   - Reply rate
   - Best performing templates

### UI Flow
```
Recruiter Dashboard
  └── Campaigns (new nav item)
        ├── Create Campaign
        │     ├── Select Recipients (from filters or saved search)
        │     ├── Write Message Template
        │     ├── Preview & Test
        │     └── Send or Schedule
        └── Campaign History
              ├── View Performance
              └── Resend to Non-responders
```

### Files to Create/Modify
- `apps/www/supabase/migrations/YYYYMMDD_recruiter_campaigns.sql` (new)
- `apps/www/app/(portal)/recruiter/campaigns/page.tsx` (new)
- `apps/www/app/(portal)/recruiter/campaigns/new/page.tsx` (new)
- `apps/www/app/(portal)/recruiter/campaigns/[id]/page.tsx` (new)
- `apps/www/components/recruiter/campaign-builder.tsx` (new)
- `apps/www/components/recruiter/template-editor.tsx` (new)
- `apps/www/app/(portal)/recruiter/layout.tsx` (add nav link)

---

## 5. Application Deadline Reminders

**Effort:** Low-Medium (4-5 hours)
**Impact:** Medium - helps candidates stay on top of opportunities

### Overview
Display upcoming application deadlines from firms/jobs and allow candidates to set reminders.

### Implementation Steps

1. **Add Deadline Field to Jobs**
   - Already may exist in job_listings table
   - If not, add `application_deadline` column

2. **Create Deadline Aggregation View**
   ```sql
   CREATE VIEW upcoming_deadlines AS
   SELECT
     j.id,
     j.title,
     j.application_deadline,
     f.name as firm_name,
     f.slug as firm_slug,
     j.location
   FROM job_listings j
   JOIN firms f ON j.firm_id = f.id
   WHERE j.application_deadline > now()
     AND j.status = 'active'
   ORDER BY j.application_deadline ASC;
   ```

3. **Candidate Dashboard Widget**
   - Show upcoming deadlines in card
   - Filter to roles matching candidate's target_roles
   - "Remind Me" button for each deadline

4. **Reminder System**
   ```sql
   CREATE TABLE deadline_reminders (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     candidate_profile_id uuid REFERENCES candidate_profiles(id) NOT NULL,
     job_listing_id uuid REFERENCES job_listings(id) NOT NULL,
     remind_at timestamptz NOT NULL, -- e.g., 3 days before deadline
     reminded boolean DEFAULT false,
     created_at timestamptz DEFAULT now(),
     UNIQUE(candidate_profile_id, job_listing_id)
   );
   ```

5. **Reminder Processing** (when email is set up)
   - Cron job or Supabase Edge Function
   - Check for reminders where `remind_at <= now() AND reminded = false`
   - Send notification and mark as reminded

6. **In-App Notification** (before email)
   - Show badge on dashboard when deadlines are approaching
   - "You have 3 deadlines in the next 7 days"

### UI Components
```
┌─────────────────────────────────────────────────────────┐
│  Upcoming Deadlines                          View All → │
├─────────────────────────────────────────────────────────┤
│  ⏰ Goldman Sachs - IB Analyst         Dec 15  [Remind] │
│  ⏰ Blackstone - PE Associate          Dec 20  [Remind] │
│  ⏰ Citadel - Quant Researcher         Jan 5   [Remind] │
└─────────────────────────────────────────────────────────┘
```

### Files to Create/Modify
- `apps/www/supabase/migrations/YYYYMMDD_deadline_reminders.sql` (new)
- `apps/www/components/candidate/upcoming-deadlines.tsx` (new)
- `apps/www/app/(portal)/candidate/page.tsx` (add widget)
- `apps/www/app/(portal)/candidate/deadlines/page.tsx` (new - full view)

---

## Implementation Priority

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| PWA Support | Low | High | 1 |
| Interview Scheduling | Low-Med | High | 2 |
| Deadline Reminders | Low-Med | Medium | 3 |
| School Analytics | Medium | Medium | 4 |
| Recruiter Campaigns | Med-High | Medium | 5 |

### Recommended Sprint Plan

**Sprint 1 (Days 1-2): PWA + Scheduling**
- Implement PWA manifest and icons
- Add scheduling modal and CTA buttons
- Test on mobile devices

**Sprint 2 (Days 3-4): Deadlines**
- Add deadline reminder system
- Create dashboard widget
- Build full deadlines page

**Sprint 3 (Days 5-6): Analytics**
- Create placement tracking schema
- Build school analytics dashboard
- Add visualization components

**Sprint 4 (Future): Campaigns**
- Build campaign data model
- Create campaign builder UI
- Implement sending logic
- Add analytics tracking

---

## Notes

- **Email Notifications**: Deferred until DNS is configured for transactional email
- **Featured Candidates**: Already implemented as "Recommended Candidates" for recruiters
- **Mobile App**: PWA provides 80% of native app value with 5% of effort; native app not needed
