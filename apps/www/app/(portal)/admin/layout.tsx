import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/types/database.types'

function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null
  
  return (
    <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white min-w-[18px]">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use admin client for all queries to bypass RLS
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

  // Verify admin role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/login')
  }

  // Fetch pending counts
  const [
    { count: pendingRecruiters },
    { count: pendingCandidates },
    { count: pendingSchools }
  ] = await Promise.all([
    supabaseAdmin
      .from('recruiter_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false)
      .or('is_rejected.is.null,is_rejected.eq.false'),
    supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_verification'),
    supabaseAdmin
      .from('school_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false)
      .or('is_rejected.is.null,is_rejected.eq.false'),
  ])

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <nav className="border-b bg-white dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold text-purple-600 dark:text-purple-400">
              Coastal Haven Admin
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/admin" className="flex items-center text-neutral-600 hover:text-purple-600 dark:text-neutral-400">
                Recruiters
                <NotificationBadge count={pendingRecruiters || 0} />
              </Link>
              <Link href="/admin/candidates" className="flex items-center text-neutral-600 hover:text-purple-600 dark:text-neutral-400">
                Candidates
                <NotificationBadge count={pendingCandidates || 0} />
              </Link>
              <Link href="/admin/schools" className="flex items-center text-neutral-600 hover:text-purple-600 dark:text-neutral-400">
                Schools
                <NotificationBadge count={pendingSchools || 0} />
              </Link>
            </div>
          </div>
          <form action={handleLogout}>
            <Button type="submit" variant="outline" size="sm">
              Log Out
            </Button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
