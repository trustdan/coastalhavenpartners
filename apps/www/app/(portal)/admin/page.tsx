import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { approveRecruiter, rejectRecruiter, reinstateRecruiter } from './actions'
import { Mail, Linkedin } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

export default async function AdminDashboard() {
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
  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    redirect('/login')
  }

  // Fetch all recruiters (using admin client to bypass RLS)
  const { data: recruiters } = await supabaseAdmin
    .from('recruiter_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch profiles separately to avoid RLS join issues
  const userIds = recruiters?.map(r => r.user_id).filter(Boolean) || []
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, linkedin_url, created_at')
    .in('id', userIds)

  // Combine recruiters with their profiles
  const recruitersWithProfiles = recruiters?.map(recruiter => ({
    ...recruiter,
    profiles: profiles?.find(p => p.id === recruiter.user_id) || null
  })) || []

  // Filter into three categories
  const pendingRecruiters = recruitersWithProfiles.filter(r => !r.is_approved && !r.is_rejected)
  const activeRecruiters = recruitersWithProfiles.filter(r => r.is_approved && !r.is_rejected)
  const rejectedRecruiters = recruitersWithProfiles.filter(r => r.is_rejected)

  return (
    <div className="space-y-12">
      {/* Pending Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Approvals</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {pendingRecruiters.length} pending requests
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Firm</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Joined</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingRecruiters.map((recruiter) => (
                <tr key={recruiter.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{recruiter.profiles?.full_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {recruiter.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{recruiter.firm_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {recruiter.firm_type}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{recruiter.job_title}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {recruiter.created_at ? new Date(recruiter.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {recruiter.profiles?.linkedin_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={recruiter.profiles.linkedin_url} target="_blank" rel="noopener noreferrer" title="View LinkedIn">
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${recruiter.profiles?.email}`} title="Contact Recruiter">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={rejectRecruiter.bind(null, recruiter.id)}>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          Reject
                        </Button>
                      </form>
                      <form action={approveRecruiter.bind(null, recruiter.id)}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pendingRecruiters.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No pending recruiter requests
            </div>
          )}
        </div>
      </div>

      {/* Active Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Active Recruiters</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {activeRecruiters.length} approved recruiters
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Firm</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Approved</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeRecruiters.map((recruiter) => (
                <tr key={recruiter.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{recruiter.profiles?.full_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {recruiter.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{recruiter.firm_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {recruiter.firm_type}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{recruiter.job_title}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {recruiter.approved_at ? new Date(recruiter.approved_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {recruiter.profiles?.linkedin_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={recruiter.profiles.linkedin_url} target="_blank" rel="noopener noreferrer" title="View LinkedIn">
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${recruiter.profiles?.email}`} title="Contact Recruiter">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={rejectRecruiter.bind(null, recruiter.id)}>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          Revoke Access
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeRecruiters.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No active recruiters
            </div>
          )}
        </div>
      </div>

      {/* Revoked Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Access Revoked</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {rejectedRecruiters.length} suspended recruiter accounts
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-red-50 dark:bg-red-900/20">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Firm</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Suspended</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rejectedRecruiters.map((recruiter) => (
                <tr key={recruiter.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{recruiter.profiles?.full_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {recruiter.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{recruiter.firm_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {recruiter.firm_type}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{recruiter.job_title}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {recruiter.rejected_at ? new Date(recruiter.rejected_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {recruiter.profiles?.linkedin_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={recruiter.profiles.linkedin_url} target="_blank" rel="noopener noreferrer" title="View LinkedIn">
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${recruiter.profiles?.email}`} title="Contact Recruiter">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={reinstateRecruiter.bind(null, recruiter.id)}>
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

          {rejectedRecruiters.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No suspended accounts
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
