'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Returns `false` during SSR and the first client render, then `true` after the
 * component has mounted on the client.
 *
 * Use this to gate any UI whose value comes from a persisted (localStorage)
 * Zustand store. The server renders the store's default state, and the client's
 * first render MUST match it to avoid a hydration mismatch — only after mount is
 * it safe to show the rehydrated value.
 *
 * Implemented with `useSyncExternalStore` so the server snapshot is always
 * `false` and the client snapshot flips to `true` post-hydration, with no
 * effect-timing flicker race.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}
