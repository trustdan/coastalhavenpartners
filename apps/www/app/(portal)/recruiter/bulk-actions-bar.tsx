'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { X, Download, Bookmark, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { batchBookmarkCandidates } from './bookmark-actions'
import { toast } from 'sonner'

type CandidateProfile = {
  full_name: string | null
  email: string | null
}

type Candidate = {
  id: string
  profiles: CandidateProfile | null
}

interface BulkActionsBarProps {
  selectedIds: string[]
  onClear: () => void
  candidates: Candidate[]
}

export function BulkActionsBar({ selectedIds, onClear, candidates }: BulkActionsBarProps) {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'export' | 'bookmark' | 'email' | null>(null)

  if (selectedIds.length === 0) return null

  const handleExport = () => {
    setAction('export')
    // Build export URL with selected IDs
    const params = new URLSearchParams(searchParams.toString())
    params.set('ids', selectedIds.join(','))
    window.location.href = `/api/export/candidates?${params.toString()}`
    setTimeout(() => setAction(null), 1000)
  }

  const handleBookmarkAll = () => {
    setAction('bookmark')
    startTransition(async () => {
      try {
        const result = await batchBookmarkCandidates(selectedIds)
        toast.success(`Added ${result.added} candidate${result.added !== 1 ? 's' : ''} to saved`, {
          description: result.skipped > 0 ? `${result.skipped} already saved` : undefined
        })
        onClear()
      } catch {
        toast.error('Failed to save candidates')
      } finally {
        setAction(null)
      }
    })
  }

  const handleEmailAll = () => {
    // Collect all candidate emails
    const emails = candidates
      .map(c => c.profiles?.email)
      .filter((email): email is string => !!email)

    if (emails.length === 0) {
      toast.error('No email addresses found for selected candidates')
      return
    }

    // Open mailto link with BCC for privacy
    const mailtoLink = `mailto:?bcc=${emails.join(',')}`
    window.location.href = mailtoLink
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-3 rounded-full border bg-white px-4 py-2 shadow-lg dark:bg-neutral-900 dark:border-neutral-700">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {selectedIds.length} selected
        </span>

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={handleExport}
            disabled={isPending}
          >
            {action === 'export' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={handleBookmarkAll}
            disabled={isPending}
          >
            {action === 'bookmark' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            Save All
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={handleEmailAll}
            disabled={isPending}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onClear}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>
    </div>
  )
}
