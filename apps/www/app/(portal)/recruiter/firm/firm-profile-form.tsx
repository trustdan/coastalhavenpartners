'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, ExternalLink, Building2 } from 'lucide-react'
import { updateFirmProfile } from './actions'

interface Firm {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  culture: string | null
  website: string | null
  locations: string[] | null
  firm_type: string | null
  hiring_roles: string[] | null
  employee_count: string | null
  founded_year: number | null
  is_visible: boolean | null
}

interface FirmProfileFormProps {
  firm: Firm
}

const firmTypes = [
  'Private Equity',
  'Venture Capital',
  'Investment Banking',
  'Hedge Fund',
  'Asset Management',
  'Consulting',
  'Corporate Finance',
  'Other',
]

const employeeCounts = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
]

export function FirmProfileForm({ firm }: FirmProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isVisible, setIsVisible] = useState(firm.is_visible ?? true)
  const [firmType, setFirmType] = useState(firm.firm_type || '')
  const [employeeCount, setEmployeeCount] = useState(firm.employee_count || '')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('isVisible', String(isVisible))
    formData.set('firmType', firmType)
    formData.set('employeeCount', employeeCount)

    startTransition(async () => {
      try {
        await updateFirmProfile(formData)
        toast.success('Firm profile updated successfully')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Failed to update firm profile')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Preview Link */}
      <div className="flex items-center justify-between rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {firm.name}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your firm's public profile page
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/firms/${firm.slug}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Public Profile
          </Link>
        </Button>
      </div>

      {/* Visibility Toggle */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Profile Visibility</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              When enabled, candidates can find and view your firm profile
            </p>
          </div>
          <Switch
            checked={isVisible}
            onCheckedChange={setIsVisible}
          />
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h3 className="font-semibold mb-6">Basic Information</h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firmType">Firm Type</Label>
            <Select value={firmType} onValueChange={setFirmType}>
              <SelectTrigger>
                <SelectValue placeholder="Select firm type" />
              </SelectTrigger>
              <SelectContent>
                {firmTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={firm.website || ''}
              placeholder="https://www.yourfirm.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeCount">Company Size</Label>
            <Select value={employeeCount} onValueChange={setEmployeeCount}>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {employeeCounts.map((count) => (
                  <SelectItem key={count} value={count}>
                    {count} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input
              id="foundedYear"
              name="foundedYear"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              defaultValue={firm.founded_year || ''}
              placeholder="e.g., 2010"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="locations">Locations (comma separated)</Label>
            <Input
              id="locations"
              name="locations"
              defaultValue={firm.locations?.join(', ') || ''}
              placeholder="New York, San Francisco, London"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              defaultValue={firm.logo_url || ''}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-neutral-500">
              Direct link to your firm's logo image
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h3 className="font-semibold mb-6">About Your Firm</h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={firm.description || ''}
              placeholder="Tell candidates about your firm, what you do, and what makes you unique..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="culture">Culture & Values</Label>
            <Textarea
              id="culture"
              name="culture"
              defaultValue={firm.culture || ''}
              placeholder="Describe your firm's culture, values, and what it's like to work there..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Hiring */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h3 className="font-semibold mb-6">Hiring Information</h3>

        <div className="space-y-2">
          <Label htmlFor="hiringRoles">Currently Hiring For (comma separated)</Label>
          <Input
            id="hiringRoles"
            name="hiringRoles"
            defaultValue={firm.hiring_roles?.join(', ') || ''}
            placeholder="Analyst, Associate, VP"
          />
          <p className="text-xs text-neutral-500">
            Leave blank if not currently hiring. These roles will be shown to candidates.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/recruiter">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
