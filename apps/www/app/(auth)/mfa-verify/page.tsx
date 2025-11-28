'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MFAChallengeComponent } from '@/components/auth/mfa-challenge'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

function MFAVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  function handleSuccess() {
    router.push(redirectTo)
    router.refresh()
  }

  function handleCancel() {
    // Sign out and redirect to login
    router.push('/login')
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
      <MFAChallengeComponent onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}

function MFAVerifyFallback() {
  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    </div>
  )
}

export default function MFAVerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <Link
        href="/login"
        className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Back to Login
      </Link>
      <Suspense fallback={<MFAVerifyFallback />}>
        <MFAVerifyContent />
      </Suspense>
    </div>
  )
}
