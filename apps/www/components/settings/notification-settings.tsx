'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  userRole: 'candidate' | 'recruiter' | 'school'
}

interface NotificationPreferences {
  push_enabled: boolean
  email_enabled: boolean
  // Candidate-specific
  notify_profile_views?: boolean
  notify_messages?: boolean
  notify_job_matches?: boolean
  notify_deadline_reminders?: boolean
  // Recruiter-specific
  notify_new_candidates?: boolean
  notify_candidate_interest?: boolean
  notify_saved_search_matches?: boolean
  // School-specific
  notify_verification_requests?: boolean
  notify_student_placements?: boolean
}

const DEFAULT_PREFS: NotificationPreferences = {
  push_enabled: true,
  email_enabled: true,
  notify_profile_views: true,
  notify_messages: true,
  notify_job_matches: true,
  notify_deadline_reminders: true,
  notify_new_candidates: true,
  notify_candidate_interest: true,
  notify_saved_search_matches: true,
  notify_verification_requests: true,
  notify_student_placements: true,
}

export function NotificationSettings({ userRole }: NotificationSettingsProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    loadPreferences()
    // Check browser notification permission
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  async function loadPreferences() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPrefs({ ...DEFAULT_PREFS, ...data })
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePreference(key: keyof NotificationPreferences, value: boolean) {
    setSaving(true)
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const { error } = await (supabase as any)
        .from('notification_preferences')
        .upsert(
          {
            user_id: user.id,
            [key]: value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (error) throw error
      toast.success('Notification preference updated')
    } catch (error: any) {
      console.error('Error updating preference:', error)
      toast.error('Failed to update preference')
      // Revert on error
      setPrefs(prefs)
    } finally {
      setSaving(false)
    }
  }

  async function requestBrowserPermission() {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications')
      return
    }

    const permission = await Notification.requestPermission()
    setBrowserPermission(permission)

    if (permission === 'granted') {
      toast.success('Browser notifications enabled')
      // Register service worker and subscribe
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

          if (vapidKey) {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey),
            })

            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription),
            })
          }
        } catch (err) {
          console.error('Service worker error:', err)
        }
      }
    } else if (permission === 'denied') {
      toast.error('Browser notifications blocked. Please enable in browser settings.')
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Notification Settings</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Control how you receive notifications
          </p>
        </div>
      </div>

      {/* Browser Permission Status */}
      {browserPermission !== 'granted' && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <BellOff className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Browser notifications {browserPermission === 'denied' ? 'blocked' : 'not enabled'}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {browserPermission === 'denied'
                  ? 'Please enable notifications in your browser settings to receive push notifications.'
                  : 'Enable browser notifications to get real-time updates on your device.'}
              </p>
              {browserPermission !== 'denied' && (
                <button
                  onClick={requestBrowserPermission}
                  className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100 underline"
                >
                  Enable browser notifications
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Master Toggle */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="space-y-0.5">
            <Label htmlFor="push_enabled" className="text-base font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Receive notifications on this device
            </p>
          </div>
          <Switch
            id="push_enabled"
            checked={prefs.push_enabled}
            onCheckedChange={(checked) => updatePreference('push_enabled', checked)}
            disabled={saving || browserPermission !== 'granted'}
          />
        </div>

        {/* Notification Types based on role */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Notification Types
          </h3>

          {/* Candidate notifications */}
          {userRole === 'candidate' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_profile_views" className="text-sm">
                    Profile Views
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When recruiters view your profile
                  </p>
                </div>
                <Switch
                  id="notify_profile_views"
                  checked={prefs.notify_profile_views}
                  onCheckedChange={(checked) => updatePreference('notify_profile_views', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_messages" className="text-sm">
                    New Messages
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When you receive a new message
                  </p>
                </div>
                <Switch
                  id="notify_messages"
                  checked={prefs.notify_messages}
                  onCheckedChange={(checked) => updatePreference('notify_messages', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_job_matches" className="text-sm">
                    Job Matches
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When new jobs match your profile
                  </p>
                </div>
                <Switch
                  id="notify_job_matches"
                  checked={prefs.notify_job_matches}
                  onCheckedChange={(checked) => updatePreference('notify_job_matches', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_deadline_reminders" className="text-sm">
                    Deadline Reminders
                  </Label>
                  <p className="text-xs text-neutral-500">
                    Reminders for application deadlines
                  </p>
                </div>
                <Switch
                  id="notify_deadline_reminders"
                  checked={prefs.notify_deadline_reminders}
                  onCheckedChange={(checked) => updatePreference('notify_deadline_reminders', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>
            </>
          )}

          {/* Recruiter notifications */}
          {userRole === 'recruiter' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_messages" className="text-sm">
                    New Messages
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When you receive a new message
                  </p>
                </div>
                <Switch
                  id="notify_messages"
                  checked={prefs.notify_messages}
                  onCheckedChange={(checked) => updatePreference('notify_messages', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_new_candidates" className="text-sm">
                    New Candidates
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When new candidates join the network
                  </p>
                </div>
                <Switch
                  id="notify_new_candidates"
                  checked={prefs.notify_new_candidates}
                  onCheckedChange={(checked) => updatePreference('notify_new_candidates', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_candidate_interest" className="text-sm">
                    Candidate Interest
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When candidates express interest in your firm
                  </p>
                </div>
                <Switch
                  id="notify_candidate_interest"
                  checked={prefs.notify_candidate_interest}
                  onCheckedChange={(checked) => updatePreference('notify_candidate_interest', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_saved_search_matches" className="text-sm">
                    Saved Search Matches
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When candidates match your saved searches
                  </p>
                </div>
                <Switch
                  id="notify_saved_search_matches"
                  checked={prefs.notify_saved_search_matches}
                  onCheckedChange={(checked) => updatePreference('notify_saved_search_matches', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>
            </>
          )}

          {/* School notifications */}
          {userRole === 'school' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_messages" className="text-sm">
                    New Messages
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When you receive a new message
                  </p>
                </div>
                <Switch
                  id="notify_messages"
                  checked={prefs.notify_messages}
                  onCheckedChange={(checked) => updatePreference('notify_messages', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_verification_requests" className="text-sm">
                    Verification Requests
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When students need transcript verification
                  </p>
                </div>
                <Switch
                  id="notify_verification_requests"
                  checked={prefs.notify_verification_requests}
                  onCheckedChange={(checked) => updatePreference('notify_verification_requests', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify_student_placements" className="text-sm">
                    Student Placements
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When your students accept offers
                  </p>
                </div>
                <Switch
                  id="notify_student_placements"
                  checked={prefs.notify_student_placements}
                  onCheckedChange={(checked) => updatePreference('notify_student_placements', checked)}
                  disabled={saving || !prefs.push_enabled}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer
}
