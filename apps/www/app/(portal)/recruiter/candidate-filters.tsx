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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UNDERGRAD_DEGREES, GRADUATE_DEGREES } from '@/components/ui/degree-type-select'
import { Bookmark, ChevronDown, Trash2, Loader2, Heart } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { saveSearch, deleteSearch, type SearchFilters, type SavedSearchResult } from './saved-search-actions'

interface CandidateFiltersProps {
  savedSearches?: SavedSearchResult[]
}

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

export function CandidateFilters({ savedSearches = [] }: CandidateFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState('')

  const hasActiveFilters = searchParams.get('gpa') || searchParams.get('major') ||
    searchParams.get('school') || searchParams.get('gradYear') ||
    searchParams.get('targetRole') || searchParams.get('undergradDegree') ||
    searchParams.get('gradDegree') || searchParams.get('interestedInFirm')

  const getCurrentFilters = (): SearchFilters => ({
    gpa: searchParams.get('gpa') || undefined,
    major: searchParams.get('major') || undefined,
    school: searchParams.get('school') || undefined,
    gradYear: searchParams.get('gradYear') || undefined,
    targetRole: searchParams.get('targetRole') || undefined,
    undergradDegree: searchParams.get('undergradDegree') || undefined,
    gradDegree: searchParams.get('gradDegree') || undefined,
  })

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (name: string, value: string) => {
    router.push('?' + createQueryString(name, value))
  }

  const updateFilter = (name: string, value: string) => {
     handleSearch(name, value)
  }

  const applyFilters = (filters: SearchFilters) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push('?' + params.toString())
  }

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return
    startTransition(async () => {
      await saveSearch(searchName, getCurrentFilters())
      setShowSaveDialog(false)
      setSearchName('')
    })
  }

  const handleDeleteSearch = async (id: string) => {
    startTransition(async () => {
      await deleteSearch(id)
    })
  }

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  const debouncedUpdate = useCallback(debounce((name: string, value: string) => updateFilter(name, value), 500), [searchParams])


  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <div className="space-y-2">
          <Label htmlFor="gpa">Min GPA</Label>
          <Input
            id="gpa"
            type="number"
            placeholder="3.5"
            step="0.1"
            min="0"
            max="4.0"
            defaultValue={searchParams.get('gpa') || ''}
            onChange={(e) => debouncedUpdate('gpa', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            placeholder="Finance, CS..."
            defaultValue={searchParams.get('major') || ''}
            onChange={(e) => debouncedUpdate('major', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school">School</Label>
          <Input
            id="school"
            placeholder="University..."
            defaultValue={searchParams.get('school') || ''}
            onChange={(e) => debouncedUpdate('school', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gradYear">Grad Year</Label>
          <Input
            id="gradYear"
            type="number"
            placeholder="2026"
            defaultValue={searchParams.get('gradYear') || ''}
            onChange={(e) => debouncedUpdate('gradYear', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role</Label>
          <Select
            value={searchParams.get('targetRole') || '__all__'}
            onValueChange={(value: string) => updateFilter('targetRole', value === '__all__' ? '' : value)}
          >
            <SelectTrigger id="targetRole">
              <SelectValue placeholder="Any role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Any role</SelectItem>
              {TARGET_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="undergradDegree">Undergrad Degree</Label>
          <Select
            value={searchParams.get('undergradDegree') || '__all__'}
            onValueChange={(value: string) => updateFilter('undergradDegree', value === '__all__' ? '' : value)}
          >
            <SelectTrigger id="undergradDegree">
              <SelectValue placeholder="Any degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Any degree</SelectItem>
              {UNDERGRAD_DEGREES.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gradDegree">Grad Degree</Label>
          <Select
            value={searchParams.get('gradDegree') || '__all__'}
            onValueChange={(value: string) => updateFilter('gradDegree', value === '__all__' ? '' : value)}
          >
            <SelectTrigger id="gradDegree">
              <SelectValue placeholder="Any degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Any degree</SelectItem>
              {GRADUATE_DEGREES.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interest Filter */}
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="interestedInFirm"
            checked={searchParams.get('interestedInFirm') === 'true'}
            onCheckedChange={(checked) => updateFilter('interestedInFirm', checked ? 'true' : '')}
          />
          <Label
            htmlFor="interestedInFirm"
            className="flex items-center gap-1.5 cursor-pointer text-sm font-medium"
          >
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
            Interested in my firm
          </Label>
        </div>
      </div>

      {/* Saved Searches & Actions Row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {savedSearches.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  Saved Searches
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {savedSearches.map((search) => (
                  <DropdownMenuItem
                    key={search.id}
                    className="flex items-center justify-between"
                  >
                    <button
                      onClick={() => applyFilters(search.filters)}
                      className="flex-1 text-left"
                    >
                      {search.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSearch(search.id)
                      }}
                      className="ml-2 text-neutral-400 hover:text-red-600"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowSaveDialog(true)}
            >
              <Bookmark className="h-4 w-4" />
              Save Search
            </Button>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/recruiter')}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Give your search a name to quickly apply these filters later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="searchName">Search Name</Label>
            <Input
              id="searchName"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., Top Finance Majors 2026"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSearch} disabled={isPending || !searchName.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
