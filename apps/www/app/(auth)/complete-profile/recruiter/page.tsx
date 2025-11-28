'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { completeOAuthRecruiterProfile } from './actions'

export default function CompleteRecruiterProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{
    id: string
    email: string
    fullName: string
  } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check if user already has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role) {
        if (profile.role === 'recruiter') router.push('/recruiter')
        else router.push('/complete-profile')
        return
      }

      setUser({
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      })
      setPageLoading(false)
    }

    checkUser()
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const firmName = formData.get('firmName') as string
    const firmType = formData.get('firmType') as string
    const jobTitle = formData.get('jobTitle') as string
    const linkedinUrl = formData.get('linkedinUrl') as string

    try {
      await completeOAuthRecruiterProfile({
        userId: user.id,
        email: user.email,
        fullName,
        firmName,
        firmType,
        jobTitle,
        linkedinUrl,
      })

      router.push('/recruiter')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <Link
        href="/complete-profile"
        className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Change Role
      </Link>
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Access elite finance talent
          </p>
          {user?.email && (
            <p className="mt-1 text-xs text-neutral-500">
              {user.email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={user?.fullName}
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <Label htmlFor="firmName">Firm Name</Label>
            <Input
              id="firmName"
              name="firmName"
              type="text"
              required
              placeholder="Goldman Sachs"
            />
          </div>

          <div>
            <Label htmlFor="firmType">Firm Type</Label>
            <Input
              id="firmType"
              name="firmType"
              type="text"
              required
              placeholder="Investment Bank"
            />
          </div>

          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              type="text"
              required
              placeholder="Managing Director, Campus Recruiting"
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/yourprofile"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  )
}
