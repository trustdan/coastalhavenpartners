# Candidate & Recruiter Experience Remediation Plan

## Phase Checklist

- [x] **Phase 1: Fix Candidate Names Not Showing for Recruiters**
- [x] **Phase 2: Add Target Role Filter for Recruiters**
- [x] **Phase 3: Add Scheduling URL Field for Candidates (Contact/Schedule Interview buttons)**
- [x] **Phase 4: Enhance Candidate Profile Fields (Notes, Tags, improved Target Roles/Locations)**
- [x] **Phase 5: Autocomplete Dropdowns for Repeating Fields**
- [x] **Phase 6: Profanity Filter System**

---

## Phase 1: Fix Candidate Names Not Showing for Recruiters

### Problem
The recruiter dashboard shows candidates but the `Name` column is empty. The query joins `profiles!user_id` but the data isn't rendering.

### Root Cause Analysis
The query in `apps/www/app/(portal)/recruiter/page.tsx` uses:
```typescript
profiles!user_id (
  full_name,
  email
)
```

Possible issues:
1. **RLS Policy**: The `profiles` table may have RLS that prevents recruiters from reading candidate profiles
2. **Join Syntax**: The foreign key relationship may not be properly configured
3. **Null user_id**: Some candidate_profiles may have null user_id values

### Tasks
- [ ] Check RLS policies on `profiles` table for cross-role access
- [ ] Verify `candidate_profiles.user_id` foreign key to `profiles.id`
- [ ] Add RLS policy allowing approved recruiters to read profile names of verified candidates
- [ ] Test the join query in Supabase SQL editor
- [ ] Update query if needed to use admin client for profile data

### Files to Modify
- `apps/www/supabase/migrations/` - New migration for RLS policy
- `apps/www/app/(portal)/recruiter/page.tsx` - Possibly update query approach

---

## Phase 2: Add Target Role Filter for Recruiters

### Problem
Recruiters can filter by GPA, Major, School, and Grad Year but NOT by Target Role preference.

### Solution
Add a Target Role filter dropdown/input to the candidate filters component.

### Tasks
- [ ] Add `targetRole` search param handling in `page.tsx`
- [ ] Add array containment filter: `.contains('target_roles', [targetRole])`
- [ ] Add Target Role input field to `candidate-filters.tsx`
- [ ] Consider making it a dropdown with common roles (IB, PE, VC, Consulting, etc.)

### Files to Modify
- `apps/www/app/(portal)/recruiter/page.tsx` - Add filter logic
- `apps/www/app/(portal)/recruiter/candidate-filters.tsx` - Add UI input

---

## Phase 3: Add Scheduling URL Field for Candidates

### Problem
The "Contact" and "Schedule Interview" buttons on the candidate detail page don't do anything.

### Solution
1. Add `scheduling_url` field to `candidate_profiles` table
2. Allow candidates to input their Calendly/Cal.com/other scheduling link
3. Wire up the buttons to use this URL

### Database Changes
```sql
ALTER TABLE candidate_profiles
ADD COLUMN scheduling_url TEXT;
```

### Tasks
- [ ] Create migration to add `scheduling_url` column
- [ ] Add scheduling URL input to candidate edit-profile page
- [ ] Update candidate detail page to make buttons functional:
  - "Contact" -> Opens mailto with candidate email
  - "Schedule Interview" -> Opens scheduling URL in new tab (or shows "No scheduling link" toast)
- [ ] Add visibility control for scheduling URL (recruiter/school)

### Files to Modify
- `apps/www/supabase/migrations/` - New migration
- `apps/www/app/(portal)/candidate/edit-profile/page.tsx` - Add input field
- `apps/www/app/(portal)/recruiter/candidates/[id]/page.tsx` - Wire up buttons

---

## Phase 4: Enhance Candidate Profile Fields

### Problem
Candidates need ability to add:
- **Notes** (240 character bio/summary)
- **Tags** (comma-separated skills/interests)
- Target Roles and Preferred Locations already exist but need better UX

### Database Changes
```sql
ALTER TABLE candidate_profiles
ADD COLUMN bio TEXT CHECK (char_length(bio) <= 240);
-- tags column already exists as TEXT[]
```

### Tasks
- [ ] Create migration for `bio` column (if not using existing `notes` field)
- [ ] Add Bio/Notes textarea (240 char limit with counter)
- [ ] Add Tags input with comma separation
- [ ] Display these fields on recruiter candidate detail view
- [ ] Update visibility controls to include bio and tags

### Files to Modify
- `apps/www/supabase/migrations/` - New migration
- `apps/www/app/(portal)/candidate/edit-profile/page.tsx` - Add input fields
- `apps/www/app/(portal)/recruiter/candidates/[id]/page.tsx` - Display fields

---

