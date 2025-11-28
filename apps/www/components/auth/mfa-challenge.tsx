'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Shield } from 'lucide-react'

interface MFAChallengeProps {
  onSuccess: () => void
  onCancel?: () => void
}

export function MFAChallengeComponent({ onSuccess, onCancel }: MFAChallengeProps) {
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)

  useEffect(() => {
    async function initializeChallenge() {
      const supabase = createClient()

      try {
        // Get the user's TOTP factors
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

        if (factorsError) throw factorsError

        const totpFactor = factors.totp.find(f => f.status === 'verified')

        if (!totpFactor) {
          throw new Error('No verified MFA factor found')
        }

        setFactorId(totpFactor.id)

        // Create a challenge
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        })

        if (challengeError) throw challengeError

        setChallengeId(challenge.id)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setInitializing(false)
      }
    }

    initializeChallenge()
  }, [])

  async function verifyCode() {
    if (!factorId || !challengeId || code.length !== 6) return

    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      })

      if (verifyError) throw verifyError

      onSuccess()
    } catch (err: any) {
      setError(err.message)
      setCode('')

      // Create a new challenge for retry
      try {
        const { data: challenge } = await supabase.auth.mfa.challenge({
          factorId: factorId!,
        })
        if (challenge) {
          setChallengeId(challenge.id)
        }
      } catch {
        // Ignore challenge creation errors on retry
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && code.length === 6) {
      verifyCode()
    }
  }

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-500">Preparing verification...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Two-Factor Authentication</h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="mfa-code">Verification Code</Label>
        <Input
          id="mfa-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          onKeyDown={handleKeyDown}
          className="text-center text-2xl tracking-widest"
          autoFocus
          disabled={loading}
        />
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={verifyCode}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
        {onCancel && (
          <Button variant="outline" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-neutral-500">
        Open your authenticator app to view your verification code.
      </p>
    </div>
  )
}
