'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  CandidateStatusBadge,
  BOOKMARK_STATUS_CONFIG,
  type BookmarkStatus,
} from './candidate-status-badge'
import { updateCandidateStatus } from '@/app/(portal)/recruiter/bookmark-actions'

const STATUS_ORDER: BookmarkStatus[] = [
  'new',
  'contacted',
  'interviewing',
  'offer_extended',
  'hired',
  'passed',
  'not_a_fit',
]

interface CandidateStatusSelectProps {
  candidateId: string
  currentStatus: BookmarkStatus
  onStatusChange?: (newStatus: BookmarkStatus) => void
}

export function CandidateStatusSelect({
  candidateId,
  currentStatus,
  onStatusChange,
}: CandidateStatusSelectProps) {
  const [status, setStatus] = useState<BookmarkStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (newStatus: BookmarkStatus) => {
    if (newStatus === status) return

    setStatus(newStatus)
    startTransition(async () => {
      await updateCandidateStatus(candidateId, newStatus)
      onStatusChange?.(newStatus)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2',
            isPending && 'opacity-70'
          )}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CandidateStatusBadge status={status} size="sm" />
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {STATUS_ORDER.map((s) => {
          const config = BOOKMARK_STATUS_CONFIG[s]
          return (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusChange(s)}
              className={cn(
                'cursor-pointer',
                s === status && 'bg-neutral-100 dark:bg-neutral-800'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                  config.color,
                  config.bgColor,
                  config.borderColor
                )}
              >
                {config.label}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
