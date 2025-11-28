'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle } from 'lucide-react'
import { MFAEnrollmentComponent } from '@/components/auth/mfa-enrollment'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminMFARequiredPage() {
  const router = useRouter()
  const [showEnrollment, setShowEnrollment] = useState(false)

  function handleEnrollmentSuccess() {
    setShowEnrollment(false)
    // Redirect to admin dashboard after MFA setup
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900">
            <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Two-Factor Authentication Required</h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            As an admin, you must enable two-factor authentication to access the admin dashboard. This helps protect sensitive data and user information.
          </p>
        </div>

        <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
          <h3 className="flex items-center gap-2 font-medium">
            <Shield className="h-5 w-5 text-blue-500" />
            Why is 2FA required?
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <li>- Protects against unauthorized access to admin features</li>
            <li>- Secures user data and platform integrity</li>
            <li>- Industry best practice for admin accounts</li>
          </ul>
        </div>

        <Button className="w-full" onClick={() => setShowEnrollment(true)}>
          <Shield className="mr-2 h-4 w-4" />
          Set Up Two-Factor Authentication
        </Button>

        <p className="text-center text-xs text-neutral-500">
          You&apos;ll need an authenticator app like Google Authenticator, Authy, or 1Password.
        </p>
      </div>

      <Dialog open={showEnrollment} onOpenChange={setShowEnrollment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Protect your admin account with an authenticator app.
            </DialogDescription>
          </DialogHeader>
          <MFAEnrollmentComponent
            onSuccess={handleEnrollmentSuccess}
            onCancel={() => setShowEnrollment(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
