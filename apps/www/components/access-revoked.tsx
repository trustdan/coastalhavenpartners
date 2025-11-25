'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AccessRevokedProps {
  userType: 'candidate' | 'recruiter' | 'school'
  email?: string
}

export function AccessRevoked({ userType, email }: AccessRevokedProps) {
  const typeLabels = {
    candidate: 'candidate',
    recruiter: 'recruiter', 
    school: 'career services'
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
          <svg className="h-8 w-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.536l-.707-.707a1 1 0 00-1.414 0l-4.243 4.243a1 1 0 000 1.414l.707.707a1 1 0 001.414 0l4.243-4.243a1 1 0 000-1.414zM12 9V7m0 0V5m0 2h2m-2 0H10" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold">Account Access Suspended</h1>
        
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Your {typeLabels[userType]} account access has been suspended. This may be due to a policy violation or account review.
        </p>

        <div className="mt-6 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            If you believe this is an error or would like to appeal this decision, please contact our support team.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button asChild className="w-full">
            <a href="mailto:support@coastalhavenpartners.com">
              Contact Support
            </a>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">
              Sign Out
            </Link>
          </Button>
        </div>

        {email && (
          <p className="mt-4 text-xs text-neutral-500">
            Logged in as {email}
          </p>
        )}
      </div>
    </div>
  )
}

