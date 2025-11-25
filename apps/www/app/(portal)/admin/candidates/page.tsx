import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { verifyCandidate, rejectCandidate, revokeCandidate, reinstateCandidate } from '../actions'
import { Mail, Linkedin } from 'lucide-react'
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
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch profiles separately to avoid RLS join issues
  const userIds = candidates?.map(c => c.user_id).filter(Boolean) || []
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, linkedin_url')
    .in('id', userIds)

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
                  <td className="px-6 py-4 text-sm">{candidate.gpa.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {candidate.profiles?.linkedin_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={candidate.profiles.linkedin_url} target="_blank" rel="noopener noreferrer" title="View LinkedIn">
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${candidate.profiles?.email}`} title="Contact Candidate">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={rejectCandidate.bind(null, candidate.id)}>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          Reject
                        </Button>
                      </form>
                      <form action={verifyCandidate.bind(null, candidate.id)}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Verify
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
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
                  <td className="px-6 py-4 text-sm">{candidate.gpa.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                      ${candidate.status === 'placed' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
                        : candidate.status === 'active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'}
                    `}>
                      {(candidate.status || 'verified').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {candidate.profiles?.linkedin_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={candidate.profiles.linkedin_url} target="_blank" rel="noopener noreferrer" title="View LinkedIn">
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${candidate.profiles?.email}`} title="Contact Candidate">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={revokeCandidate.bind(null, candidate.id)}>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          Revoke
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
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
                  <td className="px-6 py-4 text-sm">{candidate.gpa.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {candidate.rejected_at ? new Date(candidate.rejected_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${candidate.profiles?.email}`} title="Contact Candidate">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={reinstateCandidate.bind(null, candidate.id)}>
                        <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                          Reinstate
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
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
