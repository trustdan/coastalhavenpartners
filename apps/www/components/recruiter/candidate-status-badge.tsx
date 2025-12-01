'use client'

import { cn } from '@/lib/utils'
import type { Database } from '@/lib/types/database.types'

export type BookmarkStatus = Database['public']['Enums']['bookmark_status']

export const BOOKMARK_STATUS_CONFIG: Record<
  BookmarkStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  new: {
    label: 'New',
    color: 'text-neutral-700 dark:text-neutral-300',
    bgColor: 'bg-neutral-100 dark:bg-neutral-800',
    borderColor: 'border-neutral-200 dark:border-neutral-700',
  },
  contacted: {
    label: 'Contacted',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  offer_extended: {
    label: 'Offer Extended',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  hired: {
    label: 'Hired',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  passed: {
    label: 'Passed',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  not_a_fit: {
    label: 'Not a Fit',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
}

interface CandidateStatusBadgeProps {
  status: BookmarkStatus
  size?: 'sm' | 'default'
  className?: string
}

export function CandidateStatusBadge({
  status,
  size = 'default',
  className,
}: CandidateStatusBadgeProps) {
  const config = BOOKMARK_STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.color,
        config.bgColor,
        config.borderColor,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
    >
      {config.label}
    </span>
  )
}
