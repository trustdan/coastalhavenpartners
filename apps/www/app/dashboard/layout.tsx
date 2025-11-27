import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // Get the appropriate dashboard link based on role
  const getDashboardLink = () => {
    switch (profile?.role) {
      case 'recruiter':
        return '/recruiter'
      case 'candidate':
        return '/candidate'
      case 'school_admin':
        return '/school'
      case 'admin':
        return '/admin'
      default:
        return '/'
    }
  }

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
          <Link href="/" className="text-xl font-bold">
            Coastal Haven Partners
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href={getDashboardLink()}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Dashboard
            </Link>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {profile?.full_name}
            </span>
            <form action={handleLogout}>
              <Button type="submit" variant="outline" size="sm">
                Log Out
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
