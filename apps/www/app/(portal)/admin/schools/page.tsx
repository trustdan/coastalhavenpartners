import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { approveSchool, rejectSchool, reinstateSchool } from '../actions'
import { Mail, Globe, FileText, ExternalLink } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  employment_letter: 'Employment Letter',
  staff_id: 'Staff ID',
  accreditation_cert: 'Accreditation Certificate',
  authorization_letter: 'Authorization Letter',
}

const STATUS_COLORS: Record<string, string> = {
  pending_documents: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
  documents_submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
}

export default async function AdminSchoolsPage() {
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

  // Fetch all school profiles (using admin client to bypass RLS)
  const { data: schools } = await supabaseAdmin
    .from('school_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch profiles separately to avoid RLS join issues
  const userIds = schools?.map(s => s.user_id).filter(Boolean) || []
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  // Combine schools with their profiles
  const schoolsWithProfiles = schools?.map(school => ({
    ...school,
    profiles: profiles?.find(p => p.id === school.user_id) || null
  })) || []

  // Filter into three categories
  const pendingSchools = schoolsWithProfiles.filter(s => !s.is_approved && !s.is_rejected)
  const activeSchools = schoolsWithProfiles.filter(s => s.is_approved && !s.is_rejected)
  const rejectedSchools = schoolsWithProfiles.filter(s => s.is_rejected)

  return (
    <div className="space-y-12">
      {/* Pending Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">School Approvals</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {pendingSchools.length} pending requests
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Verification</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Applied</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pendingSchools.map((school) => (
                <tr key={school.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{school.profiles?.full_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {school.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{school.school_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {school.department_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Domain: {school.school_domain}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[school.verification_status || 'pending_documents']}`}>
                        {(school.verification_status || 'pending_documents').replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {school.verification_document_url && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-neutral-500" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {DOCUMENT_TYPE_LABELS[school.verification_document_type || ''] || 'Document'}
                          </span>
                          <a 
                            href={school.verification_document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {!school.verification_document_url && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          No document uploaded
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {school.created_at ? new Date(school.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {school.website && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={school.website} target="_blank" rel="noopener noreferrer" title="Visit Website">
                            <Globe className="h-4 w-4" />
                            <span className="sr-only">Website</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${school.contact_email || school.profiles?.email}`} title="Contact School">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={rejectSchool.bind(null, school.id)}>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          Reject
                        </Button>
                      </form>
                      <form action={approveSchool.bind(null, school.id)}>
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

          {pendingSchools.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No pending school requests
            </div>
          )}
        </div>
      </div>

      {/* Active Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Active Schools</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {activeSchools.length} approved schools
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Verification</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Approved</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeSchools.map((school) => (
                <tr key={school.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{school.profiles?.full_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {school.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{school.school_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {school.department_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Domain: {school.school_domain}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {school.verification_document_url && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {DOCUMENT_TYPE_LABELS[school.verification_document_type || ''] || 'Verified'}
                          </span>
                          <a 
                            href={school.verification_document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {school.approved_at ? new Date(school.approved_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {school.website && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={school.website} target="_blank" rel="noopener noreferrer" title="Visit Website">
                            <Globe className="h-4 w-4" />
                            <span className="sr-only">Website</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${school.contact_email || school.profiles?.email}`} title="Contact School">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={rejectSchool.bind(null, school.id)}>
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

          {activeSchools.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No active schools
            </div>
          )}
        </div>
      </div>

      {/* Rejected Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Rejected Schools</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {rejectedSchools.length} rejected/revoked schools
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-neutral-900">
          <table className="w-full">
            <thead className="border-b bg-red-50 dark:bg-red-900/20">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-medium">School</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Verification</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Rejected</th>
                <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rejectedSchools.map((school) => (
                <tr key={school.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{school.profiles?.full_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {school.profiles?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{school.school_name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {school.department_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Domain: {school.school_domain}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {school.verification_document_url ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-neutral-500" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {DOCUMENT_TYPE_LABELS[school.verification_document_type || ''] || 'Document'}
                          </span>
                          <a 
                            href={school.verification_document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-500">No document</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {school.rejected_at ? new Date(school.rejected_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${school.contact_email || school.profiles?.email}`} title="Contact School">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Contact</span>
                        </a>
                      </Button>
                      <form action={reinstateSchool.bind(null, school.id)}>
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

          {rejectedSchools.length === 0 && (
            <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
              No rejected schools
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
