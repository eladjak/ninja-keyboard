'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface OnlineStatus {
  /** Whether the browser currently has a network connection */
  isOnline: boolean
  /** Whether the user went offline at any point during this session */
  wasOffline: boolean
}

/**
 * Tracks browser online/offline status with SSR safety.
 *
 * - `isOnline` reflects the current `navigator.onLine` state
 * - `wasOffline` is set to true if the user went offline at any point
 *   during the component's lifetime (useful for showing "syncing" UI)
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return navigator.onLine
  })

  const wasOfflineRef = useRef(false)
  const [wasOffline, setWasOffline] = useState(false)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    wasOfflineRef.current = true
    setWasOffline(true)
  }, [])

  useEffect(() => {
    // Sync with actual browser state on mount (handles SSR mismatch)
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, wasOffline }
}
