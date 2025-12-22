'use client'

import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DemoEmptyStateProps {
  /** Icon to display (defaults to Eye) */
  icon?: React.ReactNode
  /** Main title for the empty state */
  title?: string
  /** Description text */
  description?: string
  /** Called when user clicks "Show Sample Data" */
  onRestore: () => void
  /** Custom class name */
  className?: string
}

export function DemoEmptyState({
  icon,
  title = 'No Activity Yet',
  description = 'Data will appear here once you have activity.',
  onRestore,
  className = '',
}: DemoEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        {icon || <Eye className="h-8 w-8 text-neutral-400" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <Button variant="outline" onClick={onRestore} className="mt-6">
        Show Sample Data
      </Button>
    </div>
  )
}
