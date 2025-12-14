import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MFAPromptBanner } from '@/components/auth/mfa-prompt-banner'
import { PortalNavExtras } from '@/components/portal/nav-extras'
import { MessageBadge } from '@/components/portal/message-badge'
import { NotificationPrompt } from '@/components/notification-prompt'

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a recruiter
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // Redirect candidates to candidate dashboard
  if (profile?.role === 'candidate') {
    redirect('/candidate')
  }

  // If not recruiter or candidate, redirect to login
  if (profile?.role !== 'recruiter') {
    redirect('/login')
  }

  async function handleLogout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <MFAPromptBanner settingsPath="/recruiter/settings" />
      <nav className="border-b bg-white dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Coastal Haven Partners
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/recruiter"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Dashboard
            </Link>
            <Link
              href="/recruiter/jobs"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Jobs
            </Link>
            <Link
              href="/recruiter/schools"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Schools
            </Link>
            <Link
              href="/recruiter/class"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Classes
            </Link>
            <Link
              href="/recruiter/saved"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Saved
            </Link>
            <Link
              href="/recruiter/campaigns"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Campaigns
            </Link>
            <Link
              href="/recruiter/network"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Network
            </Link>
            <Link
              href="/recruiter/firm"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Firm
            </Link>
            <Link
              href="/insights"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Insights
            </Link>
            <Link
              href="/firms-directory"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Firms Index
            </Link>
            <MessageBadge role="recruiter" userId={user.id} />
            <Link
              href="/recruiter/settings"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Settings
            </Link>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {profile?.full_name}
            </span>
            <PortalNavExtras />
            <form action={handleLogout}>
              <Button type="submit" variant="outline" size="sm">
                Log Out
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <NotificationPrompt userType="recruiter" />
    </div>
  )
}
