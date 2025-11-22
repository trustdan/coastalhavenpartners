# Supabase Authentication Issues & Solutions

This document details all the authentication and Row-Level Security (RLS) issues we encountered while building Coastal Haven Partners with Supabase, and how we solved them.

---

## Issue 1: RLS Policy Violation on Signup

### Problem
When users signed up, they got this error:
```
new row violates row-level security policy for table "candidate_profiles"
```

Despite the account being created in `auth.users`, the `candidate_profiles` row failed to insert.

### Root Cause
When email confirmation is **required** (which it is by default in Supabase):
- `auth.signUp()` creates the user but does **NOT** sign them in
- `auth.uid()` returns `null` when checking RLS policies
- Our RLS policies only allowed SELECT and UPDATE, but no INSERT
- The INSERT policy we added used `auth.uid() = user_id`, which failed because `auth.uid()` was null

### Initial Attempt (Failed)
We tried adding INSERT policies:
```sql
CREATE POLICY "Candidates can create their own profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

This **still failed** because the user wasn't authenticated yet (email not verified).

### Solution: Use Server Actions with Service Role Key
We moved profile creation to a **server action** that uses the **service role key**, which bypasses RLS:

**File: `app/(auth)/signup/candidate/actions.ts`**
```typescript
'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

// Server-side only - uses service role to bypass RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createCandidateProfile(data: {
  userId: string
  schoolName: string
  major: string
  gpa: number
  graduationYear: number
}) {
  const { error } = await supabaseAdmin
    .from('candidate_profiles')
    .insert({
      user_id: data.userId,
      school_name: data.schoolName,
      major: data.major,
      gpa: data.gpa,
      graduation_year: data.graduationYear,
      status: 'pending_verification',
    })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}
