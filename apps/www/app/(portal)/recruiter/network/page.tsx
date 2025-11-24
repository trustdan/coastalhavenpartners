import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, MapPin, Briefcase, Mail, Linkedin } from 'lucide-react'

export default async function RecruiterNetworkPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const firmType = typeof params.firmType === 'string' ? params.firmType : undefined
  const location = typeof params.location === 'string' ? params.location : undefined

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check user role and approval
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'recruiter') {
    redirect('/candidate')
  }

  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    redirect('/recruiter')
  }

  // Fetch other recruiters who are visible to recruiters
  let query = supabase
    .from('recruiter_profiles')
    .select(`
      id,
      firm_name,
      firm_type,
      job_title,
      bio,
      specialties,
      locations,
      years_experience,
      company_website,
      visible_fields_to_recruiters,
      profiles:user_id (
        full_name,
        email,
        phone,
        linkedin_url
      )
    `)
    .eq('is_visible_to_recruiters', true)
    .eq('is_approved', true)
    .neq('user_id', user.id) // Exclude current user

  if (firmType) {
    query = query.ilike('firm_type', `%${firmType}%`)
  }
  if (location) {
    query = query.contains('locations', [location])
  }

  const { data: recruiters } = await query.order('created_at', { ascending: false })

  // Helper function to check if a field is visible
  const isFieldVisible = (visibilityConfig: any, field: string) => {
    return visibilityConfig?.[field] === true
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recruiter Network</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Connect with {recruiters?.length || 0} other recruiters in the industry
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <form className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firmType" className="mb-2 block text-sm font-medium">
              Firm Type
            </label>
            <select
              id="firmType"
              name="firmType"
              defaultValue={firmType}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => {
                const form = e.currentTarget.form
                if (form) {
                  const formData = new FormData(form)
                  const params = new URLSearchParams()
                  formData.forEach((value, key) => {
                    if (value) params.set(key, value.toString())
                  })
                  window.location.href = `?${params.toString()}`
                }
              }}
            >
              <option value="">All Types</option>
              <option value="Investment Bank">Investment Bank</option>
              <option value="Private Equity">Private Equity</option>
              <option value="Venture Capital">Venture Capital</option>
              <option value="Consulting">Consulting</option>
              <option value="Hedge Fund">Hedge Fund</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="mb-2 block text-sm font-medium">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={location}
              placeholder="e.g., New York"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onBlur={(e) => {
                const form = e.currentTarget.form
                if (form) {
                  const formData = new FormData(form)
                  const params = new URLSearchParams()
                  formData.forEach((value, key) => {
                    if (value) params.set(key, value.toString())
                  })
                  window.location.href = `?${params.toString()}`
                }
              }}
            />
          </div>
        </form>
      </div>

      {/* Recruiter Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {recruiters && recruiters.length > 0 ? (
          recruiters.map((recruiter) => {
            const visibility = recruiter.visible_fields_to_recruiters || {}

            return (
              <div
                key={recruiter.id}
                className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    {isFieldVisible(visibility, 'full_name') && (
                      <h3 className="text-lg font-semibold">
                        {recruiter.profiles?.full_name}
                      </h3>
                    )}
                    {isFieldVisible(visibility, 'job_title') && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {recruiter.job_title}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isFieldVisible(visibility, 'email') && recruiter.profiles?.email && (
                      <a
                        href={`mailto:${recruiter.profiles.email}`}
                        className="rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="Send email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    {isFieldVisible(visibility, 'linkedin_url') &&
                      recruiter.profiles?.linkedin_url && (
                        <a
                          href={recruiter.profiles.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title="View LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                  </div>
                </div>

                {/* Firm Info */}
                <div className="space-y-2 mb-4">
                  {isFieldVisible(visibility, 'firm_name') && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      <span className="font-medium">{recruiter.firm_name}</span>
                    </div>
                  )}

                  {isFieldVisible(visibility, 'firm_type') && recruiter.firm_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-neutral-400" />
                      <span>{recruiter.firm_type}</span>
                    </div>
                  )}

                  {isFieldVisible(visibility, 'locations') &&
                    recruiter.locations &&
                    recruiter.locations.length > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                        <span>{recruiter.locations.join(', ')}</span>
                      </div>
                    )}
                </div>

                {/* Bio */}
                {isFieldVisible(visibility, 'bio') && recruiter.bio && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                    {recruiter.bio}
                  </p>
                )}

                {/* Specialties */}
                {isFieldVisible(visibility, 'specialties') &&
                  recruiter.specialties &&
                  recruiter.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {recruiter.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                          >
                            {specialty}
                          </span>
                        ))}
                        {recruiter.specialties.length > 3 && (
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            +{recruiter.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {/* Years of Experience & Phone */}
                <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                  {isFieldVisible(visibility, 'years_experience') &&
                    recruiter.years_experience && (
                      <span>{recruiter.years_experience} years exp.</span>
                    )}
                  {isFieldVisible(visibility, 'phone') && recruiter.profiles?.phone && (
                    <a
                      href={`tel:${recruiter.profiles.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {recruiter.profiles.phone}
                    </a>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
            <p className="text-neutral-600 dark:text-neutral-400">
              No recruiters found in the network
            </p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
              Recruiters can make their profiles visible in their settings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
