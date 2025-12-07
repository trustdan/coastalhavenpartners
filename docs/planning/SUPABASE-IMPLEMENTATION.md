# Supabase Implementation Guide

## Why Supabase > Bubble.io

Instead of clicking through Bubble's UI builder, we'll **vibe code** the entire Coastal Haven Partners platform using:

- **Next.js App Router** (same stack as marketing site)
- **Supabase** (Postgres + Auth + Real-time)
- **TypeScript** (end-to-end type safety)
- **Tailwind CSS** (consistent styling)
- **Vercel** (one-click deployment)

**Time to MVP**: 2-3 hours vs 6-8 hours in Bubble
**Developer Experience**: Write code vs click dropdowns
**Control**: Full customization vs Bubble constraints

---

## Architecture Overview

```
coastalhavenpartners/
├── apps/www/                          # Existing marketing site
│   ├── app/
│   │   ├── (marketing)/               # Public pages
│   │   │   └── page.tsx               # Landing page
│   │   ├── (auth)/                    # NEW: Auth pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── verify-email/
│   │   ├── (portal)/                  # NEW: Protected portal
│   │   │   ├── candidate/             # Student dashboard
│   │   │   │   ├── page.tsx           # Profile + status
│   │   │   │   └── onboarding/
│   │   │   └── recruiter/             # Recruiter dashboard
│   │   │       ├── page.tsx           # Candidate table
│   │   │       └── candidates/[id]/
│   │   └── api/                       # NEW: API routes
│   │       └── supabase/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser Supabase client
│   │   │   ├── server.ts              # Server-side client
│   │   │   └── middleware.ts          # Auth middleware
│   │   └── types/
│   │       └── database.types.ts      # Auto-generated types
│   └── middleware.ts                  # Route protection
```

### Deployment

- **Marketing**: `www.coastalhavenpartners.com` (Vercel)
- **Portal**: `/candidate` and `/recruiter` routes in same app
- **Database**: Supabase hosted Postgres
- **Auth**: Supabase Auth (email verification built-in)

---

## Phase 1: Supabase Setup (5 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `coastal-haven-partners`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait 2 minutes for provisioning

### 1.2 Get Environment Variables

In your Supabase project dashboard:

1. Go to **Settings → API**
2. Copy these values:

