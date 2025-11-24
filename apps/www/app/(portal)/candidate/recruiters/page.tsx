import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, MapPin, Briefcase } from 'lucide-react'

export default async function CandidateRecruitersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const firmType = typeof params.firmType === 'string' ? params.firmType : undefined
  const location = typeof params.location === 'string' ? params.location : undefined
  const specialty = typeof params.specialty === 'string' ? params.specialty : undefined

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirect recruiters to recruiter dashboard
  if (profile?.role === 'recruiter') {
    redirect('/recruiter')
  }

  // Fetch visible recruiters with filters
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
      visible_fields_to_candidates,
      profiles:user_id (
        full_name,
        email,
        linkedin_url
      )
    `)
    .eq('is_visible_to_candidates', true)
    .eq('is_approved', true)

  if (firmType) {
    query = query.ilike('firm_type', `%${firmType}%`)
  }
  if (location) {
    query = query.contains('locations', [location])
  }
  if (specialty) {
    query = query.contains('specialties', [specialty])
  }

  const { data: recruiters } = await query.order('created_at', { ascending: false })

  // Helper function to check if a field is visible
  const isFieldVisible = (visibilityConfig: any, field: string) => {
    return visibilityConfig?.[field] === true
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recruiter Directory</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {recruiters?.length || 0} recruiters available to connect with
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <form className="grid gap-4 md:grid-cols-3">
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

          <div>
            <label htmlFor="specialty" className="mb-2 block text-sm font-medium">
              Specialty
            </label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              defaultValue={specialty}
              placeholder="e.g., Investment Banking"
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recruiters && recruiters.length > 0 ? (
          recruiters.map((recruiter) => {
            const visibility = recruiter.visible_fields_to_candidates || {}

            return (
              <div
                key={recruiter.id}
                className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900"
              >
                {/* Header */}
                <div className="mb-4">
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

                {/* Firm Info */}
                <div className="space-y-2 mb-4">
                  {isFieldVisible(visibility, 'firm_name') && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      <span>{recruiter.firm_name}</span>
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
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
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

                {/* Years of Experience */}
                {isFieldVisible(visibility, 'years_experience') &&
                  recruiter.years_experience && (
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      {recruiter.years_experience} years of experience
                    </div>
                  )}

                {/* Action */}
                <div className="mt-auto pt-4 border-t">
                  <Link
                    href={`/candidate/recruiters/${recruiter.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View Full Profile →
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
            <p className="text-neutral-600 dark:text-neutral-400">
              No recruiters found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
