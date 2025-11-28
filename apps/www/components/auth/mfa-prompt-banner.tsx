'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Shield, X } from 'lucide-react'
import Link from 'next/link'

const DISMISS_KEY = 'mfa-prompt-dismissed'

interface MFAPromptBannerProps {
  settingsPath: string // Path to the settings page with MFA settings
}

export function MFAPromptBanner({ settingsPath }: MFAPromptBannerProps) {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkMFAStatus() {
      // Check if user has dismissed this prompt
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        setLoading(false)
        return
      }

      const supabase = createClient()

      try {
        // Check if user has MFA enabled
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const hasMFA = factors?.totp?.some(f => f.status === 'verified')

        if (!hasMFA) {
          setVisible(true)
        }
      } catch (err) {
        console.error('Failed to check MFA status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkMFAStatus()
  }, [])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setVisible(false)
  }

  if (loading || !visible) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Protect your account with two-factor authentication.
              <span className="hidden sm:inline"> It only takes a minute to set up.</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Link href={settingsPath}>Enable 2FA</Link>
            </Button>
            <button
              onClick={handleDismiss}
              className="rounded-md p-1 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