```bash
# apps/www/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Add to `.env.local` in `apps/www/`

### 1.3 Install Dependencies

```bash
# From project root
cd apps/www
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D @supabase/cli
```

---

## Phase 2: Database Schema (15 minutes)

### 2.1 Initialize Supabase Locally

```bash
# From apps/www
pnpm supabase init
pnpm supabase login
pnpm supabase link --project-ref xxxxx  # Get ref from dashboard URL
```

### 2.2 Create Migration File

```bash
pnpm supabase migration new initial_schema
```

This creates `supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql`

### 2.3 Database Schema

Edit the migration file:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE candidate_status AS ENUM ('pending_verification', 'verified', 'active', 'placed', 'rejected');
CREATE TYPE education_level AS ENUM ('bachelors', 'masters', 'mba', 'phd');

-- =============================================
-- TABLES
-- =============================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'candidate',
  full_name TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Profiles
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Education
  school_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  major TEXT NOT NULL,
  gpa DECIMAL(3, 2) NOT NULL CHECK (gpa >= 0 AND gpa <= 4.0),
  education_level education_level DEFAULT 'bachelors',

  -- Professional
  resume_url TEXT,
  transcript_url TEXT,
  target_roles TEXT[], -- ['IB', 'PE', 'VC', 'Consulting']
  preferred_locations TEXT[], -- ['NYC', 'SF', 'Chicago']

  -- Verification
  status candidate_status DEFAULT 'pending_verification',
  email_verified BOOLEAN DEFAULT FALSE,
  gpa_verified BOOLEAN DEFAULT FALSE,
  school_verified BOOLEAN DEFAULT FALSE,

  -- Metadata
  notes TEXT, -- Recruiter notes
  tags TEXT[], -- Searchable tags
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recruiter Profiles
CREATE TABLE public.recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Firm Details
  firm_name TEXT NOT NULL,
  firm_type TEXT, -- 'Investment Bank', 'PE', 'VC', 'Consulting'
  job_title TEXT NOT NULL,

  -- Access Control
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate-Recruiter Interactions
CREATE TABLE public.candidate_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,

  interaction_type TEXT NOT NULL, -- 'viewed', 'contacted', 'interviewed', 'offered'
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_candidate_status ON public.candidate_profiles(status);
CREATE INDEX idx_candidate_gpa ON public.candidate_profiles(gpa);
CREATE INDEX idx_candidate_graduation_year ON public.candidate_profiles(graduation_year);
CREATE INDEX idx_candidate_email_verified ON public.candidate_profiles(email_verified);
CREATE INDEX idx_recruiter_approved ON public.recruiter_profiles(is_approved);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Candidate Profiles: Candidates can manage their own, recruiters can view verified
CREATE POLICY "Candidates can view their own profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Candidates can update their own profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can view verified candidates"
  ON public.candidate_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles
      WHERE user_id = auth.uid() AND is_approved = TRUE
    )
    AND status = 'verified'
  );

-- Recruiter Profiles: Recruiters manage their own
CREATE POLICY "Recruiters can view their own profile"
  ON public.recruiter_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can update their own profile"
  ON public.recruiter_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Interactions: Recruiters can create, candidates can view their own
CREATE POLICY "Recruiters can create interactions"
  ON public.candidate_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles
      WHERE user_id = auth.uid() AND is_approved = TRUE
    )
  );

CREATE POLICY "Candidates can view their interactions"
  ON public.candidate_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles
      WHERE id = candidate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view their interactions"
  ON public.candidate_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles
      WHERE id = recruiter_id AND user_id = auth.uid()
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiter_profiles_updated_at BEFORE UPDATE ON public.recruiter_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.4 Push Migration to Supabase

```bash
# Apply migration to remote database
pnpm supabase db push

# Generate TypeScript types
pnpm supabase gen types typescript --local > lib/types/database.types.ts
```

---

## Phase 3: Supabase Client Setup (10 minutes)

### 3.1 Browser Client

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3.2 Server Client

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle middleware context where cookies can't be set
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle middleware context
          }
        },
      },
    }
  )
}
```

### 3.3 Middleware for Auth

Create `middleware.ts` in `apps/www/`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /candidate and /recruiter routes
  if (request.nextUrl.pathname.startsWith('/candidate') ||
      request.nextUrl.pathname.startsWith('/recruiter')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) {
    if (user) {
      // Check user role and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'candidate') {
        return NextResponse.redirect(new URL('/candidate', request.url))
      } else if (profile?.role === 'recruiter') {
        return NextResponse.redirect(new URL('/recruiter', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/candidate/:path*',
    '/recruiter/:path*',
    '/login',
    '/signup',
  ],
}
```

---

## Phase 4: Authentication Pages (30 minutes)

### 4.1 Signup Page for Candidates

Create `app/(auth)/signup/candidate/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function CandidateSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const schoolName = formData.get('schoolName') as string
    const major = formData.get('major') as string
    const gpa = parseFloat(formData.get('gpa') as string)
    const graduationYear = parseInt(formData.get('graduationYear') as string)

    // Validate GPA
    if (gpa < 3.5) {
      setError('Minimum GPA requirement is 3.5')
      setLoading(false)
      return
    }

    try {
      // Step 1: Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'candidate',
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      })

      if (authError) throw authError

      // Step 2: Create candidate profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('candidate_profiles')
          .insert({
            user_id: authData.user.id,
            school_name: schoolName,
            major,
            gpa,
            graduation_year: graduationYear,
            status: 'pending_verification',
          })

        if (profileError) throw profileError

        // Redirect to email verification page
        router.push('/verify-email')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join Coastal Haven</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Elite finance talent network
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="John Smith"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@upenn.edu"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          <div>
            <Label htmlFor="schoolName">University</Label>
            <Input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              placeholder="University of Pennsylvania"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                name="major"
                type="text"
                required
                placeholder="Finance"
              />
            </div>
            <div>
              <Label htmlFor="graduationYear">Grad Year</Label>
              <Input
                id="graduationYear"
                name="graduationYear"
                type="number"
                required
                min={2024}
                max={2030}
                placeholder="2026"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gpa">GPA (Min 3.5)</Label>
            <Input
              id="gpa"
              name="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              required
              placeholder="3.85"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

### 4.2 Login Page

Create `app/(auth)/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user role and redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'candidate') {
        router.push('/candidate')
      } else if (profile?.role === 'recruiter') {
        router.push('/recruiter')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Log in to your Coastal Haven account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@upenn.edu"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link href="/signup/candidate" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
```

### 4.3 Email Verification Page

Create `app/(auth)/verify-email/page.tsx`:

```typescript
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 text-center shadow-lg dark:bg-neutral-950">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          We've sent a verification link to your email address. Click the link to verify your account and get started.
        </p>

        <div className="rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
          <p className="font-medium">Didn't receive the email?</p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 5: Candidate Dashboard (45 minutes)

### 5.1 Candidate Dashboard Layout

Create `app/(portal)/candidate/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a candidate
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate') {
    redirect('/login')
  }

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <nav className="border-b bg-white dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/candidate" className="text-xl font-bold">
            Coastal Haven Partners
          </Link>
          <form action={handleLogout}>
            <Button type="submit" variant="outline" size="sm">
              Log Out
            </Button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
