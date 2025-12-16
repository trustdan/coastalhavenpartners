'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, ArrowUpDown } from 'lucide-react'
import {
  FIRM_REGIONS,
  FIRM_STATES,
  FIRM_SORT_OPTIONS,
} from '@/lib/constants/firms'
import { cn } from '@/lib/utils'

// DEBUG flag - controlled by environment
// Set NEXT_PUBLIC_DEBUG=true in .env.local to enable debug logging
const DEBUG_ENABLED = process.env.NODE_ENV === 'development'
  || process.env.NEXT_PUBLIC_DEBUG === 'true'

function debugLog(label: string, data?: unknown) {
  if (DEBUG_ENABLED) {
    console.log(`[FirmsFilters] ${label}`, data !== undefined ? data : '')
  }
}

// Quick filter tabs with abbreviations
const CATEGORY_TABS = [
  { value: '', label: 'All', full: 'All' },
  { value: 'Investment Banking', label: 'IB', full: 'Investment Banking' },
  { value: 'Private Equity', label: 'PE', full: 'Private Equity' },
  { value: 'Venture Capital', label: 'VC', full: 'Venture Capital' },
  { value: 'Hedge Fund', label: 'HF', full: 'Hedge Fund' },
  { value: 'Asset Management', label: 'AM', full: 'Asset Management' },
  { value: 'Family Office', label: 'FO', full: 'Family Office' },
] as const

export function FirmsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // DEBUG: Log component mount and searchParams changes
  useEffect(() => {
    debugLog('Component mounted/updated', {
      pathname,
      fullUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
      searchParamsString: searchParams.toString(),
      currentCategory: searchParams.get('category'),
    })
  }, [searchParams, pathname])

  const hasActiveFilters =
    searchParams.get('category') ||
    searchParams.get('region') ||
    searchParams.get('state') ||
    searchParams.get('priority') ||
    searchParams.get('search')

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== '__all__') {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset to page 1 when filters change
      if (name !== 'page') {
        params.delete('page')
      }
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (name: string, value: string) => {
    debugLog(`updateFilter called:`, { name, value })
    startTransition(() => {
      const newQueryString = createQueryString(name, value)
      debugLog(`updateFilter navigating to:`, `?${newQueryString}`)
      router.push('?' + newQueryString)
      router.refresh() // Force server component to re-render with new search params
    })
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    // Preserve sort options
    const sort = searchParams.get('sort')
    const order = searchParams.get('order')
    if (sort) params.set('sort', sort)
    if (order) params.set('order', order)
    startTransition(() => {
      router.push('?' + params.toString())
      router.refresh() // Force server component to re-render with new search params
    })
  }

  // Debounce search input
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleSearchChange = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    const timeout = setTimeout(() => {
      updateFilter('search', value)
    }, 500)
    setSearchTimeout(timeout)
  }

  const currentCategory = searchParams.get('category') || ''

  // Build href for category tabs - using Link for proper Next.js navigation
  const getCategoryHref = (categoryValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryValue === '') {
      params.delete('category')
    } else {
      params.set('category', categoryValue)
    }
    params.delete('page') // Reset pagination
    const queryString = params.toString()
    return `/firms-directory${queryString ? `?${queryString}` : ''}`
  }

  // Handle category tab click with refresh
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryValue: string) => {
    e.preventDefault()

    debugLog('=== CATEGORY TAB CLICKED ===', {
      clickedCategory: categoryValue || '(All)',
      previousCategory: searchParams.get('category') || '(All)',
      isPending,
    })

    const params = new URLSearchParams(searchParams.toString())
    if (categoryValue === '') {
      params.delete('category')
      debugLog('Deleting category param (setting to All)')
    } else {
      params.set('category', categoryValue)
      debugLog(`Setting category to: ${categoryValue}`)
    }
    params.delete('page') // Reset pagination
    const queryString = params.toString()
    const href = `/firms-directory${queryString ? `?${queryString}` : ''}`

    debugLog('Navigation target:', { href, queryString })

    startTransition(() => {
      debugLog('Starting transition...')
      router.push(href)
      debugLog('router.push() called')
      router.refresh() // Force server component to re-render with new search params
      debugLog('router.refresh() called')
    })

    debugLog('Transition initiated (callbacks scheduled)')
  }

  return (
    <div className="space-y-4">
      {/* Quick Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => {
          const isActive = tab.value === ''
            ? currentCategory === ''
            : currentCategory === tab.value

          return (
            <Link
              key={tab.value || 'all'}
              href={getCategoryHref(tab.value)}
              title={tab.full}
              onClick={(e) => handleCategoryClick(e, tab.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="search"
              placeholder="Search firms..."
              className="pl-9"
              defaultValue={searchParams.get('search') || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select
            value={searchParams.get('region') || '__all__'}
            onValueChange={(value) => updateFilter('region', value)}
          >
            <SelectTrigger id="region">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All regions</SelectItem>
              {FIRM_REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            value={searchParams.get('state') || '__all__'}
            onValueChange={(value) => updateFilter('state', value)}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All states</SelectItem>
              {FIRM_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={searchParams.get('priority') || '__all__'}
            onValueChange={(value) => updateFilter('priority', value)}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All priorities</SelectItem>
              <SelectItem value="1">High Priority</SelectItem>
              <SelectItem value="2">Medium Priority</SelectItem>
              <SelectItem value="3">Lower Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort and Clear Row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-neutral-400" />
            <Select
              value={searchParams.get('sort') || 'priority'}
              onValueChange={(value) => updateFilter('sort', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {FIRM_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select
            value={searchParams.get('order') || 'asc'}
            onValueChange={(value) => updateFilter('order', value)}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      </div>
    </div>
  )
}
