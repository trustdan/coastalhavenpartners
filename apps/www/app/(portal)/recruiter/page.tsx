import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { CandidateFilters } from './candidate-filters'
import { AccessRevoked } from '@/components/access-revoked'
import type { Database } from '@/lib/types/database.types'
import { getSavedSearches } from './saved-search-actions'
import { ExportButton } from './export-button'
import { getRecommendedCandidates } from '@/lib/recommendations'
import { RecommendedCandidates } from '@/components/recruiter/recommended-candidates'
import { getCandidatesInterestedInMyFirm } from '@/app/(portal)/candidate/firm-interests-actions'
import { CandidateTable } from './candidate-table'

export default async function RecruiterDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const gpa = typeof params.gpa === 'string' ? params.gpa : undefined
  const major = typeof params.major === 'string' ? params.major : undefined
  const school = typeof params.school === 'string' ? params.school : undefined
  const gradYear = typeof params.gradYear === 'string' ? params.gradYear : undefined
  const targetRole = typeof params.targetRole === 'string' ? params.targetRole : undefined
  const undergradDegree = typeof params.undergradDegree === 'string' ? params.undergradDegree : undefined
  const gradDegree = typeof params.gradDegree === 'string' ? params.gradDegree : undefined
  const interestedInFirm = typeof params.interestedInFirm === 'string' ? params.interestedInFirm === 'true' : false

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
    .select('role, email')
    .eq('id', user.id)
    .single()

  // Redirect candidates to candidate dashboard
  if (profile?.role === 'candidate') {
    redirect('/candidate')
  }

  // Check if recruiter is approved
  const { data: recruiterProfile } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('id, is_approved, is_rejected, firm_name')
    .eq('user_id', user.id)
    .single()

  // Check if user is rejected/revoked
  if (recruiterProfile?.is_rejected) {
    return <AccessRevoked userType="recruiter" email={profile?.email} />
  }

  if (!recruiterProfile?.is_approved) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
          <svg
            className="h-8 w-8 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Pending Approval</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your recruiter account is pending approval from our team. We'll notify you once it's ready.
        </p>
        <div className="mt-6 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
          <p className="text-sm font-medium">What happens next?</p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Our team will review your application and verify your firm affiliation. This usually takes 24-48 hours.
          </p>
        </div>
      </div>
    )
  }

  // Fetch saved searches, recommendations, and interested candidates for this recruiter
  const [savedSearches, recommendedCandidates, interestedCandidateIds] = await Promise.all([
    getSavedSearches(),
    getRecommendedCandidates(recruiterProfile.id, 5),
    getCandidatesInterestedInMyFirm()
  ])

  // Fetch verified candidates with filters
  let query = supabase
    .from('candidate_profiles')
    .select(`
      id,
      school_name,
      major,
      gpa,
      graduation_year,
      target_roles,
      preferred_locations,
      status,
      undergrad_degree_type,
      grad_degree_type,
      gpa_verified,
      resume_verified,
      transcript_verified,
      profiles!user_id (
        full_name,
        email
      )
    `)
    .eq('status', 'verified')

  if (gpa) {
    query = query.gte('gpa', parseFloat(gpa))
  }
  if (major) {
    query = query.ilike('major', `%${major}%`)
  }
  if (school) {
    query = query.ilike('school_name', `%${school}%`)
  }
  if (gradYear) {
    query = query.eq('graduation_year', parseInt(gradYear))
  }
  if (targetRole) {
    query = query.contains('target_roles', [targetRole])
  }
  if (undergradDegree) {
    query = query.eq('undergrad_degree_type', undergradDegree)
  }
  if (gradDegree) {
    query = query.eq('grad_degree_type', gradDegree)
  }
  if (interestedInFirm && interestedCandidateIds.length > 0) {
    query = query.in('id', interestedCandidateIds)
  }

  // Execute query with ordering
  const { data: candidates } = await query.order('gpa', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidate Pool</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {candidates?.length || 0} verified candidates available
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Personalized Recommendations */}
      <RecommendedCandidates candidates={recommendedCandidates} />

      <CandidateFilters savedSearches={savedSearches} />

      {/* Candidate Table with Bulk Selection */}
      <CandidateTable
        candidates={candidates || []}
        interestedCandidateIds={interestedCandidateIds}
      />
    </div>
  )
}
