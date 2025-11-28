'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Shield, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react'
import { MFAEnrollmentComponent } from './mfa-enrollment'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MFASettingsProps {
  isAdmin?: boolean
}

export function MFASettings({ isAdmin = false }: MFASettingsProps) {
  const [loading, setLoading] = useState(true)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [disableLoading, setDisableLoading] = useState(false)
  const [disableError, setDisableError] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)

  useEffect(() => {
    checkMFAStatus()
  }, [])

  async function checkMFAStatus() {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verifiedFactor = factors?.totp?.find(f => f.status === 'verified')

      if (verifiedFactor) {
        setMfaEnabled(true)
        setFactorId(verifiedFactor.id)
      } else {
        setMfaEnabled(false)
        setFactorId(null)
      }
    } catch (err) {
      console.error('Failed to check MFA status:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDisableMFA() {
    if (!factorId || disableCode.length !== 6) return

    const supabase = createClient()
    setDisableLoading(true)
    setDisableError(null)

    try {
      // Create and verify a challenge first
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })

      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: disableCode,
      })

      if (verifyError) throw verifyError

      // Now unenroll
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId,
      })

      if (unenrollError) throw unenrollError

      setMfaEnabled(false)
      setFactorId(null)
      setShowDisable(false)
      setDisableCode('')
    } catch (err: any) {
      setDisableError(err.message)
      setDisableCode('')
    } finally {
      setDisableLoading(false)
    }
  }

  function handleEnrollmentSuccess() {
    setMfaEnabled(true)
    setShowEnrollment(false)
    checkMFAStatus() // Refresh to get the factor ID
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          <span className="text-neutral-500">Loading security settings...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-2 ${mfaEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
              {mfaEnabled ? (
                <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <Shield className="h-6 w-6 text-neutral-500" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {mfaEnabled
                  ? 'Your account is protected with two-factor authentication.'
                  : 'Add an extra layer of security to your account.'}
              </p>
              {mfaEnabled && (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                  Enabled via authenticator app
                </p>
              )}
            </div>
          </div>
          <div>
            {mfaEnabled ? (
              <Button
                variant="outline"
                onClick={() => setShowDisable(true)}
                disabled={isAdmin}
                className={isAdmin ? 'cursor-not-allowed opacity-50' : ''}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable
              </Button>
            ) : (
              <Button onClick={() => setShowEnrollment(true)}>
                <Shield className="mr-2 h-4 w-4" />
                Enable 2FA
              </Button>
            )}
          </div>
        </div>

        {isAdmin && mfaEnabled && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Two-factor authentication is required for admin accounts and cannot be disabled.
              </p>
            </div>
          </div>
        )}

        {!mfaEnabled && (
          <div className="mt-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
            <h3 className="text-sm font-medium">Why enable 2FA?</h3>
            <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <li>- Protects your account even if your password is compromised</li>
              <li>- Works with apps like Google Authenticator, Authy, or 1Password</li>
              <li>- Takes less than 2 minutes to set up</li>
            </ul>
          </div>
        )}
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollment} onOpenChange={setShowEnrollment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Protect your account with an authenticator app.
            </DialogDescription>
          </DialogHeader>
          <MFAEnrollmentComponent
            onSuccess={handleEnrollmentSuccess}
            onCancel={() => setShowEnrollment(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisable} onOpenChange={setShowDisable}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your authenticator code to disable 2FA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {disableError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
                {disableError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="disable-code">Verification Code</Label>
              <Input
                id="disable-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDisable(false)
                  setDisableCode('')
                  setDisableError(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDisableMFA}
                disabled={disableLoading || disableCode.length !== 6}
              >
                {disableLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
