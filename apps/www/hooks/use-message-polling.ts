"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

interface UseMessagePollingOptions {
  conversationId?: string
  enabled?: boolean
  interval?: number // milliseconds
}

/**
 * Hook to poll for new messages in a conversation or globally.
 * Uses router.refresh() to trigger server-side re-fetch.
 *
 * @param options.conversationId - If provided, polls a specific conversation
 * @param options.enabled - Whether polling is enabled (default: true)
 * @param options.interval - Polling interval in ms (default: 5000)
 */
export function useMessagePolling({
  conversationId,
  enabled = true,
  interval = 5000,
}: UseMessagePollingOptions = {}) {
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Start polling
    intervalRef.current = setInterval(refresh, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, refresh])

  return { refresh }
}
