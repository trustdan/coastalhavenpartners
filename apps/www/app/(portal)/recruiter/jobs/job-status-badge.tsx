import type { Database } from '@/lib/types/database.types'

type JobListingStatus = Database['public']['Enums']['job_listing_status']

const statusConfig: Record<JobListingStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  },
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  },
  paused: {
    label: 'Paused',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
  },
  filled: {
    label: 'Filled',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
  },
}

interface JobStatusBadgeProps {
  status: JobListingStatus
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
