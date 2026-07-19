'use client'

import { useEffect, useState } from 'react'

/**
 * Returns `true` when the current device is primarily a touch device
 * (tablet, phone, touch-Chromebook) and therefore benefits from the
 * on-screen keyboard as its PRIMARY input path.
 *
 * Detection strategy (SSR-safe, starts `false` on the server so hydration
 * matches, then resolves on mount):
 *  1. `(pointer: coarse)` — the CSS-media way to ask "is the primary
 *     pointer a finger?" This is the most reliable signal and updates live
 *     when a device switches modes (e.g. a 2-in-1 detaching its keyboard).
 *  2. Fallback for older engines: `navigator.maxTouchPoints > 0`.
 *
 * We deliberately do NOT use the legacy `'ontouchstart' in window` probe: it
 * yields false positives on plenty of touch-capable *desktops* (and in jsdom),
 * which would wrongly force tap-input on a mouse-first machine. The two signals
 * above are the reliable ones for "is the PRIMARY input a finger?".
 *
 * NOTE: This is a *device-capability* signal, not a lock. The on-screen
 * keyboard is always usable via mouse/tap on any device; this hook only
 * decides the sensible DEFAULT visibility so touch-only kids are never
 * stranded without an input method.
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    function detect(): boolean {
      const coarse =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches
      const maxTouch =
        typeof navigator !== 'undefined' &&
        typeof navigator.maxTouchPoints === 'number' &&
        navigator.maxTouchPoints > 0
      return coarse || maxTouch
    }

    setIsTouch(detect())

    // Keep in sync if the primary pointer changes (2-in-1 dock/undock).
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(pointer: coarse)')
    const handler = () => setIsTouch(detect())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isTouch
}
