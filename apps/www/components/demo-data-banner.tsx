'use client'

import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface DemoDataBannerProps {
  /** Title shown in the banner (e.g., "Sample Data", "Sample Analytics") */
  title?: string
  /** Description explaining the demo data */
  description?: string
  /** Called when user confirms clearing demo data */
  onDismiss: () => void
  /** Custom class name for the container */
  className?: string
}

export function DemoDataBanner({
  title = 'Sample Data',
  description = 'This is example data to preview the dashboard. Real data will appear once you have activity.',
  onDismiss,
  className = '',
}: DemoDataBannerProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  return (
    <>
      <div
        className={`mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {title}
            </p>
            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
              {description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            className="shrink-0 text-amber-600 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
          >
            Clear
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Sample Data</AlertDialogTitle>
            <AlertDialogDescription>
              Remove all sample data? This will show an empty view until you
              have real activity. You can restore sample data anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDismiss()
                setShowConfirmDialog(false)
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** Badge to indicate an item is demo data */
export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 ${className}`}
    >
      Demo
    </span>
  )
}
