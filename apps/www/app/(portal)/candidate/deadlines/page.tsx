import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Briefcase } from 'lucide-react'
import { getUpcomingDeadlinesForPage } from '../deadline-actions'
import { DeadlinesPageClient } from './deadlines-page-client'

export const metadata = {
  title: 'Application Deadlines | Coastal Haven Partners',
  description: 'Track upcoming job application deadlines and set reminders',
}

export default async function DeadlinesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify candidate access
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!candidateProfile) {
    redirect('/candidate')
  }

  const deadlines = await getUpcomingDeadlinesForPage()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" className="mb-2 -ml-2 gap-2">
            <Link href="/candidate">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Calendar className="h-8 w-8 text-neutral-500" />
            Application Deadlines
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Track upcoming deadlines and set reminders so you never miss an opportunity
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Link>
        </Button>
      </div>

      {/* Client component for filtering and display */}
      <DeadlinesPageClient initialDeadlines={deadlines} />
    </div>
  )
}
