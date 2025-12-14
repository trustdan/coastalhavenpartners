'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
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
  FIRM_CATEGORIES,
  FIRM_REGIONS,
  FIRM_STATES,
  FIRM_SORT_OPTIONS,
} from '@/lib/constants/firms'
import { cn } from '@/lib/utils'

// Quick filter tabs with abbreviations
const CATEGORY_TABS = [
  { value: '__all__', label: 'All', full: 'All' },
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
  const [isPending, startTransition] = useTransition()

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
    startTransition(() => {
      router.push('?' + createQueryString(name, value))
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

  const currentCategory = searchParams.get('category') || '__all__'

  return (
    <div className="space-y-4">
      {/* Quick Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateFilter('category', tab.value)}
            disabled={isPending}
            title={tab.full}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              currentCategory === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border'
            )}
          >
            {tab.label}
          </button>
        ))}
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
