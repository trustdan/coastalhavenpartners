# Testing Guide - Coastal Haven Partners

This guide walks through testing all features we've built in Phases 1-6.

## Prerequisites

1. **Dev server running**: `pnpm dev`
2. **Supabase project**: Database migrations applied
3. **Environment variables**: `.env.local` configured

---

## Test 1: Candidate Signup & Email Verification ✓

### Steps:
1. Go to http://localhost:3000/signup/candidate
2. Fill in the form:
   - Full Name: "Test Candidate"
   - Email: Use a real email you can access
   - Password: "testpass123"
   - University: "MIT"
   - Major: "Computer Science"
   - Grad Year: "2026"
   - GPA: "3.75"
3. Click "Sign Up"

### Expected Results:
- ✓ Form submits successfully
- ✓ Redirects to "Check Your Email" page
- ✓ Email received with verification link
- ✓ Clicking verification link logs you in automatically
- ✓ Redirects to `/candidate` dashboard
- ✓ Dashboard shows "PENDING VERIFICATION" status
- ✓ No "verify your email" warning (email is verified)

### Database Check:
```sql
-- Should show 1 row for your test candidate
SELECT * FROM candidate_profiles
WHERE school_name = 'MIT';

-- Should show status = 'pending_verification'
SELECT status FROM candidate_profiles
WHERE school_name = 'MIT';
```

---

## Test 2: Candidate Dashboard Features ✓

### Steps:
1. While logged in as candidate, view dashboard at http://localhost:3000/candidate
2. Check all sections are visible

### Expected Results:
- ✓ Welcome message with your name
- ✓ Application Status card showing "PENDING VERIFICATION" (yellow badge)
- ✓ Status message: "We are reviewing your application"
- ✓ Your Profile card showing:
  - Email
  - School (MIT)
  - Major (Computer Science)
  - GPA (3.75)
  - Graduation Year (2026)
  - Education Level (Bachelors)
- ✓ Next Steps section with 3 items:
  1. Upload your resume
  2. Upload your transcript
  3. Complete your profile
- ✓ Edit Profile button (not functional yet)

---

## Test 3: Candidate Login & Logout ✓

### Steps:
1. Click "Log Out" in navbar
2. Should redirect to `/login`
3. Try to access http://localhost:3000/candidate
4. Should redirect to `/login` (middleware protection)
5. Log back in with your candidate credentials
6. Should redirect to `/candidate` dashboard automatically

### Expected Results:
- ✓ Logout redirects to login page
- ✓ Protected routes redirect unauthenticated users
- ✓ Login redirects to correct dashboard based on role

---

## Test 4: Recruiter Signup & Email Verification ✓

### Steps:
1. Log out if logged in
2. Go to http://localhost:3000/signup/recruiter
3. Fill in the form:
   - Full Name: "Test Recruiter"
   - Work Email: Use different email than candidate
   - Password: "testpass123"
   - Firm Name: "Goldman Sachs"
   - Firm Type: "Investment Bank"
   - Job Title: "Campus Recruiter"
4. Click "Sign Up"

### Expected Results:
- ✓ Form submits successfully
- ✓ Redirects to "Check Your Email" page
- ✓ Email received with verification link
- ✓ Clicking verification link logs you in automatically
- ✓ Redirects to `/recruiter` dashboard
- ✓ Dashboard shows "Pending Approval" message

### Database Check:
```sql
-- Should show 1 row for your test recruiter
SELECT * FROM recruiter_profiles
WHERE firm_name = 'Goldman Sachs';

-- Should show is_approved = false
SELECT is_approved FROM recruiter_profiles
WHERE firm_name = 'Goldman Sachs';
```

---

## Test 5: Recruiter Approval Flow ✓

### Steps:
1. While logged in as recruiter, you should see "Pending Approval" screen
2. Run this SQL in Supabase to approve yourself:

```sql
UPDATE recruiter_profiles
SET is_approved = true
WHERE firm_name = 'Goldman Sachs';
```

3. Refresh the `/recruiter` page

### Expected Results:
- ✓ Before approval: "Pending Approval" screen with explanation
- ✓ After approval + refresh: Candidate table visible
- ✓ Table header shows: Name, School, Major, GPA, Grad Year, Target Roles, Actions
- ✓ Table is empty (no verified candidates yet)
- ✓ Message: "No verified candidates found"

---

## Test 6: Candidate Verification & Visibility ✓

### Steps:
1. Run this SQL to verify your test candidate:

```sql
UPDATE candidate_profiles
SET status = 'verified'
WHERE school_name = 'MIT';
```

2. As recruiter, refresh `/recruiter` dashboard

