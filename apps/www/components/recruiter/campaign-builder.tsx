'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Users, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TemplateEditor } from './template-editor'
import {
  createCampaign,
  addCampaignRecipients,
  previewRecipients,
  type CampaignFilters,
} from '@/app/(portal)/recruiter/campaigns/actions'

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

const CURRENT_YEAR = new Date().getFullYear()
const GRADUATION_YEARS = [
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
  CURRENT_YEAR + 2,
  CURRENT_YEAR + 3,
]

interface SavedSearch {
  id: string
  name: string
  filters: CampaignFilters
}

interface CampaignBuilderProps {
  savedSearches: SavedSearch[]
  recruiterName: string
  firmName: string
}

export function CampaignBuilder({
  savedSearches,
  recruiterName,
  firmName,
}: CampaignBuilderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'details' | 'filters' | 'message' | 'preview'>('details')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<string>('')
  const [filters, setFilters] = useState<CampaignFilters>({})
  const [messageTemplate, setMessageTemplate] = useState(
    `Hi {{first_name}},

I came across your profile and was impressed by your background at {{school}}. I'm reaching out on behalf of {{firm_name}} about potential opportunities that might align with your career goals.

Would you be open to a brief conversation to learn more?

Best,
{{recruiter_name}}`
  )

  // Preview state
  const [previewData, setPreviewData] = useState<{
    count: number
    sample: { id: string; full_name: string; school_name: string; graduation_year: number | null; major: string | null }[]
  } | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const updateFilter = (key: keyof CampaignFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  const handleSavedSearchSelect = (searchId: string) => {
    setSelectedSavedSearch(searchId)
    if (searchId === '__none__') {
      setFilters({})
    } else {
      const search = savedSearches.find(s => s.id === searchId)
      if (search) {
        setFilters(search.filters)
      }
    }
  }

  const loadPreview = async () => {
    setIsLoadingPreview(true)
    try {
      const result = await previewRecipients(filters)
      setPreviewData(result)
    } catch {
      setError('Failed to load preview')
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleNext = () => {
    setError(null)

    if (step === 'details') {
      if (!name.trim()) {
        setError('Please enter a campaign name')
        return
      }
      if (!subject.trim()) {
        setError('Please enter a subject line')
        return
      }
      setStep('filters')
    } else if (step === 'filters') {
      loadPreview()
      setStep('message')
    } else if (step === 'message') {
      if (!messageTemplate.trim()) {
        setError('Please enter a message template')
        return
      }
      loadPreview()
      setStep('preview')
    }
  }

  const handleBack = () => {
    setError(null)
    if (step === 'filters') setStep('details')
    else if (step === 'message') setStep('filters')
    else if (step === 'preview') setStep('message')
  }

  const handleCreate = () => {
    startTransition(async () => {
      try {
        // Create the campaign
        const result = await createCampaign({
          name,
          subject,
          message_template: messageTemplate,
          filters,
          saved_search_id: selectedSavedSearch && selectedSavedSearch !== '__none__' ? selectedSavedSearch : undefined,
        })

        if (!result.success || !result.campaignId) {
          setError(result.error || 'Failed to create campaign')
          return
        }

        // Add recipients based on filters
        const recipientResult = await addCampaignRecipients(result.campaignId, {
          useFilters: true,
        })

        if (!recipientResult.success) {
          // Campaign created but no recipients - still navigate but show in the UI
          console.warn('Campaign created but failed to add recipients:', recipientResult.error)
        }

        // Navigate to the campaign detail page
        router.push(`/recruiter/campaigns/${result.campaignId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    })
  }

  const hasFilters = Object.values(filters).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
  )

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className={step === 'details' ? 'font-medium' : 'text-muted-foreground'}>
          1. Details
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={step === 'filters' ? 'font-medium' : 'text-muted-foreground'}>
          2. Recipients
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={step === 'message' ? 'font-medium' : 'text-muted-foreground'}>
          3. Message
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={step === 'preview' ? 'font-medium' : 'text-muted-foreground'}>
          4. Review
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Campaign Details */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Give your campaign a name and subject line
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fall 2025 IB Outreach"
              />
              <p className="text-xs text-muted-foreground">
                This is for your reference only and won&apos;t be shown to candidates
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Opportunity at {{firm_name}}"
              />
              <p className="text-xs text-muted-foreground">
                This will appear as the subject in the message notification
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Recipient Filters */}
      {step === 'filters' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Recipients</CardTitle>
            <CardDescription>
              Define which candidates should receive this campaign (max 50 recipients)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {savedSearches.length > 0 && (
              <div className="space-y-2">
                <Label>Start from Saved Search</Label>
                <Select value={selectedSavedSearch} onValueChange={handleSavedSearchSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved search..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Start fresh</SelectItem>
                    {savedSearches.map((search) => (
                      <SelectItem key={search.id} value={search.id}>
                        {search.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={filters.schools?.[0] || ''}
                  onChange={(e) => updateFilter('schools', e.target.value ? [e.target.value] : undefined)}
                  placeholder="e.g., Harvard, Wharton"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradYear">Graduation Year</Label>
                <Select
                  value={filters.graduationYears?.[0]?.toString() || '__any__'}
                  onValueChange={(v) => updateFilter('graduationYears', v !== '__any__' ? [parseInt(v)] : undefined)}
                >
                  <SelectTrigger id="gradYear">
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any year</SelectItem>
                    {GRADUATION_YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minGpa">Minimum GPA</Label>
                <Input
                  id="minGpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="4.0"
                  value={filters.minGpa || ''}
                  onChange={(e) => updateFilter('minGpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 3.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  value={filters.majors?.[0] || ''}
                  onChange={(e) => updateFilter('majors', e.target.value ? [e.target.value] : undefined)}
                  placeholder="e.g., Finance, Economics"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Select
                  value={filters.targetRoles?.[0] || '__any__'}
                  onValueChange={(v) => updateFilter('targetRoles', v !== '__any__' ? [v] : undefined)}
                >
                  <SelectTrigger id="targetRole">
                    <SelectValue placeholder="Any role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any role</SelectItem>
                    {TARGET_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!hasFilters && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No filters selected. This will target all verified candidates (up to 50).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Message Template */}
      {step === 'message' && (
        <Card>
          <CardHeader>
            <CardTitle>Message Template</CardTitle>
            <CardDescription>
              Write your message using template variables for personalization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateEditor
              value={messageTemplate}
              onChange={setMessageTemplate}
              recruiterName={recruiterName}
              firmName={firmName}
              rows={10}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview & Confirm */}
      {step === 'preview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
              <CardDescription>Review your campaign before creating it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Campaign Name</p>
                  <p className="text-sm text-muted-foreground">{name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Subject</p>
                  <p className="text-sm text-muted-foreground">{subject}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Filters Applied</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {filters.schools?.map(s => (
                    <span key={s} className="text-xs bg-muted px-2 py-1 rounded">School: {s}</span>
                  ))}
                  {filters.graduationYears?.map(y => (
                    <span key={y} className="text-xs bg-muted px-2 py-1 rounded">Class of {y}</span>
                  ))}
                  {filters.minGpa && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">GPA &ge; {filters.minGpa}</span>
                  )}
                  {filters.majors?.map(m => (
                    <span key={m} className="text-xs bg-muted px-2 py-1 rounded">Major: {m}</span>
                  ))}
                  {filters.targetRoles?.map(r => (
                    <span key={r} className="text-xs bg-muted px-2 py-1 rounded">Role: {r}</span>
                  ))}
                  {!hasFilters && (
                    <span className="text-xs text-muted-foreground">No filters (all candidates)</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recipient Preview
              </CardTitle>
              <CardDescription>
                {isLoadingPreview
                  ? 'Loading...'
                  : previewData
                    ? `${Math.min(previewData.count, 50)} candidate${previewData.count !== 1 ? 's' : ''} will receive this campaign`
                    : 'No matching candidates found'
                }
              </CardDescription>
            </CardHeader>
            {previewData && previewData.sample.length > 0 && (
              <CardContent>
                <div className="space-y-2">
                  {previewData.sample.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{candidate.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {candidate.school_name}
                          {candidate.graduation_year && ` · ${candidate.graduation_year}`}
                          {candidate.major && ` · ${candidate.major}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {previewData.count > 10 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      ... and {Math.min(previewData.count, 50) - 10} more
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">
                {messageTemplate}
              </div>
            </CardContent>
          </Card>

          {previewData && previewData.count === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No candidates match your filters. Try adjusting your criteria.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 'details'}
        >
          Back
        </Button>

        {step !== 'preview' ? (
          <Button onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={isPending || !previewData || previewData.count === 0}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Campaign
          </Button>
        )}
      </div>
    </div>
  )
}
