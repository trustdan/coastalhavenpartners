'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSelectTags } from '@/components/ui/multi-select-tags'
import { Loader2, Save, Play } from 'lucide-react'
import { createJobListing, updateJobListing, publishJobListing, type JobFormData } from './actions'
import type { Database } from '@/lib/types/database.types'

type JobListing = Database['public']['Tables']['job_listings']['Row']
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

const GRAD_YEARS = [2024, 2025, 2026, 2027, 2028]

interface JobFormProps {
  job?: JobListing
  mode: 'create' | 'edit'
}

export function JobForm({ job, mode }: JobFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<JobFormData>({
    title: job?.title || '',
    job_type: job?.job_type || 'full_time',
    description: job?.description || '',
    requirements: job?.requirements || '',
    responsibilities: job?.responsibilities || '',
    target_roles: job?.target_roles || [],
    locations: job?.locations || [],
    target_grad_years: job?.target_grad_years || [],
    min_gpa: job?.min_gpa ? Number(job.min_gpa) : undefined,
    compensation_range: job?.compensation_range || '',
    application_deadline: job?.application_deadline
      ? new Date(job.application_deadline).toISOString().split('T')[0]
      : '',
    start_date: job?.start_date
      ? new Date(job.start_date).toISOString().split('T')[0]
      : '',
    external_url: job?.external_url || '',
    application_instructions: job?.application_instructions || '',
  })

  const handleSubmit = (publish: boolean = false) => {
    setError(null)

    if (!formData.title.trim()) {
      setError('Job title is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Job description is required')
      return
    }

    startTransition(async () => {
      let result: { success: boolean; id?: string; error?: string }

      if (mode === 'create') {
        result = await createJobListing(formData)
        if (result.success && result.id) {
          if (publish) {
            const publishResult = await publishJobListing(result.id)
            if (!publishResult.success) {
              setError(publishResult.error || 'Failed to publish job')
              return
            }
          }
          router.push('/recruiter/jobs')
        }
      } else if (job) {
        result = await updateJobListing(job.id, formData)
        if (result.success) {
          if (publish && job.status === 'draft') {
            const publishResult = await publishJobListing(job.id)
            if (!publishResult.success) {
              setError(publishResult.error || 'Failed to publish job')
              return
            }
          }
          router.push('/recruiter/jobs')
        }
      } else {
        result = { success: false, error: 'Invalid state' }
      }

      if (!result.success) {
        setError(result.error || 'Something went wrong')
      }
    })
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold mb-6">Basic Information</h2>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Analyst 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type *</Label>
              <Select
                value={formData.job_type}
                onValueChange={(value: JobType) => setFormData({ ...formData, job_type: value })}
              >
                <SelectTrigger id="job_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role, team, and opportunity..."
              rows={6}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements || ''}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List qualifications and requirements..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea
                id="responsibilities"
                value={formData.responsibilities || ''}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                placeholder="List key responsibilities..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Targeting */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold mb-6">Candidate Targeting</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="target_roles">Target Roles</Label>
            <MultiSelectTags
              id="target_roles"
              options={TARGET_ROLES}
              selected={formData.target_roles || []}
              onChange={(roles) => setFormData({ ...formData, target_roles: roles })}
              placeholder="Select target roles..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locations">Locations</Label>
            <MultiSelectTags
              id="locations"
              options={LOCATIONS}
              selected={formData.locations || []}
              onChange={(locs) => setFormData({ ...formData, locations: locs })}
              placeholder="Select locations..."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target_grad_years">Target Graduation Years</Label>
              <MultiSelectTags
                id="target_grad_years"
                options={GRAD_YEARS.map(String)}
                selected={(formData.target_grad_years || []).map(String)}
                onChange={(years) =>
                  setFormData({ ...formData, target_grad_years: years.map(Number) })
                }
                placeholder="Select graduation years..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_gpa">Minimum GPA (optional)</Label>
              <Input
                id="min_gpa"
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                value={formData.min_gpa || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_gpa: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="e.g., 3.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold mb-6">Additional Details</h2>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="compensation_range">Compensation Range</Label>
              <Input
                id="compensation_range"
                value={formData.compensation_range || ''}
                onChange={(e) =>
                  setFormData({ ...formData, compensation_range: e.target.value })
                }
                placeholder="e.g., $100k-$120k or Competitive"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="application_deadline">Application Deadline</Label>
              <Input
                id="application_deadline"
                type="date"
                value={formData.application_deadline || ''}
                onChange={(e) =>
                  setFormData({ ...formData, application_deadline: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_url">External Application URL (optional)</Label>
              <Input
                id="external_url"
                type="url"
                value={formData.external_url || ''}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="application_instructions">Application Instructions</Label>
            <Textarea
              id="application_instructions"
              value={formData.application_instructions || ''}
              onChange={(e) =>
                setFormData({ ...formData, application_instructions: e.target.value })
              }
              placeholder="Any specific instructions for applicants..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/recruiter/jobs')}
          disabled={isPending}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save as Draft
        </Button>

        <Button type="button" onClick={() => handleSubmit(true)} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {mode === 'create' ? 'Publish Job' : job?.status === 'draft' ? 'Save & Publish' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
