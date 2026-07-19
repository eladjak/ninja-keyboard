'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

export interface OnlineStatus {
  /** Whether the browser currently has a network connection */
  isOnline: boolean
  /** Whether the user went offline at any point during this session */
  wasOffline: boolean
}

function subscribeToConnection(onChange: () => void): () => void {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

function getConnectionSnapshot(): boolean {
  return navigator.onLine
}

function getServerConnectionSnapshot(): boolean {
  return true
}

/**
 * Tracks browser online/offline status with SSR safety.
 *
 * - `isOnline` reflects the current `navigator.onLine` state
 * - `wasOffline` is set to true if the user went offline at any point
 *   during the component's lifetime (useful for showing "syncing" UI)
 */
export function useOnlineStatus(): OnlineStatus {
  // useSyncExternalStore uses the optimistic server snapshot during hydration,
  // then switches to navigator.onLine without creating an SSR mismatch.
  const isOnline = useSyncExternalStore(
    subscribeToConnection,
    getConnectionSnapshot,
    getServerConnectionSnapshot,
  )
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    function markOffline(): void {
      setWasOffline(true)
    }

    window.addEventListener('offline', markOffline)
    return () => window.removeEventListener('offline', markOffline)
  }, [])

  return { isOnline, wasOffline }
}
