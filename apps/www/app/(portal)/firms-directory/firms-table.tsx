'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Building2,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PRIORITY_LABELS, OPTIONAL_COLUMNS, type OptionalColumnKey } from '@/lib/constants/firms'
import { saveFirm, unsaveFirm, loadMoreFirms } from './firm-actions'
import type { Database } from '@/lib/types/database.types'

type Firm = Database['public']['Tables']['firms']['Row']

// DEBUG flag - set to false to disable console logging
const DEBUG_ENABLED = true

function debugLog(label: string, data?: unknown) {
  if (DEBUG_ENABLED) {
    console.log(`[FirmsTable] ${label}`, data !== undefined ? data : '')
  }
}

interface FirmsTableProps {
  firms: Firm[]
  savedFirmIds: Set<string>
  currentPage: number
  totalPages: number
  totalCount: number
  selectedColumns: OptionalColumnKey[]
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
    'Restructuring': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
    'Sovereign Wealth Fund': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200',
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
      className="flex items-center gap-1.5 text-left text-sm font-medium hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
    >
      {label}
      <span className={isActive ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}>
        {isActive ? (
          isAsc ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />
        )}
      </span>
    </button>
  )
}

function OptionalCell({ firm, columnKey }: { firm: Firm; columnKey: OptionalColumnKey }) {
  const value = firm[columnKey as keyof Firm]
  if (!value) return null

  // Special rendering for certain columns
  if (columnKey === 'description' || columnKey === 'notes') {
    return <span className="line-clamp-2">{String(value)}</span>
  }

  if (columnKey === 'founded_year') {
    return <span>Est. {value}</span>
  }

  return <span>{String(value)}</span>
}