## Phase 5: Autocomplete Dropdowns for Repeating Fields

### Problem
Users should see autocomplete suggestions based on previously entered values for:
- Target Roles
- Preferred Locations
- Tags

### Solution
Create a reusable `AutocompleteInput` component that:
1. Queries existing values from the database
2. Shows dropdown suggestions as user types
3. Allows selecting existing or entering new values

### Implementation Approach
```typescript
// API endpoint to get distinct values
GET /api/autocomplete?field=target_roles&search=invest

// Returns
["Investment Banking", "Investment Management", "Investor Relations"]
```

### Tasks
- [ ] Create `components/autocomplete-input.tsx` component
- [ ] Create API route `/api/autocomplete/route.ts`
- [ ] Query distinct values: `SELECT DISTINCT unnest(target_roles) FROM candidate_profiles WHERE ... ILIKE '%search%'`
- [ ] Integrate into candidate edit-profile for:
  - Target Roles
  - Preferred Locations
  - Tags
- [ ] Add debounce to prevent excessive API calls

### Files to Create/Modify
- `apps/www/components/autocomplete-input.tsx` - New component
- `apps/www/app/api/autocomplete/route.ts` - New API route
- `apps/www/app/(portal)/candidate/edit-profile/page.tsx` - Integrate component

---

## Phase 6: Profanity Filter System

### Problem
Need to prevent derogatory/inappropriate words in user-submitted fields.

### Solution
Create a profanity filter utility that:
1. Checks input against a blocklist
2. Rejects submission if profanity detected
3. Works on both client and server side

### Blocked Words List (starter)
```typescript
const BLOCKED_WORDS = [
  'poop', 'shit', 'ass', 'fuck', 'damn', 'bitch', 'crap',
  'dick', 'penis', 'vagina', 'cock', 'pussy', 'whore',
  'slut', 'bastard', 'asshole', 'bullshit', 'nigger',
  'faggot', 'retard', 'cunt', // Add more as needed
]
```

### Implementation
```typescript
// lib/profanity-filter.ts
export function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase()
  return BLOCKED_WORDS.some(word => {
    // Check for word boundaries to avoid false positives (e.g., "class" containing "ass")
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(normalized)
  })
}

export function getProfanityMatches(text: string): string[] {
  const normalized = text.toLowerCase()
  return BLOCKED_WORDS.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(normalized)
  })
}
```

### Tasks
- [ ] Create `lib/profanity-filter.ts` utility
- [ ] Add client-side validation to form inputs (show error before submit)
- [ ] Add server-side validation in API routes/form handlers
- [ ] Add to candidate edit-profile form for:
  - Bio/Notes
  - Tags
  - Target Roles
  - Preferred Locations
- [ ] Show user-friendly error message: "Please remove inappropriate language"
- [ ] Consider adding admin ability to extend blocklist

### Files to Create/Modify
- `apps/www/lib/profanity-filter.ts` - New utility
- `apps/www/app/(portal)/candidate/edit-profile/page.tsx` - Add validation
- `apps/www/app/api/` - Add server-side checks

---

## Implementation Order Recommendation

1. **Phase 1** (Critical) - Names not showing is a major bug affecting core functionality
2. **Phase 2** (High) - Target role filter is important for recruiter UX
3. **Phase 3** (High) - Contact/Schedule buttons are prominently displayed but broken
4. **Phase 4** (Medium) - Enhanced profile fields add value
5. **Phase 5** (Medium) - Autocomplete improves UX but not blocking
6. **Phase 6** (Medium) - Profanity filter important for platform integrity

---

## Testing Checklist

### Phase 1 Tests
- [ ] Recruiter can see candidate full names in table
- [ ] Recruiter can see candidate emails in table
- [ ] RLS doesn't leak data to unauthorized users

### Phase 2 Tests
- [ ] Filter by "Investment Banking" shows only matching candidates
- [ ] Filter persists in URL params
- [ ] Clear filters works correctly

### Phase 3 Tests
- [ ] Candidate can save Calendly URL
- [ ] "Schedule Interview" opens Calendly in new tab
- [ ] "Contact" opens email client with candidate email
- [ ] Graceful handling when no scheduling URL set

### Phase 4 Tests
- [ ] Bio saves with 240 char limit enforced
- [ ] Tags save as comma-separated array
- [ ] Fields display correctly on recruiter view

### Phase 5 Tests
- [ ] Autocomplete shows suggestions as user types
- [ ] Selecting suggestion populates field
- [ ] Can still enter custom values not in suggestions
- [ ] Debounce prevents API spam

### Phase 6 Tests
- [ ] Blocked words prevent form submission
- [ ] Error message is user-friendly
- [ ] Word boundary check avoids false positives ("class" != "ass")
- [ ] Works for all applicable fields
