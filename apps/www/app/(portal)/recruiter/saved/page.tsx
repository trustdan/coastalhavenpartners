import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Bookmark } from 'lucide-react'
import { getBookmarkedCandidates } from '../bookmark-actions'

export default async function SavedCandidatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify recruiter access
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select('is_approved')
    .eq('user_id', user.id)
    .single()

  if (!recruiterProfile?.is_approved) {
    redirect('/recruiter')
  }

  const bookmarks = await getBookmarkedCandidates()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Saved Candidates</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {bookmarks.length} candidate{bookmarks.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Bookmark className="h-8 w-8 text-neutral-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">No saved candidates yet</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Browse the candidate pool and click the Save button to bookmark candidates for later.
          </p>
          <Link
            href="/recruiter"
            className="mt-6 inline-block rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Browse Candidates
          </Link>
        </div>
      ) : (
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
                  <th className="px-6 py-3 text-left text-sm font-medium">Saved On</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookmarks.map((bookmark) => {
                  const candidate = bookmark.candidate_profiles as any
                  if (!candidate) return null

                  return (
                    <tr key={bookmark.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-200">
                          {candidate.gpa?.toFixed(2)}
                          {candidate.gpa_verified && (
                            <BadgeCheck className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{candidate.graduation_year}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : '-'}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
