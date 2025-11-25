'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeCandidateProfile } from './actions'

export function CompleteProfileForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const schoolName = formData.get('schoolName') as string
    const major = formData.get('major') as string
    const gpa = parseFloat(formData.get('gpa') as string)
    const graduationYear = parseInt(formData.get('graduationYear') as string)

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
      await completeCandidateProfile({
        schoolName,
        major,
        gpa,
        graduationYear,
      })

      // Refresh the page to show the dashboard
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-8 shadow-sm dark:bg-neutral-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            We need a few more details to set up your candidate profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="schoolName">University</Label>
            <Input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              placeholder="University of Pennsylvania"
            />
          </div>

          <div>
            <Label htmlFor="major">Major</Label>
            <Input
              id="major"
              name="major"
              type="text"
              required
              placeholder="Finance"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  )
}

