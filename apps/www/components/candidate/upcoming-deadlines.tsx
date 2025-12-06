'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Bell, BellOff, Building2, MapPin, ChevronRight, Clock } from 'lucide-react'
import { toggleDeadlineReminder, type UpcomingDeadline } from '@/app/(portal)/candidate/deadline-actions'
import { toast } from 'sonner'

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadline[]
  showViewAll?: boolean
}

function formatDeadline(deadline: string): { text: string; urgent: boolean; daysLeft: number } {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return { text: 'Today', urgent: true, daysLeft: 0 }
  } else if (diffDays === 1) {
    return { text: 'Tomorrow', urgent: true, daysLeft: 1 }
  } else if (diffDays <= 3) {
    return { text: `${diffDays} days left`, urgent: true, daysLeft: diffDays }
  } else if (diffDays <= 7) {
    return { text: `${diffDays} days left`, urgent: false, daysLeft: diffDays }
  } else {
    return {
      text: deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      urgent: false,
      daysLeft: diffDays
    }
  }
}

function DeadlineCard({ deadline }: { deadline: UpcomingDeadline }) {
  const [hasReminder, setHasReminder] = useState(deadline.has_reminder)
  const [isPending, startTransition] = useTransition()

  const { text: deadlineText, urgent, daysLeft } = formatDeadline(deadline.application_deadline)

  const handleToggleReminder = () => {
    startTransition(async () => {
      const result = await toggleDeadlineReminder(deadline.id)
      if (result.success) {
        setHasReminder(!hasReminder)
        toast.success(
          hasReminder ? 'Reminder removed' : 'Reminder set for 3 days before deadline'
        )
      } else {
        toast.error('Failed to update reminder')
      }
    })
  }

  const jobTypeLabels: Record<string, string> = {
    full_time: 'Full Time',
    internship: 'Internship',
    summer_analyst: 'Summer Analyst',
    off_cycle: 'Off-Cycle',
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Firm logo or icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          {deadline.firm_logo_url ? (
            <img
              src={deadline.firm_logo_url}
              alt={deadline.firm_name}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <Building2 className="h-5 w-5 text-neutral-500" />
          )}
        </div>

        {/* Job details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${deadline.slug}`}
              className="font-medium truncate hover:text-blue-600 hover:underline"
            >
              {deadline.title}
            </Link>
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {jobTypeLabels[deadline.job_type] || deadline.job_type}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
            <span>{deadline.firm_name}</span>
            {deadline.locations && deadline.locations.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {deadline.locations[0]}
                  {deadline.locations.length > 1 && ` +${deadline.locations.length - 1}`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deadline and reminder */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
          urgent
            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
        }`}>
          <Clock className="h-3.5 w-3.5" />
          {deadlineText}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleReminder}
          disabled={isPending}
          className={hasReminder ? 'text-blue-600 hover:text-blue-700' : 'text-neutral-400 hover:text-neutral-600'}
          title={hasReminder ? 'Remove reminder' : 'Set reminder'}
        >
          {hasReminder ? (
            <Bell className="h-4 w-4 fill-current" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export function UpcomingDeadlines({ deadlines, showViewAll = true }: UpcomingDeadlinesProps) {
  if (deadlines.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-neutral-500" />
            Upcoming Deadlines
          </h2>
          {showViewAll && (
            <Link
              href="/candidate/deadlines"
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-neutral-500 py-4">
          No upcoming deadlines. Check back later or browse the job board.
        </p>
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Count urgent deadlines (within 7 days)
  const urgentCount = deadlines.filter(d => {
    const daysLeft = Math.ceil(
      (new Date(d.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysLeft <= 7
  }).length

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-neutral-500" />
            Upcoming Deadlines
          </h2>
          {urgentCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {urgentCount} this week
            </span>
          )}
        </div>
        {showViewAll && (
          <Link
            href="/candidate/deadlines"
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {deadlines.map((deadline) => (
          <DeadlineCard key={deadline.id} deadline={deadline} />
        ))}
      </div>
    </div>
  )
}
