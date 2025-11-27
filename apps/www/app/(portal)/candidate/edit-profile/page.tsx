'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/file-upload'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Building2, Users, Calendar, FileText, Tag } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { MultiAutocompleteInput } from '@/components/ui/multi-autocomplete-input'
import { MultiSelectTags } from '@/components/ui/multi-select-tags'
import { DegreeTypeSelect } from '@/components/ui/degree-type-select'
import { validateFieldsForProfanity, FIELD_DISPLAY_NAMES } from '@/lib/profanity-filter'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

const TARGET_ROLES = [
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Hedge Fund',
  'Asset Management',
  'Consulting',
  'Corporate Finance',
  'Equity Research',
  'Sales & Trading',
  'Wealth Management',
  'Real Estate',
  'Fintech',
]

type VisibilityFields = {
  linkedin_url: boolean
  email: boolean
  resume: boolean
  transcript: boolean
}

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [linkedinUrl, setLinkedinUrl] = useState<string>('')
  const [schedulingUrl, setSchedulingUrl] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [bioLength, setBioLength] = useState(0)
  const [targetRoles, setTargetRoles] = useState<string[]>([])
  const [preferredLocations, setPreferredLocations] = useState<string>('')
  const [tags, setTags] = useState<string>('')

  // Undergrad education fields
  const [undergradDegreeType, setUndergradDegreeType] = useState<string>('')
  const [undergradSpecialty, setUndergradSpecialty] = useState<string>('')

  // Graduate education fields (optional)
  const [hasGradDegree, setHasGradDegree] = useState(false)
  const [gradSchool, setGradSchool] = useState<string>('')
  const [gradDegreeType, setGradDegreeType] = useState<string>('')
  const [gradMajor, setGradMajor] = useState<string>('')
  const [gradGpa, setGradGpa] = useState<string>('')
  const [gradGraduationYear, setGradGraduationYear] = useState<string>('')
  const [gradSpecialty, setGradSpecialty] = useState<string>('')

  // Visibility controls
  const [recruiterVisibility, setRecruiterVisibility] = useState<VisibilityFields>({
    linkedin_url: true,
    email: false,
    resume: true,
    transcript: false,
  })

  const [schoolVisibility, setSchoolVisibility] = useState<VisibilityFields>({
    linkedin_url: true,
    email: true,
    resume: true,
    transcript: true,
  })

  const toggleRecruiterField = (field: keyof VisibilityFields) => {
    setRecruiterVisibility(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const toggleSchoolField = (field: keyof VisibilityFields) => {
    setSchoolVisibility(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Autocomplete fetch functions
  const fetchPreferredLocations = async (query: string): Promise<string[]> => {
    const res = await fetch(`/api/autocomplete/fields?field=preferred_locations&q=${encodeURIComponent(query)}`)
    const data = await res.json()
    return data.values || []
  }

  const fetchTags = async (query: string): Promise<string[]> => {
    const res = await fetch(`/api/autocomplete/fields?field=tags&q=${encodeURIComponent(query)}`)
    const data = await res.json()
    return data.values || []
  }

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
      setSchedulingUrl((data as any)?.scheduling_url || '')
      const bioValue = (data as any)?.bio || ''
      setBio(bioValue)
      setBioLength(bioValue.length)
      setTargetRoles(data?.target_roles || [])
      setPreferredLocations(data?.preferred_locations?.join(', ') || '')
      setTags(data?.tags?.join(', ') || '')

      // Load undergrad education fields
      const extData = data as any
      setUndergradDegreeType(extData?.undergrad_degree_type || '')
      setUndergradSpecialty(extData?.undergrad_specialty || '')

      // Load graduate education fields
      if (extData?.grad_school || extData?.grad_degree_type) {
        setHasGradDegree(true)
        setGradSchool(extData?.grad_school || '')
        setGradDegreeType(extData?.grad_degree_type || '')
        setGradMajor(extData?.grad_major || '')
        setGradGpa(extData?.grad_gpa?.toString() || '')
        setGradGraduationYear(extData?.grad_graduation_year?.toString() || '')
        setGradSpecialty(extData?.grad_specialty || '')
      }

      // Load visibility settings (if they exist in the database)
      const extendedData = data as any
      if (extendedData?.visible_fields_to_recruiters) {
        setRecruiterVisibility(extendedData.visible_fields_to_recruiters as VisibilityFields)
      }
      if (extendedData?.visible_fields_to_schools) {
        setSchoolVisibility(extendedData.visible_fields_to_schools as VisibilityFields)
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

      const linkedinUrl = formData.get('linkedinUrl') as string

      const updates: any = {
        // Undergrad education (required)
        school_name: formData.get('schoolName') as string,
        major: formData.get('major') as string,
        graduation_year: parseInt(formData.get('graduationYear') as string),
        gpa: parseFloat(formData.get('gpa') as string),
        undergrad_degree_type: undergradDegreeType || null,
        undergrad_specialty: undergradSpecialty || null,
        // Graduate education (optional)
        grad_school: hasGradDegree ? gradSchool || null : null,
        grad_degree_type: hasGradDegree ? gradDegreeType || null : null,
        grad_major: hasGradDegree ? gradMajor || null : null,
        grad_gpa: hasGradDegree && gradGpa ? parseFloat(gradGpa) : null,
        grad_graduation_year: hasGradDegree && gradGraduationYear ? parseInt(gradGraduationYear) : null,
        grad_specialty: hasGradDegree ? gradSpecialty || null : null,
        // Other fields
        target_roles: targetRoles,
        preferred_locations: preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
        scheduling_url: formData.get('schedulingUrl') as string || null,
        bio: formData.get('bio') as string || null,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        visible_fields_to_recruiters: recruiterVisibility,
        visible_fields_to_schools: schoolVisibility,
      }

      // Validate for profanity before saving
      const profanityCheck = validateFieldsForProfanity({
        bio: updates.bio || '',
        tags: updates.tags,
        target_roles: updates.target_roles,
        preferred_locations: updates.preferred_locations,
      })

      if (!profanityCheck.isValid) {
        const fieldNames = profanityCheck.invalidFields
          .map(f => FIELD_DISPLAY_NAMES[f] || f)
          .join(', ')
        toast.error(`Please remove inappropriate language from: ${fieldNames}`)
        setSaving(false)
        return
      }

      const { error: profileError } = await supabase
        .from('candidate_profiles')
        .update(updates as any)
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
            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="schedulingUrl" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Scheduling Link (Calendly, Cal.com, etc.)
                </Label>
                <Input
                  id="schedulingUrl"
                  name="schedulingUrl"
                  type="url"
                  defaultValue={schedulingUrl}
                  placeholder="https://calendly.com/yourname"
                />
                <p className="text-xs text-neutral-500">
                  Recruiters can use this to schedule interviews with you directly
                </p>
              </div>
            </div>
            {/* Undergraduate Education Section */}
            <div className="space-y-4 p-4 rounded-lg border bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Undergraduate Education</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    defaultValue={profile?.school_name}
                    placeholder="Harvard University"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="undergradDegreeType">Degree Type</Label>
                  <DegreeTypeSelect
                    id="undergradDegreeType"
                    value={undergradDegreeType}
                    onChange={setUndergradDegreeType}
                    placeholder="Select degree (BA, BS...)"
                    degreeCategory="undergrad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    name="major"
                    defaultValue={profile?.major}
                    placeholder="Economics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="undergradSpecialty">Concentration/Specialty (optional)</Label>
                  <Input
                    id="undergradSpecialty"
                    value={undergradSpecialty}
                    onChange={(e) => setUndergradSpecialty(e.target.value)}
                    placeholder="Finance track, Honors program..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    name="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    defaultValue={profile?.gpa}
                    placeholder="3.85"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    min="1950"
                    max="2050"
                    defaultValue={profile?.graduation_year}
                    placeholder="2025"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Graduate Education Section (Optional) */}
            <div className="space-y-4 p-4 rounded-lg border bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Graduate Education</h3>
                  <span className="text-xs text-neutral-500">(Optional)</span>
                </div>
                <Checkbox
                  id="hasGradDegree"
                  checked={hasGradDegree}
                  onCheckedChange={(checked) => setHasGradDegree(checked === true)}
                />
              </div>

              {hasGradDegree && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gradSchool">School</Label>
                    <Input
                      id="gradSchool"
                      value={gradSchool}
                      onChange={(e) => setGradSchool(e.target.value)}
                      placeholder="Stanford GSB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradDegreeType">Degree Type</Label>
                    <DegreeTypeSelect
                      id="gradDegreeType"
                      value={gradDegreeType}
                      onChange={setGradDegreeType}
                      placeholder="Select degree (MBA, JD, PhD...)"
                      degreeCategory="graduate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradMajor">Major/Field of Study</Label>
                    <Input
                      id="gradMajor"
                      value={gradMajor}
                      onChange={(e) => setGradMajor(e.target.value)}
                      placeholder="Finance, Law, Computer Science..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradSpecialty">Concentration/Specialty (optional)</Label>
                    <Input
                      id="gradSpecialty"
                      value={gradSpecialty}
                      onChange={(e) => setGradSpecialty(e.target.value)}
                      placeholder="Corporate Law, Machine Learning..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradGpa">GPA (optional)</Label>
                    <Input
                      id="gradGpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={gradGpa}
                      onChange={(e) => setGradGpa(e.target.value)}
                      placeholder="3.90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradGraduationYear">Graduation Year</Label>
                    <Input
                      id="gradGraduationYear"
                      type="number"
                      min="1950"
                      max="2050"
                      value={gradGraduationYear}
                      onChange={(e) => setGradGraduationYear(e.target.value)}
                      placeholder="2027"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetRoles">Target Roles</Label>
              <MultiSelectTags
                id="targetRoles"
                options={TARGET_ROLES}
                selected={targetRoles}
                onChange={setTargetRoles}
                placeholder="Select a role..."
                maxSelections={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLocations">Preferred Locations</Label>
              <MultiAutocompleteInput
                id="preferredLocations"
                name="preferredLocations"
                value={preferredLocations}
                onChange={setPreferredLocations}
                placeholder="New York, San Francisco, London"
                fetchSuggestions={fetchPreferredLocations}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                About Me
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 240)
                  setBio(value)
                  setBioLength(value.length)
                }}
                placeholder="Brief introduction about yourself, your interests, and career goals..."
                className="min-h-[100px] resize-none"
                maxLength={240}
              />
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">
                  A short bio helps recruiters get to know you
                </span>
                <span className={bioLength > 220 ? 'text-amber-600' : 'text-neutral-500'}>
                  {bioLength}/240
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Skills & Interests
              </Label>
              <MultiAutocompleteInput
                id="tags"
                name="tags"
                value={tags}
                onChange={setTags}
                placeholder="Excel, Python, Financial Modeling, M&A, Valuation"
                fetchSuggestions={fetchTags}
              />
            </div>

            {/* Visibility Controls */}
            <div className="pt-6 border-t">
              <h3 className="text-base font-semibold mb-2">Information Sharing</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Control which information recruiters and your career services department can see
              </p>

              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 pb-2 border-b font-medium text-sm">
                  <div>Field</div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    Recruiters
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Career Services
                  </div>
                </div>

                {/* LinkedIn URL */}
                <div className="grid grid-cols-3 gap-4 items-center py-2">
                  <Label className="text-sm">LinkedIn URL</Label>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-recruiter-linkedin"
                      checked={recruiterVisibility.linkedin_url}
                      onCheckedChange={() => toggleRecruiterField('linkedin_url')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-school-linkedin"
                      checked={schoolVisibility.linkedin_url}
                      onCheckedChange={() => toggleSchoolField('linkedin_url')}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-3 gap-4 items-center py-2">
                  <Label className="text-sm">Email Address</Label>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-recruiter-email"
                      checked={recruiterVisibility.email}
                      onCheckedChange={() => toggleRecruiterField('email')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-school-email"
                      checked={schoolVisibility.email}
                      onCheckedChange={() => toggleSchoolField('email')}
                    />
                  </div>
                </div>

                {/* Resume */}
                <div className="grid grid-cols-3 gap-4 items-center py-2">
                  <Label className="text-sm">Resume</Label>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-recruiter-resume"
                      checked={recruiterVisibility.resume}
                      onCheckedChange={() => toggleRecruiterField('resume')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-school-resume"
                      checked={schoolVisibility.resume}
                      onCheckedChange={() => toggleSchoolField('resume')}
                    />
                  </div>
                </div>

                {/* Transcript */}
                <div className="grid grid-cols-3 gap-4 items-center py-2">
                  <Label className="text-sm">Transcript</Label>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-recruiter-transcript"
                      checked={recruiterVisibility.transcript}
                      onCheckedChange={() => toggleRecruiterField('transcript')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      id="vis-school-transcript"
                      checked={schoolVisibility.transcript}
                      onCheckedChange={() => toggleSchoolField('transcript')}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Your basic profile info (name, school, GPA, major, graduation year) is always visible to verified recruiters and your career services department.
                </p>
              </div>
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
