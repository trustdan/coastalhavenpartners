'use client'

import { useState } from 'react'
import { Bell, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEngagementTracking } from '@/hooks/use-engagement-tracking'
import { cn } from '@/lib/utils'

interface NotificationPromptProps {
  className?: string
  userType?: 'candidate' | 'recruiter' | 'school'
}

const MESSAGES = {
  candidate: {
    title: 'Stay in the loop',
    description: 'Get notified when recruiters view your profile or send you messages.',
  },
  recruiter: {
    title: 'Never miss top talent',
    description: 'Get notified when new candidates match your saved searches.',
  },
  school: {
    title: 'Track student activity',
    description: 'Get notified when students need verification or achieve placements.',
  },
  default: {
    title: 'Enable notifications',
    description: 'Stay updated on important activity in your account.',
  },
}

export function NotificationPrompt({ className, userType }: NotificationPromptProps) {
  const { shouldShowPrompt, dismissPrompt, markNotificationsEnabled, isReady } = useEngagementTracking()
  const [isRequesting, setIsRequesting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const message = userType ? MESSAGES[userType] : MESSAGES.default

  async function handleEnableNotifications() {
    setIsRequesting(true)

    try {
      // Request browser permission
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        // Register service worker if not already registered
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered:', registration.scope)

            // Get push subscription
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
            })

            // Send subscription to server
            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription),
            })
          } catch (swError) {
            console.log('Service Worker registration pending - will work when sw.js is available')
          }
        }

        markNotificationsEnabled()
        setShowSuccess(true)

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      } else {
        // User denied - dismiss prompt permanently
        dismissPrompt(true)
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    } finally {
      setIsRequesting(false)
    }
  }

  function handleDismiss() {
    dismissPrompt(false) // Temporary dismiss, will show again later
  }

  function handleNeverAsk() {
    dismissPrompt(true) // Permanent dismiss
  }

  // Don't render until ready or if shouldn't show
  if (!isReady || (!shouldShowPrompt && !showSuccess)) {
    return null
  }

  // Success state
  if (showSuccess) {
    return (
      <div
        className={cn(
          'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50',
          'rounded-xl border border-green-200 bg-green-50 p-4 shadow-lg',
          'dark:border-green-800 dark:bg-green-900/30',
          'animate-in slide-in-from-bottom-4 fade-in duration-300',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Notifications enabled!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              You&apos;ll be notified of important updates.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50',
        'rounded-xl border bg-white p-4 shadow-lg dark:bg-neutral-900',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        className
      )}
    >
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Content */}
        <div className="flex-1 pr-4">
          <p className="font-medium">{message.title}</p>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
            {message.description}
          </p>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              disabled={isRequesting}
            >
              {isRequesting ? 'Enabling...' : 'Enable'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNeverAsk}
              className="text-neutral-500"
            >
              Don&apos;t ask again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to convert VAPID key to ArrayBuffer for Web Push API
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  if (!base64String) {
    return new ArrayBuffer(0)
  }

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray.buffer
}
