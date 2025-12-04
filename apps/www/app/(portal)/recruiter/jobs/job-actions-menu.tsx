'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Play,
  Pause,
  XCircle,
  Trash2,
  Users,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import {
  publishJobListing,
  pauseJobListing,
  closeJobListing,
  reopenJobListing,
  deleteJobListing,
} from './actions'
import type { Database } from '@/lib/types/database.types'

type JobListing = Database['public']['Tables']['job_listings']['Row']

interface JobActionsMenuProps {
  job: JobListing
}

export function JobActionsMenu({ job }: JobActionsMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = () => {
    setError(null)
    startTransition(async () => {
      const result = await publishJobListing(job.id)
      if (!result.success) {
        setError(result.error || 'Failed to publish job')
      }
      router.refresh()
    })
  }

  const handlePause = () => {
    setError(null)
    startTransition(async () => {
      const result = await pauseJobListing(job.id)
      if (!result.success) {
        setError(result.error || 'Failed to pause job')
      }
      router.refresh()
    })
  }

  const handleClose = () => {
    setError(null)
    startTransition(async () => {
      const result = await closeJobListing(job.id)
      if (!result.success) {
        setError(result.error || 'Failed to close job')
      }
      router.refresh()
    })
  }

  const handleReopen = () => {
    setError(null)
    startTransition(async () => {
      const result = await reopenJobListing(job.id)
      if (!result.success) {
        setError(result.error || 'Failed to reopen job')
      }
      router.refresh()
    })
  }

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteJobListing(job.id)
      if (!result.success) {
        setError(result.error || 'Failed to delete job')
      } else {
        setShowDeleteDialog(false)
      }
      router.refresh()
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/recruiter/jobs/${job.id}`} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit Job
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/recruiter/jobs/${job.id}/applications`} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              View Applications
            </Link>
          </DropdownMenuItem>

          {job.status === 'active' && (
            <DropdownMenuItem asChild>
              <Link href={`/candidate/jobs/${job.slug}`} target="_blank" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View Public Listing
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {job.status === 'draft' && (
            <DropdownMenuItem onClick={handlePublish} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Publish Job
            </DropdownMenuItem>
          )}

          {job.status === 'active' && (
            <>
              <DropdownMenuItem onClick={handlePause} className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Pause Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClose} className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                Close Job
              </DropdownMenuItem>
            </>
          )}

          {job.status === 'paused' && (
            <>
              <DropdownMenuItem onClick={handleReopen} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Reopen Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClose} className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                Close Job
              </DropdownMenuItem>
            </>
          )}

          {(job.status === 'closed' || job.status === 'filled') && (
            <DropdownMenuItem onClick={handleReopen} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Reopen Job
            </DropdownMenuItem>
          )}

          {job.status === 'draft' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete Draft
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job draft "{job.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-red-100 p-4 text-sm text-red-800 shadow-lg dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}
    </>
  )
}
