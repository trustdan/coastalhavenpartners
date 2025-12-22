'use client'

import { useState, useEffect, useCallback } from 'react'

type PortalType = 'candidate' | 'recruiter' | 'school'

const STORAGE_KEY_PREFIX = 'chp_demo_dismissed_'

/**
 * Hook for managing demo data display state per portal type.
 *
 * Logic:
 * - Demo data shows by default for new users
 * - Users can dismiss demo data (persisted in localStorage)
 * - Demo data auto-hides when real data exists
 * - Users can restore demo data from empty state
 */
export function useDemoData(portalType: PortalType) {
  const [dismissed, setDismissed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const storageKey = `${STORAGE_KEY_PREFIX}${portalType}`

  // Load dismissed state from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    setDismissed(stored === 'true')
    setIsHydrated(true)
  }, [storageKey])

  // Dismiss demo data (user clicked "Clear")
  const dismiss = useCallback(() => {
    localStorage.setItem(storageKey, 'true')
    setDismissed(true)
  }, [storageKey])

  // Restore demo data (user clicked "Show Sample Data" from empty state)
  const restore = useCallback(() => {
    localStorage.removeItem(storageKey)
    setDismissed(false)
  }, [storageKey])

  return {
    /** Whether demo data has been dismissed by the user */
    dismissed,
    /** Whether the hook has hydrated from localStorage */
    isHydrated,
    /** Dismiss demo data (persists to localStorage) */
    dismiss,
    /** Restore demo data (removes localStorage flag) */
    restore,
  }
}

/**
 * Compute whether to show demo data based on:
 * 1. User hasn't dismissed it
 * 2. No real data exists
 */
export function shouldShowDemoData(
  dismissed: boolean,
  hasRealData: boolean
): boolean {
  return !dismissed && !hasRealData
}
