'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SchoolSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schoolProfile, setSchoolProfile] = useState<any>(null)
  const [baseProfile, setBaseProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load base profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setBaseProfile(profileData)

      // Load school profile
      const { data: schoolData } = await supabase
        .from('school_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (schoolData) {
        setSchoolProfile(schoolData)
      }

      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to update your profile')
        router.push('/login')
        return
      }

      const updates = {
        school_name: formData.get('schoolName') as string,
        school_domain: formData.get('schoolDomain') as string,
        department_name: formData.get('departmentName') as string,
        contact_email: formData.get('contactEmail') as string,
        contact_phone: formData.get('contactPhone') as string,
        website: formData.get('website') as string,
      }

      const { error } = await supabase
        .from('school_profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Settings updated successfully')
      router.refresh()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error('Failed to update settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your career services department profile
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* School Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-6">School Information</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                name="schoolName"
                defaultValue={schoolProfile?.school_name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolDomain">School Email Domain</Label>
              <Input
                id="schoolDomain"
                name="schoolDomain"
                defaultValue={schoolProfile?.school_domain}
                placeholder="e.g., harvard.edu"
              />
              <p className="text-xs text-neutral-500">
                Used for student email verification
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="departmentName">Department Name</Label>
              <Input
                id="departmentName"
                name="departmentName"
                defaultValue={schoolProfile?.department_name}
                placeholder="e.g., Career Services Center"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-6">Contact Information</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={schoolProfile?.contact_email}
                placeholder="careers@university.edu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={schoolProfile?.contact_phone}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Department Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={schoolProfile?.website}
                placeholder="https://www.university.edu/career-services"
              />
            </div>
          </div>
        </div>

        {/* Approval Status */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-2">Account Status</h2>
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium
              ${schoolProfile?.is_approved
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'}
            `}>
              {schoolProfile?.is_approved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>
          {!schoolProfile?.is_approved && (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Your account is pending verification by our team. This typically takes 24-48 hours.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/school">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
