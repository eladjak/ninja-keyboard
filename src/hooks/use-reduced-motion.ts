'use client'

import { useEffect, useState } from 'react'
import { useAccessibilityStore } from '@/stores/accessibility-store'
import { useSettingsStore } from '@/stores/settings-store'

/**
 * Returns `true` when animations should be reduced or disabled.
 *
 * Checks THREE sources (logical OR — this must always fail closed, i.e. toward
 * less motion; a child who asked for stillness anywhere must get it everywhere):
 *  1. The OS-level `prefers-reduced-motion: reduce` media query
 *  2. The in-app accessibility store toggle (`reducedMotion`)
 *  3. The settings store toggle (`reducedMotion`) — a second, independent flag
 *     the app grew. ConfettiBurst honoured only this one and therefore ignored
 *     the OS preference entirely; folding it in here means one source of truth
 *     instead of three half-truths.
 *
 * Use this hook in any component that uses Framer Motion or JS-driven
 * animations to conditionally disable or simplify them.
 *
 * CSS-driven animations are handled separately via `@media (prefers-reduced-motion)`
 * rules in globals.css.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)
  const appReducedMotion = useAccessibilityStore((s) => s.reducedMotion)
  const settingsReducedMotion = useSettingsStore((s) => s.reducedMotion)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced || appReducedMotion || settingsReducedMotion
}