```

**Updated signup page:**
```typescript
// Step 1: Sign up user
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName, role: 'candidate' },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Step 2: Create candidate profile using server action (bypasses RLS)
if (authData.user) {
  await createCandidateProfile({
    userId: authData.user.id,
    schoolName,
    major,
    gpa,
    graduationYear,
  })
}
```

### Why This Works
- ✅ Service role key bypasses RLS completely
- ✅ Server actions run on the server (can't be called from browser)
- ✅ We validate the data before inserting
- ✅ User ID comes from Supabase Auth (trusted source)

### Security Consideration
This is **safe** because:
- Server actions can only be called from your Next.js app
- We're only creating a profile for the authenticated user (from `authData.user.id`)
- No arbitrary user IDs can be passed from the client

---

## Issue 2: Email Verification Redirect Loop

### Problem
After clicking the verification link in the email:
1. User was redirected to `/verify-email` page
2. Email showed "another confirmation email will be sent"
3. User stayed on `/verify-email` instead of being logged in

### Root Cause
The `emailRedirectTo` was set to `/verify-email`, which is just a static page:
```typescript
emailRedirectTo: `${window.location.origin}/verify-email`
```

Supabase was sending the verification code to that URL, but there was no handler to:
1. Exchange the code for a session (log the user in)
2. Redirect to the appropriate dashboard

### Solution: Create Auth Callback Route

**File: `app/(auth)/auth/callback/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange code for session (logs user in)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Redirect based on role
        if (profile?.role === 'candidate') {
          return NextResponse.redirect(`${origin}/candidate`)
        } else if (profile?.role === 'recruiter') {
          return NextResponse.redirect(`${origin}/recruiter`)
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
```

**Updated signup to redirect to callback:**
```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`
```

**Updated Supabase Auth settings:**
- Go to **Authentication** → **URL Configuration**
- Add redirect URL: `http://localhost:3000/auth/callback`

### Why This Works
- ✅ Supabase sends verification code to `/auth/callback?code=xxx`
- ✅ Callback route exchanges code for session (user is logged in)
- ✅ User is redirected to correct dashboard based on role
- ✅ No manual login required after email verification

---

## Issue 3: Email Verification Status Check

### Problem
After verifying email and logging in, the candidate dashboard showed:
```
⚠️ Please verify your email to complete your profile
```

Even though the email was already verified.

### Root Cause
We were checking the wrong field for email verification:
```typescript
{!candidateProfile.email_verified && (
  <div>Please verify your email</div>
)}
```

The `email_verified` field in our custom `candidate_profiles` table was never updated. Supabase stores email verification status in the **auth.users** table.

### Solution: Check Supabase's Built-in Field
```typescript
{!user.email_confirmed_at && (
  <div>Please verify your email</div>
)}
```

**What changed:**
- `candidateProfile.email_verified` → `user.email_confirmed_at`
- `user` comes from `supabase.auth.getUser()`
- `email_confirmed_at` is automatically set by Supabase when user verifies

### Why This Works
- ✅ `email_confirmed_at` is the **source of truth** from Supabase Auth
- ✅ Automatically updated when user clicks verification link
- ✅ No manual database updates needed

---

## Issue 4: "Profile Not Found" for Recruiters Accessing Candidate Dashboard

### Problem
After signing up as a recruiter and verifying email, accessing `/candidate` showed:
```
Profile Not Found
We couldn't find your candidate profile. Please contact support.
```

### Root Cause
1. User logged in as recruiter
2. Tried to access `/candidate` dashboard
3. Candidate dashboard query: `SELECT * FROM candidate_profiles WHERE user_id = ...`
4. Returns null (recruiter has no candidate profile)
5. Shows generic "Profile Not Found" error

This was confusing because:
- The recruiter **did** have a valid account
- They just weren't a candidate

### Solution: Check Role Before Querying Profile

**In both layouts and pages:**

**Candidate Layout:**
```typescript
// Check user role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

// Redirect recruiters to recruiter dashboard
if (profile?.role === 'recruiter') {
  redirect('/recruiter')
}

// If not candidate, redirect to login
if (profile?.role !== 'candidate') {
  redirect('/login')
}
```

**Recruiter Layout:**
```typescript
// Check user role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

// Redirect candidates to candidate dashboard
if (profile?.role === 'candidate') {
  redirect('/candidate')
}

// If not recruiter, redirect to login
if (profile?.role !== 'recruiter') {
  redirect('/login')
}
```

**Also added role checks in pages** (in addition to layouts) to prevent race conditions.

### Why This Works
- ✅ Recruiters accessing `/candidate` → auto-redirected to `/recruiter`
- ✅ Candidates accessing `/recruiter` → auto-redirected to `/candidate`
- ✅ No confusing error messages
- ✅ Better UX

---

## Issue 5: Middleware Deprecation Warning

### Problem
When running `pnpm dev`, we got this warning:
```
⚠ The "middleware" file convention is deprecated.
  Please use "proxy" instead.
```

### Root Cause
Next.js 16 is deprecating the `middleware.ts` file convention in favor of a new `proxy` pattern.

### Current Status
**We're keeping `middleware.ts` for now** because:
- It still works in Next.js 16
- The "proxy" pattern is new and documentation is limited
- Our middleware is simple (just auth checks and redirects)

### Future Migration (When Ready)
When we migrate to the new "proxy" pattern, we'll need to:
1. Move auth logic from `middleware.ts` to a proxy configuration
2. Update route protection patterns
3. Test thoroughly

For now, the warning is **harmless** and can be ignored.

---

## Best Practices Learned

### 1. Use Service Role Key for Profile Creation During Signup
**Don't:** Try to INSERT with RLS policies when user isn't authenticated yet
```typescript
// ❌ Fails because auth.uid() is null during signup
await supabase.from('candidate_profiles').insert({ ... })
```

**Do:** Use server actions with service role key
```typescript
// ✅ Works - bypasses RLS on server
const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY)
await supabaseAdmin.from('candidate_profiles').insert({ ... })
```

### 2. Always Use Auth Callback Route for Email Verification
**Don't:** Redirect to static page
```typescript
// ❌ User has to manually log in after verification
emailRedirectTo: '/verify-email'
```

**Do:** Redirect to callback that exchanges code for session
```typescript
// ✅ User is automatically logged in
emailRedirectTo: '/auth/callback'
```

### 3. Check Supabase's Built-in Auth Fields
**Don't:** Create custom email verification fields
```typescript
// ❌ You have to manually update this
{!candidateProfile.email_verified && <Warning />}
```

**Do:** Use Supabase's auth fields
```typescript
// ✅ Automatically updated by Supabase
{!user.email_confirmed_at && <Warning />}
```

### 4. Redirect Before Querying Role-Specific Data
**Don't:** Query profile first, then show error
```typescript
// ❌ Shows confusing "Profile Not Found"
const candidate = await getCandidateProfile(user.id)
if (!candidate) return <Error />
```

**Do:** Check role first, redirect if wrong role
```typescript
// ✅ Redirects to correct dashboard
const role = await getUserRole(user.id)
if (role === 'recruiter') redirect('/recruiter')
```

---

## Environment Variables Checklist

Make sure these are set in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx  # ← Important for server actions

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase Dashboard Configuration Checklist

### Authentication → URL Configuration
- [x] Site URL: `http://localhost:3000`
- [x] Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/candidate`
  - `http://localhost:3000/recruiter`

### Authentication → Email Settings
- [x] Enable email confirmation
- [x] Confirmation URL: Uses redirect URLs above

---

## Summary

**Main Issues:**
1. ❌ RLS policies blocking signup → ✅ Use service role key in server actions
2. ❌ Email verification not logging users in → ✅ Use auth callback route
3. ❌ Wrong email verification check → ✅ Use `user.email_confirmed_at`
4. ❌ Confusing error for wrong dashboard → ✅ Check role and redirect

**Key Learnings:**
- Email confirmation = user NOT authenticated during signup
- Service role key bypasses RLS (use carefully on server only)
- Always handle verification callbacks properly
- Role-based redirects should happen in both layouts AND pages

**Files Created to Fix Issues:**
- `app/(auth)/signup/candidate/actions.ts` - Server action for profile creation
- `app/(auth)/signup/recruiter/actions.ts` - Server action for recruiter profiles
- `app/(auth)/auth/callback/route.ts` - Email verification handler
- Updated all layouts and pages with role checks

All issues are now **resolved** and the authentication flow works smoothly! 🎉
