import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { verifyCandidate, revokeCandidate } from '../actions'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default async function AdminCandidatesPage() {
  const supabase = await createClient()

  // Fetch all candidates
  const { data: candidates } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Candidate Management</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {candidates?.length || 0} total candidates
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        <table className="w-full">
          <thead className="border-b bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">School</th>
              <th className="px-6 py-3 text-left text-sm font-medium">GPA</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {candidates?.map((candidate) => (
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
                <td className="px-6 py-4 text-sm">{candidate.gpa.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                    ${candidate.status === 'verified' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                      : candidate.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'}
                  `}>
                    {candidate.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${candidate.profiles?.email}`} title="Contact Candidate">
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Contact</span>
                      </a>
                    </Button>
                    {candidate.status !== 'verified' ? (
                      <form action={verifyCandidate.bind(null, candidate.id)}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Verify
                        </Button>
                      </form>
                    ) : (
                      <form action={revokeCandidate.bind(null, candidate.id)}>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          Revoke
                        </Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!candidates || candidates.length === 0 && (
          <div className="p-12 text-center text-neutral-600 dark:text-neutral-400">
            No candidates found
          </div>
        )}
      </div>
    </div>
  )
}
