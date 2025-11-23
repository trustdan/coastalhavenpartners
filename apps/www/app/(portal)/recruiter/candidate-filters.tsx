'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useDebouncedCallback } from 'use-debounce'

// Note: You might need to install use-debounce: pnpm add use-debounce
// If not available, we can implement a simple debounce or just use onBlur/Enter

export function CandidateFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  // Debounce the search to avoid too many URL updates
  // If use-debounce is not installed, we'll fallback to onBlur/Enter behavior in the input
  // For now, assuming we might not have it, let's use a simple approach without external deps if possible
  // But to be "robust", let's implement a simple debounce wrapper or just use onChange for now if traffic is low.
  // Actually, let's just use standard inputs with onChange and a small delay if possible, 
  // or simpler: "Apply" button? No, instant is better.
  // I'll use a local state and timeout for debounce.

  const updateFilter = (name: string, value: string) => {
     handleSearch(name, value)
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
      <div className="grid gap-4 md:grid-cols-4">
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
      </div>
      {(searchParams.get('gpa') || searchParams.get('major') || searchParams.get('school') || searchParams.get('gradYear')) && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/recruiter')}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

