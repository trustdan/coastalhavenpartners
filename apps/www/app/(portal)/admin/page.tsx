import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { approveRecruiter, rejectRecruiter } from './actions'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch pending recruiters
  const { data: pendingRecruiters } = await supabase
    .from('recruiter_profiles')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        created_at
      )
    `)
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recruiter Approvals</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {pendingRecruiters?.length || 0} pending requests
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
            {pendingRecruiters?.map((recruiter) => (
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
                  {new Date(recruiter.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
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

        {!pendingRecruiters || pendingRecruiters.length === 0 && (
          <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
            No pending recruiter requests
          </div>
        )}
      </div>
    </div>
  )
}