```

### 5.2 Candidate Dashboard Page

Create `app/(portal)/candidate/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CandidateDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch candidate profile
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) {
    return <div>Profile not found</div>
  }

  const statusColors = {
    pending_verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20',
    verified: 'bg-green-100 text-green-800 dark:bg-green-900/20',
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20',
    placed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {candidateProfile.profiles?.full_name}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your candidate dashboard
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Application Status</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {candidateProfile.status === 'pending_verification' &&
                'We are reviewing your application'}
              {candidateProfile.status === 'verified' &&
                'Your profile is verified and visible to recruiters'}
              {candidateProfile.status === 'active' &&
                'Recruiters are viewing your profile'}
              {candidateProfile.status === 'placed' &&
                'Congratulations on your placement!'}
            </p>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${statusColors[candidateProfile.status]}`}>
            {candidateProfile.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {!candidateProfile.email_verified && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Please verify your email to complete your profile
            </p>
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">School</p>
            <p className="mt-1 font-medium">{candidateProfile.school_name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Major</p>
            <p className="mt-1 font-medium">{candidateProfile.major}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">GPA</p>
            <p className="mt-1 font-medium">{candidateProfile.gpa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Graduation Year</p>
            <p className="mt-1 font-medium">{candidateProfile.graduation_year}</p>
          </div>
        </div>

        <div className="mt-6">
          <Button asChild>
            <Link href="/candidate/edit-profile">Edit Profile</Link>
          </Button>
        </div>
      </div>

      {/* Next Steps */}
      {candidateProfile.status === 'pending_verification' && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">Next Steps</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <div>
                <p className="font-medium">Upload your resume</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Help recruiters understand your experience
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <div>
                <p className="font-medium">Upload your transcript</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Verify your GPA and academic performance
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <div>
                <p className="font-medium">Complete your profile</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Add target roles and preferred locations
                </p>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
```

---

## Phase 6: Recruiter Dashboard (45 minutes)

### 6.1 Recruiter Dashboard Layout

Create `app/(portal)/recruiter/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a recruiter
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'recruiter') {
    redirect('/login')
  }

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <nav className="border-b bg-white dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/recruiter" className="text-xl font-bold">
            Coastal Haven Partners - Recruiter Portal
          </Link>
          <form action={handleLogout}>
            <Button type="submit" variant="outline" size="sm">
              Log Out
            </Button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
```

### 6.2 Recruiter Dashboard Page (Candidate Table)

Create `app/(portal)/recruiter/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RecruiterDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if recruiter is approved
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
        <h1 className="text-2xl font-bold">Pending Approval</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your recruiter account is pending approval. We'll notify you once it's ready.
        </p>
      </div>
    )
  }

  // Fetch verified candidates
  const { data: candidates } = await supabase
    .from('candidate_profiles')
    .select(`
      id,
      school_name,
      major,
      gpa,
      graduation_year,
      target_roles,
      preferred_locations,
      status,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('status', 'verified')
    .order('gpa', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Candidate Pool</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {candidates?.length || 0} verified candidates
        </p>
      </div>

      {/* Filters (TODO: Add filters in next phase) */}
      <div className="rounded-xl border bg-white p-4 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Filters coming soon (GPA, School, Major, Grad Year)
        </p>
      </div>

      {/* Candidate Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        <table className="w-full">
          <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">School</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
              <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {candidates?.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{candidate.profiles?.full_name}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {candidate.profiles?.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{candidate.school_name}</td>
                <td className="px-6 py-4 text-sm">{candidate.major}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20">
                    {candidate.gpa.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/recruiter/candidates/${candidate.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!candidates || candidates.length === 0 && (
          <div className="p-8 text-center text-neutral-600 dark:text-neutral-400">
            No candidates found
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Phase 7: Deployment (15 minutes)

### 7.1 Configure Supabase for Production

In Supabase dashboard:

1. **Authentication Settings** → Email:
   - Enable email confirmation
   - Set confirmation URL: `https://coastalhavenpartners.com/verify-email`

2. **URL Configuration**:
   - Site URL: `https://coastalhavenpartners.com`
   - Redirect URLs: Add `https://coastalhavenpartners.com/**`

### 7.2 Deploy to Vercel

```bash
# From project root
pnpm build  # Test production build locally

# Push to GitHub
git add .
git commit -m "Add Supabase auth and portal"
git push

# In Vercel dashboard:
# 1. Import repo
# 2. Set root directory to apps/www
# 3. Add environment variables:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
#    - NEXT_PUBLIC_APP_URL
# 4. Deploy
```

### 7.3 Post-Deployment Checklist

- [ ] Test signup flow (candidate)
- [ ] Test email verification
- [ ] Test login
- [ ] Test candidate dashboard
- [ ] Test recruiter signup (if implemented)
- [ ] Test recruiter dashboard
- [ ] Verify RLS policies are working (can't access other users' data)
- [ ] Check Supabase logs for errors

---

## Next Steps

### Priority 1: File Uploads (Resume/Transcript)
- Use Supabase Storage for PDF uploads
- Add upload UI to candidate dashboard
- Trigger verification workflow when files uploaded

### Priority 2: Recruiter Approval Workflow
- Admin dashboard to approve recruiters
- Email notifications for approval

### Priority 3: Advanced Filters
- Filter candidates by GPA, school, major, grad year
- Search functionality
- Save searches

### Priority 4: Analytics
- Track profile views
- Candidate engagement metrics
- Recruiter activity

---

## Common Commands Reference

```bash
# Development
pnpm dev                              # Start Next.js dev server

# Database
pnpm supabase db push                 # Push migrations to remote
pnpm supabase db pull                 # Pull schema from remote
pnpm supabase gen types typescript    # Regenerate TypeScript types

# Production
pnpm build                            # Build for production
pnpm start                            # Start production server
```

---

## Debugging Tips

### RLS Policies Not Working?
```sql
-- Check policies in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'candidate_profiles';

-- Test as specific user
SELECT auth.uid();  -- Get current user ID
```

### TypeScript Errors?
```bash
# Regenerate types after schema changes
pnpm supabase gen types typescript --local > lib/types/database.types.ts
```

### Auth Not Redirecting?
- Check middleware.ts matchers
- Verify environment variables are set
- Check browser console for errors

---

## Comparison: Bubble vs Supabase

| Feature | Bubble.io | Supabase + Next.js |
|---------|-----------|-------------------|
| Time to MVP | 6-8 hours | 2-3 hours |
| Customization | Limited | Full control |
| Performance | Slow page loads | Fast (static + SSR) |
| Hosting Cost | $29+/month | Free (Vercel + Supabase free tier) |
| Developer Experience | Point-and-click | Write code |
| TypeScript | No | Yes |
| Version Control | No | Git |
| Testing | Manual | Automated |

**Winner**: Supabase + Next.js for developers who can code.

---

Ready to ship! 🚀
