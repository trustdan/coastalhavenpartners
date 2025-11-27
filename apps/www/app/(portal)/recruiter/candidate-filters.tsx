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
import { UNDERGRAD_DEGREES, GRADUATE_DEGREES } from '@/components/ui/degree-type-select'

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
      {(searchParams.get('gpa') || searchParams.get('major') || searchParams.get('school') || searchParams.get('gradYear') || searchParams.get('targetRole') || searchParams.get('undergradDegree') || searchParams.get('gradDegree')) && (
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
