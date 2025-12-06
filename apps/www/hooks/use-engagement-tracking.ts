'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'chp_engagement'
const SESSION_START_KEY = 'chp_session_start'

interface EngagementData {
  pagesVisited: number
  totalTimeSeconds: number
  lastVisit: number
  promptDismissed: boolean
  promptDismissedAt: number | null
  notificationsEnabled: boolean
}

interface EngagementThresholds {
  minPages: number
  minTimeSeconds: number
  dismissCooldownDays: number
}

const DEFAULT_THRESHOLDS: EngagementThresholds = {
  minPages: 3,
  minTimeSeconds: 120, // 2 minutes
  dismissCooldownDays: 7, // Don't show again for 7 days after dismiss
}

function getStoredEngagement(): EngagementData {
  if (typeof window === 'undefined') {
    return {
      pagesVisited: 0,
      totalTimeSeconds: 0,
      lastVisit: 0,
      promptDismissed: false,
      promptDismissedAt: null,
      notificationsEnabled: false,
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Invalid JSON, reset
  }

  return {
    pagesVisited: 0,
    totalTimeSeconds: 0,
    lastVisit: Date.now(),
    promptDismissed: false,
    promptDismissedAt: null,
    notificationsEnabled: false,
  }
}

function saveEngagement(data: EngagementData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useEngagementTracking(thresholds: EngagementThresholds = DEFAULT_THRESHOLDS) {
  const pathname = usePathname()
  const [engagement, setEngagement] = useState<EngagementData>(getStoredEngagement)
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // Initialize and track session time
  useEffect(() => {
    // Get or set session start time
    let sessionStart = sessionStorage.getItem(SESSION_START_KEY)
    if (!sessionStart) {
      sessionStart = Date.now().toString()
      sessionStorage.setItem(SESSION_START_KEY, sessionStart)
    }

    // Load stored engagement
    const stored = getStoredEngagement()
    setEngagement(stored)
    setIsReady(true)

    // Update time every 10 seconds
    const interval = setInterval(() => {
      const sessionSeconds = Math.floor((Date.now() - parseInt(sessionStart!)) / 1000)

      setEngagement((prev) => {
        const updated = {
          ...prev,
          totalTimeSeconds: prev.totalTimeSeconds + 10,
          lastVisit: Date.now(),
        }
        saveEngagement(updated)
        return updated
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Track page visits
  useEffect(() => {
    if (!isReady) return

    setEngagement((prev) => {
      const updated = {
        ...prev,
        pagesVisited: prev.pagesVisited + 1,
        lastVisit: Date.now(),
      }
      saveEngagement(updated)
      return updated
    })
  }, [pathname, isReady])

  // Determine if prompt should show
  useEffect(() => {
    if (!isReady) return

    // Don't show if notifications already enabled
    if (engagement.notificationsEnabled) {
      setShouldShowPrompt(false)
      return
    }

    // Don't show if dismissed within cooldown period
    if (engagement.promptDismissed && engagement.promptDismissedAt) {
      const daysSinceDismiss = (Date.now() - engagement.promptDismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSinceDismiss < thresholds.dismissCooldownDays) {
        setShouldShowPrompt(false)
        return
      }
    }

    // Check if browser supports notifications
    if (typeof window !== 'undefined' && !('Notification' in window)) {
      setShouldShowPrompt(false)
      return
    }

    // Check if already granted or denied at browser level
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted' || Notification.permission === 'denied') {
        setShouldShowPrompt(false)
        return
      }
    }

    // Show prompt if engagement thresholds met
    const meetsPageThreshold = engagement.pagesVisited >= thresholds.minPages
    const meetsTimeThreshold = engagement.totalTimeSeconds >= thresholds.minTimeSeconds

    setShouldShowPrompt(meetsPageThreshold || meetsTimeThreshold)
  }, [engagement, thresholds, isReady])

  const dismissPrompt = useCallback((permanent = false) => {
    setEngagement((prev) => {
      const updated = {
        ...prev,
        promptDismissed: permanent,
        promptDismissedAt: permanent ? Date.now() : prev.promptDismissedAt,
      }
      saveEngagement(updated)
      return updated
    })
    setShouldShowPrompt(false)
  }, [])

  const markNotificationsEnabled = useCallback(() => {
    setEngagement((prev) => {
      const updated = {
        ...prev,
        notificationsEnabled: true,
        promptDismissed: true,
      }
      saveEngagement(updated)
      return updated
    })
    setShouldShowPrompt(false)
  }, [])

  return {
    engagement,
    shouldShowPrompt,
    dismissPrompt,
    markNotificationsEnabled,
    isReady,
  }
}
