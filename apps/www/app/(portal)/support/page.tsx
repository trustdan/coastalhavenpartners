import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  HelpCircle,
  ExternalLink,
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SupportForms } from './support-forms'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Require authentication
  if (!user) {
    redirect('/login?redirect=/support')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  // Check if user has a valid role (is verified/approved)
  const validRoles = ['candidate', 'recruiter', 'school_admin', 'admin']
  const isVerified = profile?.role && validRoles.includes(profile.role)

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <nav className="border-b bg-white dark:bg-neutral-900">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              Coastal Haven Partners
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <LogIn className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Complete Your Profile</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Please complete your profile setup before accessing the support center.
            </p>
            <Button asChild className="mt-6">
              <Link href="/complete-profile">Complete Profile</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <nav className="border-b bg-white dark:bg-neutral-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Coastal Haven Partners
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/help">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Support & Feedback</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Need help or want to share your thoughts? We&apos;re here to listen.
          </p>
        </div>

        {/* Forms - client component with user data pre-filled */}
        <SupportForms
          userName={profile?.full_name || ''}
          userEmail={profile?.email || user.email || ''}
        />

        {/* Additional Resources */}
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-4">Other Ways to Get Help</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/help"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Help Center</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Browse our guides</p>
              </div>
            </Link>
            <a
              href="https://discord.gg/MarkPXNfXd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg className="h-5 w-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <div>
                <p className="font-medium">Discord Community</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Chat with the community</p>
              </div>
              <ExternalLink className="h-4 w-4 text-neutral-400 ml-auto" />
            </a>
            <a
              href="mailto:contact@coastalhavenpartners.com"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">contact@coastalhavenpartners.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Privacy Notice:</strong> Your messages are stored securely and are only accessible to our support team.
            We do not share your information with third parties.
          </p>
        </div>
      </main>
    </div>
  )
}
