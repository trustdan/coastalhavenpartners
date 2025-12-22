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
import { RecruiterDashboardClient } from '@/components/recruiter/recruiter-dashboard-client'
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
  // Profile completion filters
  const hasResume = typeof params.hasResume === 'string' ? params.hasResume === 'true' : false
  const hasTranscript = typeof params.hasTranscript === 'string' ? params.hasTranscript === 'true' : false
  const hasCalendar = typeof params.hasCalendar === 'string' ? params.hasCalendar === 'true' : false
  const hasBio = typeof params.hasBio === 'string' ? params.hasBio === 'true' : false
  const hasTargetRoles = typeof params.hasTargetRoles === 'string' ? params.hasTargetRoles === 'true' : false
  const hasLocations = typeof params.hasLocations === 'string' ? params.hasLocations === 'true' : false

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

  // Handle case where recruiter profile doesn't exist
  if (!recruiterProfile) {
    redirect('/complete-profile/recruiter')
  }

  const isRecruiterVerified = recruiterProfile.is_approved === true

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
      resume_url,
      transcript_url,
      scheduling_url,
      bio,
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

  // Profile completion filters
  if (hasResume) {
    query = query.not('resume_url', 'is', null)
  }
  if (hasTranscript) {
    query = query.not('transcript_url', 'is', null)
  }
  if (hasCalendar) {
    query = query.not('scheduling_url', 'is', null)
  }
  if (hasBio) {
    query = query.not('bio', 'is', null).neq('bio', '')
  }
  if (hasTargetRoles) {
    query = query.not('target_roles', 'is', null)
  }
  if (hasLocations) {
    query = query.not('preferred_locations', 'is', null)
  }

  // Execute query with ordering
  const { data: candidates } = await query.order('gpa', { ascending: false })

  // Check if recruiter has any candidates to view (for demo mode)
  const hasCandidates = (candidates?.length ?? 0) > 0

  return (
    <div className="space-y-8">
      {/* Verification Pending Banner */}
      {!isRecruiterVerified && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <svg
                className="h-5 w-5 text-yellow-600"
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
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Account Pending Verification
              </h2>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Your recruiter account is being reviewed by our team. While pending, you can browse the candidate pool with limited visibility.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white/50 p-3 dark:bg-neutral-900/50">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">What you can see:</p>
                  <ul className="mt-1 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>School names and majors</li>
                    <li>GPA and graduation year</li>
                    <li>Target roles and locations</li>
                    <li>Candidates interested in your firm</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-white/50 p-3 dark:bg-neutral-900/50">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">After verification:</p>
                  <ul className="mt-1 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <li>Candidate names and contact info</li>
                    <li>Full profile access</li>
                    <li>Resume and transcript downloads</li>
                    <li>Direct messaging</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo-aware content */}
      <RecruiterDashboardClient
        hasCandidates={hasCandidates}
        headerComponent={
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Candidate Pool</h1>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                {candidates?.length || 0} verified candidates available
                {!isRecruiterVerified && ' (limited view)'}
              </p>
            </div>
            {isRecruiterVerified && <ExportButton />}
          </div>
        }
        recommendationsComponent={
          isRecruiterVerified ? <RecommendedCandidates candidates={recommendedCandidates} /> : null
        }
        filtersComponent={
          <CandidateFilters savedSearches={isRecruiterVerified ? savedSearches : []} />
        }
        candidateTableComponent={
          <CandidateTable
            candidates={candidates || []}
            interestedCandidateIds={interestedCandidateIds}
            isRecruiterVerified={isRecruiterVerified}
          />
        }
      />
    </div>
  )
}
