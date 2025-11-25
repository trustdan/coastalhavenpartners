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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const supabase = createClient()
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

      // Get user role and redirect (prefer auth metadata to avoid blocking on DB)
      let role = data.user.user_metadata?.role as string | undefined

      if (!role) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Failed to fetch profile role:', profileError)
        }

        role = profile?.role ?? role
      }

      if (!role) {
        setError('We could not load your profile. Please contact support.')
        return
      }

      if (role === 'candidate') {
        router.push('/candidate')
        router.refresh()
      } else if (role === 'recruiter') {
        router.push('/recruiter')
        router.refresh()
      } else if (role === 'school_admin') {
        router.push('/school')
        router.refresh()
      } else if (role === 'admin') {
        router.push('/admin')
        router.refresh()
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

          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            <p className="mb-2">Don't have an account?</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <Link href="/signup/candidate" className="text-blue-600 hover:underline">
                Candidate
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <Link href="/signup/recruiter" className="text-blue-600 hover:underline">
                Recruiter
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <Link href="/signup/school" className="text-blue-600 hover:underline">
                Career Services
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
