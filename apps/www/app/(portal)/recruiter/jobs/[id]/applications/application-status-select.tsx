'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { updateApplicationStatus } from '../../actions'
import type { Database } from '@/lib/types/database.types'

type ApplicationStatus = Database['public']['Enums']['application_status']

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

interface ApplicationStatusSelectProps {
  applicationId: string
  currentStatus: ApplicationStatus
}

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: ApplicationStatusSelectProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleChange = (status: ApplicationStatus) => {
    startTransition(async () => {
      await updateApplicationStatus(applicationId, status)
      router.refresh()
    })
  }

  if (currentStatus === 'withdrawn') {
    return (
      <span className="text-sm text-neutral-500 italic">Withdrawn</span>
    )
  }

  return (
    <div className="relative">
      <Select
        value={currentStatus}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-32 h-8 text-xs">
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <SelectValue />
          )}
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
