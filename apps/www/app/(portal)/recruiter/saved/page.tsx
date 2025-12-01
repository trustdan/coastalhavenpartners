import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { getBookmarkedCandidates } from '../bookmark-actions'
import { SavedCandidatesTable } from '@/components/recruiter/saved-candidates-table'

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
        <SavedCandidatesTable bookmarks={bookmarks as any} />
      )}
    </div>
  )
}
