'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    // Supabase handles the token exchange automatically via the URL hash
    // We just need to verify that a session exists
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.')
      }
      setValidating(false)
    }

    checkSession()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
              Validating reset link...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold">Password Reset</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Your password has been successfully reset.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Redirecting to login...
            </p>
          </div>
          <Link
            href="/login"
            className="mt-4 flex items-center justify-center text-sm text-blue-600 hover:underline"
          >
            Go to login now
          </Link>
        </div>
      </div>
    )
  }

  if (error && !password) {
    // Show error for invalid/expired link
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold">Link Expired</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {error}
            </p>
          </div>
          <Link
            href="/login/forgot-password"
            className="mt-4 flex items-center justify-center text-sm text-blue-600 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
