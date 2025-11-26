'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, Building2, School } from 'lucide-react'

export default function SignupLandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Back to Home
      </Link>
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Join Coastal Haven Partners</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Student Card */}
          <Link
            href="/signup/candidate"
            className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 bg-white p-8 shadow-sm transition-all hover:border-blue-500 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-blue-500"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold">I'm a Student</h2>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              Create a verified profile and connect with elite finance recruiters from top firms.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Free forever
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                GPA verification
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Browse recruiters
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Profile analytics
              </li>
            </ul>
            <Button className="w-full group-hover:bg-blue-600">
              Sign Up as Student
            </Button>
          </Link>

          {/* Recruiter Card */}
          <Link
            href="/signup/recruiter"
            className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 bg-white p-8 shadow-sm transition-all hover:border-green-500 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-green-500"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold">I'm a Recruiter</h2>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              Access verified talent from top schools and streamline your recruiting pipeline.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                GPA-verified candidates
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                Advanced filters
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                Direct messaging
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">✓</span>
                Analytics dashboard
              </li>
            </ul>
            <Button className="w-full group-hover:bg-green-600">
              Sign Up as Recruiter
            </Button>
          </Link>

          {/* School Card */}
          <Link
            href="/signup/school"
            className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 bg-white p-8 shadow-sm transition-all hover:border-purple-500 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-purple-500"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <School className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold">I'm Career Services</h2>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              Track student placements and connect them with recruiting partners.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start">
                <span className="mr-2 text-purple-600">✓</span>
                Student tracking
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-600">✓</span>
                Placement analytics
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-600">✓</span>
                Recruiter directory
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-purple-600">✓</span>
                Custom reporting
              </li>
            </ul>
            <Button className="w-full group-hover:bg-purple-600">
              Sign Up as School
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
