'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Shield, Copy, Check } from 'lucide-react'
import type { MFAEnrollment } from '@/lib/types/mfa'

interface MFAEnrollmentProps {
  onSuccess: () => void
  onCancel: () => void
}

export function MFAEnrollmentComponent({ onSuccess, onCancel }: MFAEnrollmentProps) {
  const [step, setStep] = useState<'intro' | 'scan' | 'verify'>('intro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrollment, setEnrollment] = useState<MFAEnrollment | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [copied, setCopied] = useState(false)

  async function startEnrollment() {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      })

      if (error) throw error

      setEnrollment(data as MFAEnrollment)
      setFactorId(data.id)
      setStep('scan')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyEnrollment() {
    if (!factorId || verifyCode.length !== 6) return

    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      // First create a challenge
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })

      if (challengeError) throw challengeError

      // Then verify it
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      })

      if (verifyError) throw verifyError

      onSuccess()
    } catch (err: any) {
      setError(err.message)
      setVerifyCode('')
    } finally {
      setLoading(false)
    }
  }

  function copySecret() {
    if (enrollment?.totp.secret) {
      navigator.clipboard.writeText(enrollment.totp.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Enable Two-Factor Authentication</h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Add an extra layer of security to your account by requiring a code from your authenticator app when you sign in.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button className="w-full" onClick={startEnrollment} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
          <Button variant="outline" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'scan') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Open your authenticator app and scan this QR code to add your account.
          </p>
        </div>

        {enrollment?.totp.qr_code && (
          <div className="flex justify-center">
            <div className="rounded-lg border bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={enrollment.totp.qr_code}
                alt="QR Code for authenticator app"
                className="h-48 w-48"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-center text-xs text-neutral-500">
            Can&apos;t scan? Enter this code manually:
          </p>
          <div className="flex items-center justify-center gap-2">
            <code className="rounded bg-neutral-100 px-2 py-1 text-xs font-mono dark:bg-neutral-800">
              {enrollment?.totp.secret}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copySecret}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button className="w-full" onClick={() => setStep('verify')}>
          Continue
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Verify Setup</h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Enter the 6-digit code from your authenticator app to complete setup.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">Verification Code</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
          className="text-center text-2xl tracking-widest"
          autoFocus
        />
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={verifyEnrollment}
          disabled={loading || verifyCode.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify and Enable'
          )}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setStep('scan')}>
          Back
        </Button>
      </div>
    </div>
  )
}
