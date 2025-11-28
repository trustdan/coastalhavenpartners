'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AutocompleteInput } from '@/components/ui/autocomplete-input'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { completeOAuthCandidateProfile } from './actions'

export default function CompleteCandidateProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schoolName, setSchoolName] = useState('')
  const [major, setMajor] = useState('')
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
        // User already has a profile, redirect to dashboard
        if (profile.role === 'candidate') router.push('/candidate')
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

  const fetchSchoolSuggestions = useCallback(async (query: string) => {
    const response = await fetch(`/api/autocomplete/schools?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    return data.schools || []
  }, [])

  const fetchMajorSuggestions = useCallback(async (query: string) => {
    const response = await fetch(`/api/autocomplete/majors?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    return data.majors || []
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const gpa = parseFloat(formData.get('gpa') as string)
    const graduationYear = parseInt(formData.get('graduationYear') as string)
    const linkedinUrl = formData.get('linkedinUrl') as string

    // Validate required fields
    if (!schoolName.trim()) {
      setError('Please enter your university')
      setLoading(false)
      return
    }

    if (!major.trim()) {
      setError('Please enter your major')
      setLoading(false)
      return
    }

    // Validate GPA
    if (gpa < 2.5) {
      setError('Minimum GPA requirement is 2.5')
      setLoading(false)
      return
    }

    if (gpa > 4.0) {
      setError('GPA cannot exceed 4.0')
      setLoading(false)
      return
    }

    try {
      await completeOAuthCandidateProfile({
        userId: user.id,
        email: user.email,
        fullName,
        schoolName: schoolName.trim(),
        major: major.trim(),
        gpa,
        graduationYear,
        linkedinUrl,
      })

      router.push('/candidate')
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
            Just a few more details to join the network
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
              placeholder="John Smith"
            />
          </div>

          <div>
            <Label htmlFor="schoolName">University</Label>
            <AutocompleteInput
              id="schoolName"
              name="schoolName"
              value={schoolName}
              onChange={setSchoolName}
              placeholder="Start typing your university..."
              required
              fetchSuggestions={fetchSchoolSuggestions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="major">Major</Label>
              <AutocompleteInput
                id="major"
                name="major"
                value={major}
                onChange={setMajor}
                placeholder="e.g. Finance"
                required
                fetchSuggestions={fetchMajorSuggestions}
              />
            </div>
            <div>
              <Label htmlFor="graduationYear">Grad Year</Label>
              <Input
                id="graduationYear"
                name="graduationYear"
                type="number"
                required
                min={1970}
                max={2035}
                placeholder="2026"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gpa">GPA (Min 2.5)</Label>
            <Input
              id="gpa"
              name="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              required
              placeholder="3.85"
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