function FirmRow({
  firm,
  isSaved,
  onToggleSave,
  selectedColumns,
}: {
  firm: Firm
  isSaved: boolean
  onToggleSave: (firmId: string, currentlySaved: boolean) => void
  selectedColumns: OptionalColumnKey[]
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
      {/* Optional columns */}
      {selectedColumns.map((columnKey) => (
        <td key={columnKey} className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
          <OptionalCell firm={firm} columnKey={columnKey} />
        </td>
      ))}
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
  firms: initialFirms,
  savedFirmIds,
  currentPage,
  totalPages,
  totalCount,
  selectedColumns,
}: FirmsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localSavedIds, setLocalSavedIds] = useState(savedFirmIds)
  const [displayedFirms, setDisplayedFirms] = useState<Firm[]>(initialFirms)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(totalCount > initialFirms.length)
  const mountCountRef = useRef(0)

  const currentSort = searchParams.get('sort') || 'priority'
  const currentOrder = searchParams.get('order') || 'asc'
  const currentCategory = searchParams.get('category') || undefined
  const currentRegion = searchParams.get('region') || undefined
  const currentState = searchParams.get('state') || undefined
  const currentPriority = searchParams.get('priority') || undefined
  const currentSearch = searchParams.get('search') || undefined

  // DEBUG: Log component mount
  useEffect(() => {
    mountCountRef.current += 1
    debugLog(`=== COMPONENT MOUNTED (mount #${mountCountRef.current}) ===`)
    debugLog('Initial props received:', {
      initialFirmsCount: initialFirms.length,
      totalCount,
      currentPage,
      totalPages,
      hasMoreOnMount: totalCount > initialFirms.length,
      firstFirmName: initialFirms[0]?.name,
      lastFirmName: initialFirms[initialFirms.length - 1]?.name,
    })
    return () => {
      debugLog(`=== COMPONENT UNMOUNTING (was mount #${mountCountRef.current}) ===`)
    }
  }, []) // Empty deps = only on mount/unmount

  // DEBUG: Track props changes
  useEffect(() => {
    debugLog('Props changed - initialFirms/totalCount update:', {
      newInitialFirmsCount: initialFirms.length,
      newTotalCount: totalCount,
      newHasMore: totalCount > initialFirms.length,
    })
  }, [initialFirms, totalCount])

  // Reset displayed firms when filters/sort change (initial firms from server)
  useEffect(() => {
    debugLog('=== RESETTING DISPLAYED FIRMS ===', {
      previousDisplayedCount: displayedFirms.length,
      newInitialFirmsCount: initialFirms.length,
      totalCount,
      filters: {
        category: currentCategory || '(All)',
        region: currentRegion || '(All)',
        state: currentState || '(All)',
        priority: currentPriority || '(All)',
        search: currentSearch || '(none)',
        sort: currentSort,
        order: currentOrder,
      },
    })

    setDisplayedFirms(initialFirms)
    // Calculate hasMore: true if totalCount is greater than currently displayed firms
    // This ensures Load More button appears when there are more results
    const shouldHaveMore = totalCount > initialFirms.length

    debugLog('hasMore calculation:', {
      totalCount,
      initialFirmsLength: initialFirms.length,
      shouldHaveMore,
      willShowLoadMoreButton: shouldHaveMore,
    })

    setHasMore(shouldHaveMore)
  }, [initialFirms, totalCount, currentCategory, currentRegion, currentState, currentPriority, currentSearch, currentSort, currentOrder])

  // Calculate total columns for empty state colspan
  const baseColumnCount = 7 // Firm, Category, Location, Region, Focus, Contact, Actions
  const totalColumnCount = baseColumnCount + selectedColumns.length

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

  const handleLoadMore = async () => {
    debugLog('=== LOAD MORE CLICKED ===', {
      isLoadingMore,
      hasMore,
      currentDisplayedCount: displayedFirms.length,
    })

    if (isLoadingMore || !hasMore) {
      debugLog('Load more BLOCKED:', { isLoadingMore, hasMore })
      return
    }

    setIsLoadingMore(true)
    const loadParams = {
      offset: displayedFirms.length,
      limit: 25,
      category: currentCategory,
      region: currentRegion,
      state: currentState,
      priority: currentPriority ? parseInt(currentPriority) : undefined,
      search: currentSearch,
      sortBy: currentSort,
      sortOrder: currentOrder,
    }
    debugLog('Calling loadMoreFirms with:', loadParams)

    try {
      const result = await loadMoreFirms(loadParams)

      debugLog('loadMoreFirms result:', {
        firmsReturned: result.firms.length,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        newTotalDisplayed: displayedFirms.length + result.firms.length,
      })

      setDisplayedFirms((prev) => [...prev, ...result.firms])
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error loading more firms:', error)
      debugLog('loadMoreFirms ERROR:', error)
    } finally {
      setIsLoadingMore(false)
      debugLog('Load more completed')
    }
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
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Contact"
                    sortKey="contact_email"
                    currentSort={currentSort}
                    currentOrder={currentOrder}
                    onSort={handleSort}
                  />
                </th>
                {/* Optional columns */}
                {selectedColumns.map((columnKey) => {
                  const column = OPTIONAL_COLUMNS.find(c => c.key === columnKey)
                  if (!column) return null
                  return (
                    <th key={columnKey} className="px-4 py-3 text-left">
                      {column.sortable ? (
                        <SortableHeader
                          label={column.label}
                          sortKey={columnKey}
                          currentSort={currentSort}
                          currentOrder={currentOrder}
                          onSort={handleSort}
                        />
                      ) : (
                        <span className="text-sm font-medium">{column.label}</span>
                      )}
                    </th>
                  )
                })}
                <th className="px-4 py-3 text-left text-sm font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayedFirms.length > 0 ? (
                displayedFirms.map((firm) => (
                  <FirmRow
                    key={firm.id}
                    firm={firm}
                    isSaved={localSavedIds.has(firm.id)}
                    onToggleSave={handleToggleSave}
                    selectedColumns={selectedColumns}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={totalColumnCount} className="px-6 py-12 text-center">
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

      {/* Results count and Load More */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing {displayedFirms.length} of {totalCount} firms
        </p>

        {hasMore && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Load More Firms</>
            )}
          </Button>
        )}

        {!hasMore && displayedFirms.length > 0 && (
          <p className="text-sm text-neutral-500">
            You&apos;ve reached the end of the list
          </p>
        )}
      </div>

      {/* DEBUG PANEL - Visible when DEBUG_ENABLED is true */}
      {DEBUG_ENABLED && (
        <div className="mt-6 p-4 border-2 border-dashed border-yellow-500 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">🐛 DEBUG INFO</h3>
          <div className="text-xs font-mono space-y-1 text-yellow-700 dark:text-yellow-300">
            <p><strong>displayedFirms.length:</strong> {displayedFirms.length}</p>
            <p><strong>totalCount (from server):</strong> {totalCount}</p>
            <p><strong>hasMore:</strong> {hasMore ? 'true' : 'false'}</p>
            <p><strong>isLoadingMore:</strong> {isLoadingMore ? 'true' : 'false'}</p>
            <p><strong>currentCategory:</strong> {currentCategory || '(All/undefined)'}</p>
            <p><strong>currentRegion:</strong> {currentRegion || '(All/undefined)'}</p>
            <p><strong>currentState:</strong> {currentState || '(All/undefined)'}</p>
            <p><strong>currentPriority:</strong> {currentPriority || '(All/undefined)'}</p>
            <p><strong>currentSearch:</strong> {currentSearch || '(none)'}</p>
            <p><strong>currentSort:</strong> {currentSort} {currentOrder}</p>
            <p><strong>searchParams.toString():</strong> {searchParams.toString() || '(empty)'}</p>
            <p><strong>Should show Load More:</strong> {hasMore && displayedFirms.length > 0 ? 'YES' : 'NO'}</p>
            <p className="mt-2 pt-2 border-t border-yellow-400">
              <strong>First firm:</strong> {displayedFirms[0]?.name || 'N/A'} |
              <strong> Last firm:</strong> {displayedFirms[displayedFirms.length - 1]?.name || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
