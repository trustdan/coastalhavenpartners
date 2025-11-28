import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, MapPin, Briefcase, Clock } from 'lucide-react'
import { RecruiterFilters } from './recruiter-filters'
import type { Database } from '@/lib/types/database.types'

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

  // Use admin client to bypass RLS for profile checks
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Check user role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirect recruiters to recruiter dashboard
  if (profile?.role === 'recruiter') {
    redirect('/recruiter')
  }

  // Check if candidate is verified
  const { data: candidateProfile } = await supabaseAdmin
    .from('candidate_profiles')
    .select('status')
    .eq('user_id', user.id)
    .single()

  // If candidate is not verified, show a message instead of the recruiter directory
  if (!candidateProfile || candidateProfile.status !== 'verified') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Directory</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Connect with elite recruiters from top firms
          </p>
        </div>

        <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">Verification Required</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Your profile must be verified before you can view the recruiter directory.
          </p>
          <div className="mt-6 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
            <p className="text-sm font-medium">What happens next?</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Our team will review your profile and verify your information. This usually takes 24-48 hours.
              Once verified, you'll have full access to connect with recruiters.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/candidate"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
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
      profiles!user_id (
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
      <RecruiterFilters firmType={firmType} location={location} specialty={specialty} />

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