### Expected Results:
- ✓ Candidate now appears in table
- ✓ Shows candidate name, email, MIT, Computer Science, 3.75 GPA, 2026
- ✓ GPA shown in green badge
- ✓ "View Profile" link present (will be 404 for now)
- ✓ Header shows "1 verified candidates available"

---

## Test 7: Row-Level Security (RLS) Policies ✓

### Test A: Candidates can't see other candidates

1. Log in as candidate
2. Open browser console
3. Try to query another candidate's profile:

```javascript
const { data } = await supabase
  .from('candidate_profiles')
  .select('*')

console.log(data) // Should only show YOUR profile
```

### Test B: Unapproved recruiters can't see candidates

1. Create another recruiter (don't approve)
2. Log in as unapproved recruiter
3. Should see "Pending Approval" screen
4. Cannot access candidate table

### Test C: Approved recruiters can only see verified candidates

1. As approved recruiter, check the candidate table
2. Should only see candidates with status = 'verified'
3. Change a candidate back to 'pending_verification':

```sql
UPDATE candidate_profiles
SET status = 'pending_verification'
WHERE school_name = 'MIT';
```

4. Refresh recruiter dashboard
5. Candidate should disappear from table

---

## Test 8: Middleware Route Protection ✓

### Test redirects by visiting these URLs directly:

| URL | Not Logged In | Logged In as Candidate | Logged In as Recruiter |
|-----|---------------|------------------------|------------------------|
| `/candidate` | → `/login` | ✓ Dashboard | → `/login` |
| `/recruiter` | → `/login` | → `/login` | ✓ Dashboard |
| `/login` | ✓ Login page | → `/candidate` | → `/recruiter` |
| `/signup/candidate` | ✓ Signup | → `/candidate` | → `/recruiter` |

---

## Test 9: Candidate Status Changes ✓

### Steps:
1. Log in as candidate
2. View dashboard
3. Note the current status
4. Run SQL to change status:

```sql
-- Change to verified
UPDATE candidate_profiles
SET status = 'verified'
WHERE school_name = 'MIT';
```

5. Refresh dashboard

### Expected Results by Status:

**Pending Verification** (Yellow):
- Message: "We are reviewing your application"
- Shows "Next Steps" section

**Verified** (Green):
- Message: "Your profile is verified and visible to recruiters"
- Shows green success message: "Your Profile is Live!"
- No "Next Steps" section

**Active** (Blue):
- Message: "Recruiters are viewing your profile"

**Placed** (Purple):
- Message: "Congratulations on your placement!"

---

## Test 10: Password Reset (Optional)

1. On login page, click "Forgot password?" (not implemented yet)
2. **Future feature**: Should send password reset email

---

## Test 11: Dark Mode (If enabled)

1. Check if theme toggle works
2. Verify all pages render correctly in dark mode
3. Candidate dashboard, recruiter dashboard, auth pages

---

## Test 12: TypeScript Type Safety ✓

### Open any file with Supabase queries and verify:

```typescript
// Should have full autocomplete
const { data } = await supabase
  .from('candidate_profiles') // ← Type: 'candidate_profiles' | 'profiles' | ...
  .select('school_name') // ← Autocomplete: school_name, major, gpa, etc.
```

---

## Common Issues & Fixes

### Issue: RLS Error on Signup
**Fix**: Make sure INSERT policies are added:
```sql
CREATE POLICY "Candidates can create their own profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Issue: Email Verification Not Working
**Fix**: Check Supabase Auth → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### Issue: Candidate Not Visible to Recruiter
**Fix**:
1. Check candidate status is 'verified'
2. Check recruiter is_approved = true
3. Check RLS policies are enabled

### Issue: Middleware Redirecting Incorrectly
**Fix**: Check `middleware.ts` matcher includes correct routes

---

## Success Criteria ✓

All tests should pass with these results:

- [x] Candidate signup works
- [x] Email verification works
- [x] Candidate dashboard displays correctly
- [x] Candidate can log in/out
- [x] Recruiter signup works
- [x] Recruiter sees "Pending Approval" when not approved
- [x] Recruiter sees candidates after approval
- [x] RLS policies prevent unauthorized access
- [x] Middleware protects routes correctly
- [x] Status changes reflect on candidate dashboard
- [x] Only verified candidates visible to recruiters
- [x] TypeScript types work end-to-end

---

## Next Steps After Testing

If all tests pass:
- ✓ Ready for Phase 7: Deployment to Vercel
- ✓ Or add more features (filters, file uploads, etc.)

If any test fails:
- Debug the specific feature
- Check database policies
- Verify environment variables
- Check Supabase logs
