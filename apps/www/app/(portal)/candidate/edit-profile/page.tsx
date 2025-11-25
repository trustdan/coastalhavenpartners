'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/file-upload'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [linkedinUrl, setLinkedinUrl] = useState<string>('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Load LinkedIn URL from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('linkedin_url')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLinkedinUrl(profileData?.linkedin_url || '')
      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to update your profile')
        router.push('/login')
        return
      }

      const formData = new FormData(e.currentTarget)
      const linkedinUrl = formData.get('linkedinUrl') as string

      const updates = {
        school_name: formData.get('schoolName') as string,
        major: formData.get('major') as string,
        graduation_year: parseInt(formData.get('graduationYear') as string),
        gpa: parseFloat(formData.get('gpa') as string),
        target_roles: (formData.get('targetRoles') as string).split(',').map(s => s.trim()).filter(Boolean),
        preferred_locations: (formData.get('preferredLocations') as string).split(',').map(s => s.trim()).filter(Boolean),
      }

      const { error: profileError } = await supabase
        .from('candidate_profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (profileError) throw profileError

      // Update LinkedIn URL in profiles table
      if (linkedinUrl) {
        const { error: linkedinError } = await supabase
          .from('profiles')
          .update({ linkedin_url: linkedinUrl })
          .eq('id', user.id)

        if (linkedinError) throw linkedinError
      }

      toast.success('Profile updated successfully')
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to update profile')
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/candidate">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Update your information and documents
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Documents Section */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <FileUpload
              bucket="resumes"
              label="Resume"
              currentUrl={profile?.resume_url}
              onUploadComplete={(url) => {
                setProfile({ ...profile, resume_url: url })
                router.refresh()
              }}
            />
            <FileUpload
              bucket="transcripts"
              label="Transcript"
              currentUrl={profile?.transcript_url}
              onUploadComplete={(url) => {
                setProfile({ ...profile, transcript_url: url })
                router.refresh()
              }}
            />
          </div>
        </div>

        {/* Profile Info Form */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-6">Academic & Professional</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                defaultValue={linkedinUrl}
                placeholder="https://www.linkedin.com/in/yourprofile"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  defaultValue={profile?.school_name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  name="major"
                  defaultValue={profile?.major}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  name="gpa"
                  type="number"
                  step="0.01"
                  defaultValue={profile?.gpa}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  defaultValue={profile?.graduation_year}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetRoles">Target Roles (comma separated)</Label>
              <Input
                id="targetRoles"
                name="targetRoles"
                defaultValue={profile?.target_roles?.join(', ')}
                placeholder="Investment Banking, Private Equity, Consulting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLocations">Preferred Locations (comma separated)</Label>
              <Input
                id="preferredLocations"
                name="preferredLocations"
                defaultValue={profile?.preferred_locations?.join(', ')}
                placeholder="New York, San Francisco, London"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/candidate">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
