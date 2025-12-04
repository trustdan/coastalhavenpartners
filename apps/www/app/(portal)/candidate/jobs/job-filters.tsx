'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
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
import { Search, X } from 'lucide-react'
import type { JobFilters } from './actions'
import type { Database } from '@/lib/types/database.types'

type JobType = Database['public']['Enums']['job_type']

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'summer_analyst', label: 'Summer Analyst' },
  { value: 'off_cycle', label: 'Off-Cycle' },
]

const TARGET_ROLES = [
  'Investment Banking',
  'Private Equity',
  'Venture Capital',
  'Hedge Fund',
  'Asset Management',
  'Consulting',
  'Corporate Finance',
  'Equity Research',
  'Sales & Trading',
  'Wealth Management',
  'Real Estate',
  'Fintech',
]

const LOCATIONS = [
  'New York',
  'San Francisco',
  'Chicago',
  'Boston',
  'Los Angeles',
  'Miami',
  'Dallas',
  'Houston',
  'Seattle',
  'Austin',
  'Denver',
  'Atlanta',
  'Remote',
]

interface JobFiltersComponentProps {
  filters: JobFilters
}

export function JobFiltersComponent({ filters }: JobFiltersComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const hasActiveFilters =
    filters.job_type || filters.location || filters.target_role || filters.search

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== '__all__') {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (name: string, value: string) => {
    router.push('?' + createQueryString(name, value))
  }

  const clearFilters = () => {
    router.push('/candidate/jobs')
  }

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      const timeoutId = setTimeout(() => {
        updateFilter('search', value)
      }, 500)
      return () => clearTimeout(timeoutId)
    },
    [searchParams]
  )

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div className="grid gap-4 md:grid-cols-5">
        {/* Search */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="search"
              placeholder="Search jobs..."
              defaultValue={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Job Type */}
        <div className="space-y-2">
          <Label htmlFor="job_type">Job Type</Label>
          <Select
            value={filters.job_type || '__all__'}
            onValueChange={(value) => updateFilter('job_type', value)}
          >
            <SelectTrigger id="job_type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All types</SelectItem>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select
            value={filters.location || '__all__'}
            onValueChange={(value) => updateFilter('location', value)}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All locations</SelectItem>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Role */}
        <div className="space-y-2">
          <Label htmlFor="target_role">Role</Label>
          <Select
            value={filters.target_role || '__all__'}
            onValueChange={(value) => updateFilter('target_role', value)}
          >
            <SelectTrigger id="target_role">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All roles</SelectItem>
              {TARGET_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-neutral-500 hover:text-neutral-900"
          >
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
