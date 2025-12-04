'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Briefcase, GraduationCap, Building2, Loader2 } from 'lucide-react'
import { updateMessagingPreferences, type MessagingPreferences } from '@/app/(portal)/messages/actions'

interface MessagingPreferencesFormProps {
  userRole: 'candidate' | 'recruiter' | 'school_admin'
  initialPreferences: MessagingPreferences
}

export function MessagingPreferencesForm({
  userRole,
  initialPreferences
}: MessagingPreferencesFormProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [isPending, startTransition] = useTransition()
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = (key: keyof MessagingPreferences) => {
    const newValue = !preferences[key]
    setPreferences(prev => ({ ...prev, [key]: newValue }))
    setError(null)

    startTransition(async () => {
      const result = await updateMessagingPreferences({ [key]: newValue })
      if (result.success) {
        setLastSaved(new Date().toLocaleTimeString())
      } else {
        setError(result.error || 'Failed to save')
        // Revert on error
        setPreferences(prev => ({ ...prev, [key]: !newValue }))
      }
    })
  }

  // Determine which toggles to show based on user role
  const showRecruiters = userRole === 'candidate' || userRole === 'school_admin'
  const showCandidates = userRole === 'recruiter' || userRole === 'school_admin'
  const showCareerServices = userRole === 'candidate' || userRole === 'recruiter'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Messaging Preferences</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Control who can start conversations with you
        </p>
      </div>

      <div className="space-y-4">
        {showRecruiters && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Briefcase className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <Label htmlFor="recruiters" className="font-medium">
                  Recruiters
                </Label>
                <p className="text-sm text-neutral-500">
                  Allow recruiters to message you
                </p>
              </div>
            </div>
            <Switch
              id="recruiters"
              checked={preferences.allow_messages_from_recruiters}
              onCheckedChange={() => handleToggle('allow_messages_from_recruiters')}
              disabled={isPending}
            />
          </div>
        )}

        {showCandidates && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <GraduationCap className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <Label htmlFor="candidates" className="font-medium">
                  Candidates
                </Label>
                <p className="text-sm text-neutral-500">
                  Allow candidates to message you
                </p>
              </div>
            </div>
            <Switch
              id="candidates"
              checked={preferences.allow_messages_from_candidates}
              onCheckedChange={() => handleToggle('allow_messages_from_candidates')}
              disabled={isPending}
            />
          </div>
        )}

        {showCareerServices && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Building2 className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <Label htmlFor="schools" className="font-medium">
                  Career Services
                </Label>
                <p className="text-sm text-neutral-500">
                  Allow career services offices to message you
                </p>
              </div>
            </div>
            <Switch
              id="schools"
              checked={preferences.allow_messages_from_schools}
              onCheckedChange={() => handleToggle('allow_messages_from_schools')}
              disabled={isPending}
            />
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
            <span className="text-neutral-500">Saving...</span>
          </>
        ) : error ? (
          <span className="text-red-600">{error}</span>
        ) : lastSaved ? (
          <span className="text-neutral-500">Saved at {lastSaved}</span>
        ) : null}
      </div>
    </div>
  )
}
