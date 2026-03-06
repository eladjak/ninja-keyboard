'use client'

import { useCallback, useRef } from 'react'

import { playUISound, type UISoundKey } from '@/lib/audio/ui-sounds'
import { useSettingsStore } from '@/stores/settings-store'

export type { UISoundKey } from '@/lib/audio/ui-sounds'

interface UseSoundEffectOptions {
  /** Minimum ms between plays to prevent spam. Default 100. */
  cooldown?: number
  /** Volume override 0-1. If omitted, uses the settings store value. */
  volume?: number
  /** Whether this sound is enabled. Default true. */
  enabled?: boolean
}

/**
 * React hook that returns a stable `play` function for a given UI sound key.
 *
 * - Respects the user's global sound enabled / volume settings from the store.
 * - Applies a cooldown to prevent sound spam (configurable, default 100ms).
 * - SSR-safe: the play function is a no-op on the server.
 *
 * @example
 * ```tsx
 * const playClick = useSoundEffect('click')
 * return <button onClick={playClick}>Go</button>
 * ```
 */
export function useSoundEffect(
  soundKey: UISoundKey,
  options?: UseSoundEffectOptions,
): () => void {
  const { cooldown = 100, volume: volumeOverride, enabled = true } = options ?? {}

  const lastPlayedRef = useRef(0)

  const play = useCallback(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    // Read settings store at play-time (not subscription) to avoid re-renders
    const state = useSettingsStore.getState()
    if (!state.soundEnabled) return

    // Cooldown check
    const now = Date.now()
    if (now - lastPlayedRef.current < cooldown) return
    lastPlayedRef.current = now

    const vol = volumeOverride ?? state.soundVolume
    playUISound(soundKey, vol)
  }, [soundKey, cooldown, volumeOverride, enabled])

  return play
}

// ---------------------------------------------------------------------------
// Shorthand hooks
// ---------------------------------------------------------------------------

/** Play a click sound on button press. */
export function useClickSound(options?: Omit<UseSoundEffectOptions, 'cooldown'>): () => void {
  return useSoundEffect('click', { cooldown: 80, ...options })
}

/** Play a navigate sound on page/tab transition. */
export function useNavigateSound(options?: UseSoundEffectOptions): () => void {
  return useSoundEffect('navigate', options)
}

/** Play a success sound when an action completes. */
export function useSuccessSound(options?: UseSoundEffectOptions): () => void {
  return useSoundEffect('success', options)
}
