import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CandidateFilters } from './candidate-filters'

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

  // Redirect candidates to candidate dashboard
  if (profile?.role === 'candidate') {
    redirect('/candidate')
  }

  // Check if recruiter is approved
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('is_approved, firm_name')
    .eq('user_id', user.id)
    .single()

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
      profiles:user_id (
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

  // Execute query with ordering
  const { data: candidates } = await query.order('gpa', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Candidate Pool</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {candidates?.length || 0} verified candidates available
        </p>
      </div>

      <CandidateFilters />

      {/* Candidate Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Target Roles</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {candidates && candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{candidate.profiles?.full_name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {candidate.profiles?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{candidate.school_name}</td>
                    <td className="px-6 py-4 text-sm">{candidate.major}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {candidate.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
                    <td className="px-6 py-4">
                      {candidate.target_roles && candidate.target_roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.target_roles.slice(0, 2).map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                            >
                              {role}
                            </span>
                          ))}
                          {candidate.target_roles.length > 2 && (
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                              +{candidate.target_roles.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/recruiter/candidates/${candidate.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-600 dark:text-neutral-400">
                    No verified candidates found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
