'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Eye, Users, Building2 } from 'lucide-react'
import Link from 'next/link'
import { MFASettings } from '@/components/auth/mfa-settings'

type VisibilityFields = {
  full_name: boolean
  email: boolean
  phone: boolean
  firm_name: boolean
  firm_type: boolean
  job_title: boolean
  bio: boolean
  specialties: boolean
  locations: boolean
  linkedin_url: boolean
  years_experience: boolean
  company_website: boolean
  profile_photo_url: boolean
}

export default function RecruiterSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null)
  const [baseProfile, setBaseProfile] = useState<any>(null)

  // Master toggles
  const [visibleToCandidates, setVisibleToCandidates] = useState(false)
  const [visibleToRecruiters, setVisibleToRecruiters] = useState(false)
  const [visibleToSchools, setVisibleToSchools] = useState(false)

  // Field-level visibility
  const [candidateVisibility, setCandidateVisibility] = useState<VisibilityFields>({
    full_name: true,
    email: false,
    phone: false,
    firm_name: true,
    firm_type: true,
    job_title: true,
    bio: true,
    specialties: true,
    locations: true,
    linkedin_url: false,
    years_experience: true,
    company_website: true,
    profile_photo_url: true,
  })

  const [recruiterVisibility, setRecruiterVisibility] = useState<VisibilityFields>({
    full_name: true,
    email: true,
    phone: true,
    firm_name: true,
    firm_type: true,
    job_title: true,
    bio: true,
    specialties: true,
    locations: true,
    linkedin_url: true,
    years_experience: true,
    company_website: true,
    profile_photo_url: true,
  })

  const [schoolVisibility, setSchoolVisibility] = useState<VisibilityFields>({
    full_name: true,
    email: true,
    phone: false,
    firm_name: true,
    firm_type: true,
    job_title: true,
    bio: true,
    specialties: true,
    locations: true,
    linkedin_url: true,
    years_experience: true,
    company_website: true,
    profile_photo_url: true,
  })

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

      // Load recruiter profile
      const { data: recruiterData } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (recruiterData) {
        setRecruiterProfile(recruiterData)
        setVisibleToCandidates(recruiterData.is_visible_to_candidates || false)
        setVisibleToRecruiters(recruiterData.is_visible_to_recruiters || false)
        setVisibleToSchools(recruiterData.is_visible_to_schools || false)

        if (recruiterData.visible_fields_to_candidates) {
          setCandidateVisibility(recruiterData.visible_fields_to_candidates as VisibilityFields)
        }
        if (recruiterData.visible_fields_to_recruiters) {
          setRecruiterVisibility(recruiterData.visible_fields_to_recruiters as VisibilityFields)
        }
        if (recruiterData.visible_fields_to_schools) {
          setSchoolVisibility(recruiterData.visible_fields_to_schools as VisibilityFields)
        }
      }

      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  const toggleCandidateField = (field: keyof VisibilityFields) => {
    setCandidateVisibility(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const toggleRecruiterField = (field: keyof VisibilityFields) => {
    setRecruiterVisibility(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const toggleSchoolField = (field: keyof VisibilityFields) => {
    setSchoolVisibility(prev => ({ ...prev, [field]: !prev[field] }))
  }

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

      // Parse array fields
      const specialties = (formData.get('specialties') as string)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const locations = (formData.get('locations') as string)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const updates = {
        firm_name: formData.get('firmName') as string,
        firm_type: formData.get('firmType') as string,
        job_title: formData.get('jobTitle') as string,
        bio: formData.get('bio') as string,
        specialties,
        locations,
        years_experience: formData.get('yearsExperience')
          ? parseInt(formData.get('yearsExperience') as string)
          : null,
        linkedin_url: formData.get('linkedinUrl') as string,
        company_website: formData.get('companyWebsite') as string,
        is_visible_to_candidates: visibleToCandidates,
        is_visible_to_recruiters: visibleToRecruiters,
        is_visible_to_schools: visibleToSchools,
        visible_fields_to_candidates: candidateVisibility,
        visible_fields_to_recruiters: recruiterVisibility,
        visible_fields_to_schools: schoolVisibility,
      }

      const { error } = await supabase
        .from('recruiter_profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error

      // Update phone in base profile
      const phone = formData.get('phone') as string
      if (phone) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ phone })
            .eq('id', user.id)
        }
      }

      toast.success('Profile updated successfully')
      router.refresh()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error('Failed to update profile: ' + error.message)
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

  const visibilityFields: { key: keyof VisibilityFields; label: string }[] = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'firm_name', label: 'Firm Name' },
    { key: 'firm_type', label: 'Firm Type' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'bio', label: 'Bio' },
    { key: 'specialties', label: 'Specialties' },
    { key: 'locations', label: 'Locations' },
    { key: 'linkedin_url', label: 'LinkedIn URL' },
    { key: 'years_experience', label: 'Years of Experience' },
    { key: 'company_website', label: 'Company Website' },
    { key: 'profile_photo_url', label: 'Profile Photo' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/recruiter">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your public profile and visibility preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firmName">Firm Name *</Label>
              <Input
                id="firmName"
                name="firmName"
                defaultValue={recruiterProfile?.firm_name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmType">Firm Type</Label>
              <Input
                id="firmType"
                name="firmType"
                defaultValue={recruiterProfile?.firm_type}
                placeholder="e.g., Investment Bank, PE, VC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                defaultValue={recruiterProfile?.job_title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                defaultValue={recruiterProfile?.years_experience}
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={recruiterProfile?.bio}
              placeholder="Tell candidates about yourself and what you're looking for..."
              rows={4}
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma separated)</Label>
              <Input
                id="specialties"
                name="specialties"
                defaultValue={recruiterProfile?.specialties?.join(', ')}
                placeholder="Investment Banking, Private Equity, Consulting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locations">Locations (comma separated)</Label>
              <Input
                id="locations"
                name="locations"
                defaultValue={recruiterProfile?.locations?.join(', ')}
                placeholder="New York, San Francisco, London"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-6">Contact Information</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={baseProfile?.email}
                disabled
                className="bg-neutral-50 dark:bg-neutral-800"
              />
              <p className="text-xs text-neutral-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={baseProfile?.phone}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                defaultValue={recruiterProfile?.linkedin_url}
                placeholder="https://www.linkedin.com/in/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                name="companyWebsite"
                type="url"
                defaultValue={recruiterProfile?.company_website}
                placeholder="https://www.yourcompany.com"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <MFASettings />

        {/* Visibility Controls */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-2">Profile Visibility</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Control who can see your profile and what information they can access
          </p>

          {/* Master Toggles */}
          <div className="space-y-4 mb-8 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visibleToCandidates" className="text-base">
                  Visible to Candidates
                </Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Allow verified candidates to discover and contact you
                </p>
              </div>
              <Switch
                id="visibleToCandidates"
                checked={visibleToCandidates}
                onCheckedChange={setVisibleToCandidates}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visibleToRecruiters" className="text-base">
                  Visible to Other Recruiters
                </Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Network with other recruiters in the industry
                </p>
              </div>
              <Switch
                id="visibleToRecruiters"
                checked={visibleToRecruiters}
                onCheckedChange={setVisibleToRecruiters}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visibleToSchools" className="text-base">
                  Visible to Career Services Departments
                </Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Let university career services see your profile and recruiting focus
                </p>
              </div>
              <Switch
                id="visibleToSchools"
                checked={visibleToSchools}
                onCheckedChange={setVisibleToSchools}
              />
            </div>
          </div>

          {/* Field-Level Visibility Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm">
              <div>Field</div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Candidates
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recruiters
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Schools
              </div>
            </div>

            {visibilityFields.map(({ key, label }) => (
              <div key={key} className="grid grid-cols-4 gap-4 items-center py-2">
                <Label htmlFor={`vis-${key}`} className="text-sm">
                  {label}
                </Label>
                <div className="flex justify-center">
                  <Checkbox
                    id={`vis-candidate-${key}`}
                    checked={candidateVisibility[key]}
                    onCheckedChange={() => toggleCandidateField(key)}
                    disabled={!visibleToCandidates}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    id={`vis-recruiter-${key}`}
                    checked={recruiterVisibility[key]}
                    onCheckedChange={() => toggleRecruiterField(key)}
                    disabled={!visibleToRecruiters}
                  />
                </div>
                <div className="flex justify-center">
                  <Checkbox
                    id={`vis-school-${key}`}
                    checked={schoolVisibility[key]}
                    onCheckedChange={() => toggleSchoolField(key)}
                    disabled={!visibleToSchools}
                  />
                </div>
              </div>
            ))}
          </div>

          {(!visibleToCandidates && !visibleToRecruiters && !visibleToSchools) && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your profile is currently private. Enable at least one visibility option above to make your profile discoverable.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/recruiter">Cancel</Link>
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
