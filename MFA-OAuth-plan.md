# MFA & Google OAuth Implementation Plan

This document outlines the step-by-step implementation of Multi-Factor Authentication (TOTP) and Google OAuth for Coastal Haven Partners.

---

## Overview

| Feature | Status | Priority |
|---------|--------|----------|
| Google OAuth | ✅ Complete | High |
| MFA (TOTP) | ✅ Complete | High |

**Estimated Total Time:** 4-6 hours

---

## Prerequisites

- [x] Access to [Supabase Dashboard](https://supabase.com/dashboard/project/pstjxdrneytefheqhreo)
- [x] Access to [Google Cloud Console](https://console.cloud.google.com/)
- [x] Local dev environment running (`pnpm dev`)

---

## Part 1: Google OAuth

### 1.1 Google Cloud Console Setup

- [x] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [x] Create a new project or select existing one
- [x] Navigate to **APIs & Services → Credentials**
- [x] Click **Create Credentials → OAuth 2.0 Client IDs**
- [x] Configure OAuth consent screen:
  - App name: `Coastal Haven Partners`
  - User support email: (your email)
  - Authorized domains: `coastalhavenpartners.com` (and any staging domains)
  - Developer contact: (your email)
- [x] Create OAuth 2.0 Client ID:
  - Application type: **Web application**
  - Name: `Coastal Haven Partners - Supabase`
  - Authorized redirect URIs:
    ```
    https://pstjxdrneytefheqhreo.supabase.co/auth/v1/callback
    ```
- [x] Copy **Client ID** and **Client Secret**

### 1.2 Supabase Dashboard Configuration

- [x] Go to Supabase Dashboard → **Authentication → Providers**
- [x] Find **Google** and enable it
- [x] Paste Client ID and Client Secret from Google
- [x] Save configuration

### 1.3 Update Login Page

**File:** `apps/www/app/(auth)/login/page.tsx`

- [x] Add Google sign-in button component
- [x] Implement `signInWithGoogle()` function
- [x] Add visual separator ("or continue with")
- [x] Style to match existing Discord button pattern

### 1.4 Update Signup Pages

- [x] Add Google OAuth option to candidate signup (`apps/www/app/(auth)/signup/candidate/page.tsx`)
- [x] Add Google OAuth option to recruiter signup (`apps/www/app/(auth)/signup/recruiter/page.tsx`)
- [x] Add Google OAuth option to school signup (`apps/www/app/(auth)/signup/school/page.tsx`)

### 1.5 Handle OAuth Callback for New Users

**File:** `apps/www/app/(auth)/auth/callback/route.ts`

- [x] Detect if user is new (no profile in `profiles` table)
- [x] If new user via OAuth, redirect to role selection/profile completion
- [x] Create intermediate page for OAuth users to select their role and complete profile

**Created files:**

- `apps/www/app/(auth)/complete-profile/page.tsx` - Role selection
- `apps/www/app/(auth)/complete-profile/candidate/page.tsx` - Candidate profile completion
- `apps/www/app/(auth)/complete-profile/recruiter/page.tsx` - Recruiter profile completion
- `apps/www/app/(auth)/complete-profile/school/page.tsx` - School admin profile completion

### 1.6 Testing

- [ ] Test Google sign-in for existing users
- [ ] Test Google sign-up for new users (all 3 roles)
- [ ] Verify role-based redirects work correctly
- [ ] Test error handling (cancelled auth, etc.)

---

## Part 2: Multi-Factor Authentication (TOTP)

### 2.1 Supabase Dashboard Configuration

- [x] Go to Supabase Dashboard → **Authentication → Multi-Factor Authentication**
- [x] Enable TOTP MFA
- [x] Note any configuration options

### 2.2 Create MFA Types

**File:** `apps/www/lib/types/mfa.ts`

- [x] Create TypeScript types for MFA state

### 2.3 Create MFA Enrollment Component

**File:** `apps/www/components/auth/mfa-enrollment.tsx`

- [x] Create component that:
  - Calls `supabase.auth.mfa.enroll({ factorType: 'totp' })`
  - Displays QR code for authenticator app
  - Shows manual entry secret as fallback
  - Has input field for verification code
  - Calls `supabase.auth.mfa.verify()` to confirm

### 2.4 Create MFA Challenge Component

**File:** `apps/www/components/auth/mfa-challenge.tsx`

- [x] Create component for MFA verification during login:
  - Input field for 6-digit TOTP code
  - Submit button
  - Calls `supabase.auth.mfa.challengeAndVerify()`

### 2.5 Update Login Flow

**File:** `apps/www/app/(auth)/login/page.tsx`

- [x] After successful password auth, check MFA status
- [x] Conditionally render MFA challenge component
- [x] Only redirect to dashboard after MFA verified

### 2.6 Create MFA Settings Component

**File:** `apps/www/components/auth/mfa-settings.tsx`

- [x] Create security settings component with:
  - MFA status indicator (enabled/disabled)
  - "Enable MFA" button → shows enrollment flow in dialog
  - "Disable MFA" button (requires current TOTP code)
  - Admin protection (cannot disable if isAdmin=true)

### 2.7 Add MFA Settings to User Dashboards

- [x] Add MFA settings to candidate edit-profile page
- [x] Add MFA settings to recruiter settings page
- [x] Add MFA settings to school admin settings page
- [x] Admin dashboard has separate MFA enforcement

### 2.8 Update Middleware for Admin MFA Enforcement

**File:** `apps/www/middleware.ts`

- [x] Check if admin has MFA enabled
- [x] Redirect to /admin/mfa-required if admin lacks MFA
- [x] Check AAL level and redirect to /mfa-verify if needed

### 2.9 Create MFA Verification Page

**File:** `apps/www/app/(auth)/mfa-verify/page.tsx`

- [x] Standalone page for MFA challenge
- [x] Used when middleware detects incomplete MFA
- [x] Redirects to intended destination after verification

### 2.10 Create First-Login MFA Prompt

**File:** `apps/www/components/auth/mfa-prompt-banner.tsx`

- [x] Create dismissible banner for non-MFA users
- [x] Add to candidate layout
- [x] Add to recruiter layout
- [x] Add to school layout

### 2.11 Testing

- [ ] Test MFA enrollment flow
- [ ] Test MFA challenge during login
- [ ] Test MFA with Google Authenticator / Authy
- [ ] Test disabling MFA
- [ ] Test middleware AAL enforcement
- [ ] Test admin MFA requirement

---

## Part 3: UI Components

### 3.1 Shared Components Needed

- [ ] `components/ui/oauth-button.tsx` - Styled OAuth provider button
- [ ] `components/ui/divider-with-text.tsx` - "or continue with" divider
- [ ] `components/ui/totp-input.tsx` - 6-digit code input (optional, could use regular input)

### 3.2 Icons Needed

- [ ] Google logo SVG for OAuth button
- [ ] Shield/lock icon for MFA settings

---

## Part 4: Environment Variables

### 4.1 New Variables (if any)

```bash
# Usually not needed - Supabase handles Google OAuth internally
# But document any new vars here if required
```

---

## Part 5: Database Changes

### 5.1 Schema Updates (if any)

- [ ] Review if any custom MFA tracking is needed
- [ ] Supabase handles MFA factors internally in `auth.mfa_factors` table

---

## Part 6: Documentation

- [ ] Update CLAUDE.md with new auth features
- [ ] Add user-facing help docs for MFA setup
- [ ] Document recovery procedures

---

## Implementation Order

Recommended sequence:

1. **Google OAuth** (simpler, builds on existing patterns)
   - 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6

2. **MFA Core** (enrollment and challenge)
   - 2.1 → 2.2 → 2.3 → 2.4 → 2.5

3. **MFA Settings & Polish**
   - 2.6 → 2.7 → 2.8 → 2.9 → 2.10

4. **Final Testing & Cleanup**
   - Part 6

---

## Notes & Decisions

### Decisions Made

- [x] **MFA required for admins?** → YES - Admins must have MFA enabled
- [x] **Prompt users to enable MFA?** → YES - Show prompt after first login
- [x] **SMS MFA in addition to TOTP?** → NO - TOTP only (cost not worth it)

### Technical Decisions

- Using Supabase's built-in MFA (no external service like Twilio for SMS)
- TOTP only (authenticator apps like Google Authenticator, Authy, 1Password)
- Backup codes stored securely by Supabase
- Admin role requires MFA - enforced in middleware
- First-login MFA prompt for all users (dismissible for non-admins)

---

## Progress Log

| Date | Task Completed | Notes |
|------|----------------|-------|
| 2025-11-27 | Google OAuth implementation | Login, signup pages, complete-profile flow for new OAuth users |
| 2025-11-27 | MFA TOTP implementation | Enrollment, challenge, settings components |
| 2025-11-27 | Admin MFA enforcement | Middleware checks, /admin/mfa-required page |
| 2025-11-27 | MFA prompt banner | Added to all portal layouts |

