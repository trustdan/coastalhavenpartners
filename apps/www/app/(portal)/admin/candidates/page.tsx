import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { CandidateRow } from './candidate-row'
import type { Database } from '@/lib/types/database.types'

export default async function AdminCandidatesPage() {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Use admin client to bypass RLS for admin operations
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

  // Verify user has admin role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/login')
  }

  // Fetch all candidates (using admin client to bypass RLS)
  const { data: candidates } = await supabaseAdmin
    .from('candidate_profiles')
    .select('id, user_id, school_name, major, gpa, graduation_year, status, is_rejected, rejected_at, resume_url, transcript_url')
    .order('created_at', { ascending: false })

  // Fetch profiles separately to avoid RLS join issues
  const userIds = (candidates?.map(c => c.user_id).filter((id): id is string => id !== null) || [])
  const { data: profiles } = userIds.length > 0 
    ? await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, linkedin_url')
        .in('id', userIds)
    : { data: [] }

  // Combine candidates with their profiles
  const candidatesWithProfiles = candidates?.map(candidate => ({
    ...candidate,
    profiles: profiles?.find(p => p.id === candidate.user_id) || null
  })) || []

  // Filter into three categories
  const pendingCandidates = candidatesWithProfiles.filter(c => 
    c.status === 'pending_verification' && !c.is_rejected
  )
  const verifiedCandidates = candidatesWithProfiles.filter(c => 
    (c.status === 'verified' || c.status === 'active' || c.status === 'placed') && !c.is_rejected
  )
  const rejectedCandidates = candidatesWithProfiles.filter(c => c.is_rejected)

  return (
    <div className="space-y-12">
      {/* Pending Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Candidate Verification</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {pendingCandidates.length} pending verification
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Grad Year</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingCandidates.map((candidate) => (
                <CandidateRow key={candidate.id} candidate={candidate} variant="pending" />
              ))}
            </tbody>
          </table>

          {pendingCandidates.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No pending candidates
            </div>
          )}
        </div>
      </div>

      {/* Verified Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Verified Candidates</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {verifiedCandidates.length} verified candidates
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {verifiedCandidates.map((candidate) => (
                <CandidateRow key={candidate.id} candidate={candidate} variant="verified" />
              ))}
            </tbody>
          </table>

          {verifiedCandidates.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No verified candidates
            </div>
          )}
        </div>
      </div>

      {/* Revoked Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Access Revoked</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {rejectedCandidates.length} suspended candidate accounts
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-red-50 dark:bg-red-900/20">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Major</th>
                <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Suspended</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rejectedCandidates.map((candidate) => (
                <CandidateRow key={candidate.id} candidate={candidate} variant="rejected" />
              ))}
            </tbody>
          </table>

          {rejectedCandidates.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No suspended accounts
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
