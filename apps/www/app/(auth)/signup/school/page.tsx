'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createSchoolProfile } from './actions'

export default function SchoolSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const supabase = createClient()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const schoolName = formData.get('schoolName') as string
    const schoolDomain = formData.get('schoolDomain') as string
    const departmentName = formData.get('departmentName') as string
    const contactEmail = formData.get('contactEmail') as string

    try {
      // Step 1: Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'school_admin',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      // Step 2: Create school profile using server action (bypasses RLS)
      if (authData.user) {
        await createSchoolProfile({
          userId: authData.user.id,
          email,
          fullName,
          schoolName,
          schoolDomain,
          departmentName,
          contactEmail,
        })

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
          <h1 className="text-3xl font-bold">Career Services Sign Up</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Connect your students with top employers
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="fullName">Your Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="jane@university.edu"
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
              placeholder="At least 8 characters"
            />
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-4">School Information</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  required
                  placeholder="Harvard University"
                />
              </div>

              <div>
                <Label htmlFor="schoolDomain">School Email Domain</Label>
                <Input
                  id="schoolDomain"
                  name="schoolDomain"
                  type="text"
                  required
                  placeholder="harvard.edu"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Used to verify student email addresses
                </p>
              </div>

              <div>
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  name="departmentName"
                  type="text"
                  required
                  placeholder="Career Services Center"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Department Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  placeholder="careers@university.edu"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create School Account'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center text-sm">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you a student?{' '}
            <Link href="/signup/candidate" className="font-medium text-blue-600 hover:underline">
              Sign up as a candidate
            </Link>
          </p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Are you a recruiter?{' '}
            <Link href="/signup/recruiter" className="font-medium text-blue-600 hover:underline">
              Sign up as a recruiter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
