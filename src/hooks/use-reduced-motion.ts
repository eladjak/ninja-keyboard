'use client'

import { useEffect, useState } from 'react'
import { useAccessibilityStore } from '@/stores/accessibility-store'

/**
 * Returns `true` when animations should be reduced or disabled.
 *
 * Checks two sources (logical OR):
 *  1. The OS-level `prefers-reduced-motion: reduce` media query
 *  2. The in-app accessibility store toggle (`reducedMotion`)
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

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced || appReducedMotion
}
