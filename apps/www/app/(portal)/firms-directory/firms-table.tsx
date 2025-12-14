'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Users,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PRIORITY_LABELS } from '@/lib/constants/firms'
import { saveFirm, unsaveFirm } from './firm-actions'
import type { Database } from '@/lib/types/database.types'

type Firm = Database['public']['Tables']['firms']['Row']

interface FirmsTableProps {
  firms: Firm[]
  savedFirmIds: Set<string>
  currentPage: number
  totalPages: number
  totalCount: number
}

function PriorityBadge({ priority }: { priority: number | null }) {
  if (!priority) return null
  const config = PRIORITY_LABELS[priority]
  if (!config) return null

  return (
    <span className={`text-sm font-medium ${config.color}`} title={config.label}>
      {config.stars}
    </span>
  )
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null

  const colorMap: Record<string, string> = {
    'Investment Banking': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
    'Private Equity': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
    'Venture Capital': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    'Hedge Fund': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    'Asset Management': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
    'Family Office': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200',
    'Trust Company': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200',
    'Corporate Venture': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
  }

  const colorClass = colorMap[category] || 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-200'

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {category}
    </span>
  )
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
}: {
  label: string
  sortKey: string
  currentSort: string
  currentOrder: string
  onSort: (sortKey: string) => void
}) {
  const isActive = currentSort === sortKey
  const isAsc = currentOrder === 'asc'

  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-left text-sm font-medium hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
    >
      {label}
      <span className="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
        {isActive ? (
          isAsc ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
        )}
      </span>
    </button>
  )
}

function FirmRow({
  firm,
  isSaved,
  onToggleSave,
}: {
  firm: Firm
  isSaved: boolean
  onToggleSave: (firmId: string, currentlySaved: boolean) => void
}) {
  const [isPending, startTransition] = useTransition()

  const handleToggleSave = () => {
    startTransition(() => {
      onToggleSave(firm.id, isSaved)
    })
  }

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors select-none">
      <td className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            {firm.logo_url ? (
              <img
                src={firm.logo_url}
                alt={`${firm.name} logo`}
                className="h-8 w-8 rounded object-contain"
              />
            ) : (
              <Building2 className="h-5 w-5 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{firm.name}</span>
              <PriorityBadge priority={firm.priority} />
            </div>
            {firm.description && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {firm.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <CategoryBadge category={firm.firm_type} />
      </td>
      <td className="px-4 py-4">
        {(firm.city || firm.state) && (
          <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
            <MapPin className="h-3.5 w-3.5" />
            {[firm.city, firm.state].filter(Boolean).join(', ')}
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        {firm.region && (
          <span className="inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">
            {firm.region}
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
        {firm.focus_sector && (
          <span className="line-clamp-2">{firm.focus_sector}</span>
        )}
      </td>
      <td className="px-4 py-4 select-text">
        {firm.contact_email && (
          <a
            href={`mailto:${firm.contact_email}`}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">{firm.contact_email}</span>
          </a>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleToggleSave}
                  disabled={isPending}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSaved ? 'Remove from saved' : 'Save firm'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {firm.website && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={firm.website.startsWith('http') ? firm.website : `https://${firm.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Visit website</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>
    </tr>
  )
}

export function FirmsTable({
  firms,
  savedFirmIds,
  currentPage,
  totalPages,
  totalCount,
}: FirmsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localSavedIds, setLocalSavedIds] = useState(savedFirmIds)

  const currentSort = searchParams.get('sort') || 'priority'
  const currentOrder = searchParams.get('order') || 'asc'

  const handleSort = (sortKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentSort === sortKey) {
      // Toggle order if same column
      params.set('order', currentOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to ascending
      params.set('sort', sortKey)
      params.set('order', 'asc')
    }
    // Reset to page 1 when sorting changes
    params.delete('page')
    router.push('?' + params.toString())
  }

  const handleToggleSave = async (firmId: string, currentlySaved: boolean) => {
    // Optimistic update
    const newSavedIds = new Set(localSavedIds)
    if (currentlySaved) {
      newSavedIds.delete(firmId)
    } else {
      newSavedIds.add(firmId)
    }
    setLocalSavedIds(newSavedIds)

    // Server action
    try {
      if (currentlySaved) {
        await unsaveFirm(firmId)
      } else {
        await saveFirm(firmId)
      }
    } catch (error) {
      // Revert on error
      setLocalSavedIds(savedFirmIds)
      console.error('Error toggling save:', error)
    }
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push('?' + params.toString())
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-800 select-none">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Firm"
                    sortKey="name"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Category"
                    sortKey="firm_type"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Location"
                    sortKey="city"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Region"
                    sortKey="region"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Focus"
                    sortKey="focus_sector"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {firms.length > 0 ? (
                firms.map((firm) => (
                  <FirmRow
                    key={firm.id}
                    firm={firm}
                    isSaved={localSavedIds.has(firm.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                    <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                      No firms found matching your criteria
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Try adjusting your filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {(currentPage - 1) * 25 + 1} - {Math.min(currentPage * 25, totalCount)} of {totalCount} firms
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="px-2 text-sm text-neutral-600 dark:text-neutral-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
