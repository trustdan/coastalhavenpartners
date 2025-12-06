'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Bell,
  BellOff,
  Building2,
  MapPin,
  Clock,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { toggleDeadlineReminder, type UpcomingDeadline } from '../deadline-actions'
import { toast } from 'sonner'

interface DeadlinesPageClientProps {
  initialDeadlines: UpcomingDeadline[]
}

function formatDeadline(deadline: string): { text: string; fullDate: string; urgent: boolean; daysLeft: number } {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const fullDate = deadlineDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (diffDays <= 0) {
    return { text: 'Today', fullDate, urgent: true, daysLeft: 0 }
  } else if (diffDays === 1) {
    return { text: 'Tomorrow', fullDate, urgent: true, daysLeft: 1 }
  } else if (diffDays <= 3) {
    return { text: `${diffDays} days left`, fullDate, urgent: true, daysLeft: diffDays }
  } else if (diffDays <= 7) {
    return { text: `${diffDays} days left`, fullDate, urgent: false, daysLeft: diffDays }
  } else {
    return {
      text: deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate,
      urgent: false,
      daysLeft: diffDays,
    }
  }
}

function DeadlineRow({ deadline }: { deadline: UpcomingDeadline }) {
  const [hasReminder, setHasReminder] = useState(deadline.has_reminder)
  const [isPending, startTransition] = useTransition()

  const { text: deadlineText, fullDate, urgent, daysLeft } = formatDeadline(deadline.application_deadline)

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

  const firmTypeLabels: Record<string, string> = {
    investment_bank: 'Investment Bank',
    private_equity: 'Private Equity',
    hedge_fund: 'Hedge Fund',
    venture_capital: 'Venture Capital',
    asset_management: 'Asset Management',
    consulting: 'Consulting',
    corporate: 'Corporate',
    other: 'Other',
  }

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-neutral-900 ${
      urgent ? 'border-red-200 dark:border-red-900/50' : ''
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Job info */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Firm logo */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            {deadline.firm_logo_url ? (
              <img
                src={deadline.firm_logo_url}
                alt={deadline.firm_name}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-neutral-500" />
            )}
          </div>

          {/* Job details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/jobs/${deadline.slug}`}
                className="text-lg font-semibold hover:text-blue-600 hover:underline"
              >
                {deadline.title}
              </Link>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {jobTypeLabels[deadline.job_type] || deadline.job_type}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
              <Link
                href={`/firms/${deadline.firm_slug}`}
                className="font-medium hover:text-blue-600 hover:underline"
              >
                {deadline.firm_name}
              </Link>
              <span className="text-neutral-400">•</span>
              <span>{firmTypeLabels[deadline.firm_type] || deadline.firm_type}</span>
            </div>

            {deadline.locations && deadline.locations.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5" />
                {deadline.locations.join(', ')}
              </div>
            )}

            {deadline.target_roles && deadline.target_roles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {deadline.target_roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Deadline and actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Deadline badge */}
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
              urgent
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : daysLeft <= 14
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              <Clock className="h-4 w-4" />
              {deadlineText}
            </div>
            <p className="mt-1 text-xs text-neutral-500">{fullDate}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleReminder}
              disabled={isPending}
              className={`gap-1.5 ${hasReminder ? 'border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50' : ''}`}
            >
              {hasReminder ? (
                <>
                  <Bell className="h-4 w-4 fill-current" />
                  Reminder Set
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  Set Reminder
                </>
              )}
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href={`/jobs/${deadline.slug}`} className="gap-1.5">
                View Job
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeadlinesPageClient({ initialDeadlines }: DeadlinesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [firmTypeFilter, setFirmTypeFilter] = useState<string>('all')
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all')
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all')

  // Filter deadlines
  const filteredDeadlines = initialDeadlines.filter((deadline) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        deadline.title.toLowerCase().includes(query) ||
        deadline.firm_name.toLowerCase().includes(query) ||
        deadline.locations?.some((l) => l.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    // Firm type filter
    if (firmTypeFilter !== 'all' && deadline.firm_type !== firmTypeFilter) {
      return false
    }

    // Job type filter
    if (jobTypeFilter !== 'all' && deadline.job_type !== jobTypeFilter) {
      return false
    }

    // Timeframe filter
    if (timeframeFilter !== 'all') {
      const daysLeft = Math.ceil(
        (new Date(deadline.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      if (timeframeFilter === 'week' && daysLeft > 7) return false
      if (timeframeFilter === 'month' && daysLeft > 30) return false
      if (timeframeFilter === 'quarter' && daysLeft > 90) return false
    }

    return true
  })

  // Get unique firm types and job types for filters
  const firmTypes = [...new Set(initialDeadlines.map((d) => d.firm_type))].filter(Boolean)
  const jobTypes = [...new Set(initialDeadlines.map((d) => d.job_type))].filter(Boolean)

  const firmTypeLabels: Record<string, string> = {
    investment_bank: 'Investment Bank',
    private_equity: 'Private Equity',
    hedge_fund: 'Hedge Fund',
    venture_capital: 'Venture Capital',
    asset_management: 'Asset Management',
    consulting: 'Consulting',
    corporate: 'Corporate',
    other: 'Other',
  }

  const jobTypeLabels: Record<string, string> = {
    full_time: 'Full Time',
    internship: 'Internship',
    summer_analyst: 'Summer Analyst',
    off_cycle: 'Off-Cycle',
  }

  if (initialDeadlines.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center shadow-sm dark:bg-neutral-900">
        <Calendar className="mx-auto h-12 w-12 text-neutral-400" />
        <h2 className="mt-4 text-xl font-semibold">No Upcoming Deadlines</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          There are no active job listings with upcoming deadlines right now.
        </p>
        <Button asChild className="mt-6">
          <Link href="/jobs">Browse All Jobs</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search jobs or firms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Firm Type Filter */}
          <Select value={firmTypeFilter} onValueChange={setFirmTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Firm Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Firm Types</SelectItem>
              {firmTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {firmTypeLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Job Type Filter */}
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {jobTypeLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Timeframe Filter */}
          <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
            <SelectTrigger className="w-[160px]">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deadlines</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Next 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="mt-3 text-sm text-neutral-500">
          Showing {filteredDeadlines.length} of {initialDeadlines.length} deadlines
        </p>
      </div>

      {/* Deadlines list */}
      {filteredDeadlines.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400">
            No deadlines match your filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeadlines.map((deadline) => (
            <DeadlineRow key={deadline.id} deadline={deadline} />
          ))}
        </div>
      )}
    </div>
  )
}
