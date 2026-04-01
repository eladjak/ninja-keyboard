'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Calculates the player level from a given XP amount.
 * Formula: every 100 XP = 1 level, starting at level 1.
 *
 * XP 0-99 → level 1
 * XP 100-199 → level 2
 * XP 200-299 → level 3
 * ...and so on.
 *
 * Exported as a pure function so it can be tested independently
 * and reused without mounting the hook.
 */
export function calculateLevelFromXp(xp: number): number {
  if (xp <= 0) return 1
  return Math.floor(xp / 100) + 1
}

/**
 * Detects whether a level-up occurred between two XP values.
 *
 * Returns `true` only when the new XP pushes the player into a higher level
 * than the previous XP value — i.e. `calculateLevelFromXp(newXp) > calculateLevelFromXp(prevXp)`.
 *
 * Returns `false` for equal values or for XP decreases.
 *
 * Exported as a pure function for direct unit testing.
 */
export function detectLevelUp(prevXp: number, newXp: number): boolean {
  if (newXp <= prevXp) return false
  return calculateLevelFromXp(newXp) > calculateLevelFromXp(prevXp)
}

export interface UseLevelUpReturn {
  /** Current level (1-based, derived from xp) */
  level: number
  /** True for one render cycle after a level-up is detected */
  justLeveledUp: boolean
  /** Call to acknowledge and clear the level-up flag */
  clearLevelUp: () => void
}

/**
 * useLevelUp — detects level transitions from a live XP value.
 *
 * The hook compares the current `xp` against its previous value on every
 * render. When the level increases, `justLeveledUp` becomes `true` and
 * remains `true` until `clearLevelUp()` is called (or the optional
 * `autoClearMs` duration elapses).
 *
 * @param xp          Current total XP (should only increase).
 * @param autoClearMs Optional: automatically clear the flag after this many
 *                    milliseconds. Pass 0 to disable auto-clear (caller must
 *                    call `clearLevelUp` manually). Defaults to 0.
 */
export function useLevelUp(xp: number, autoClearMs = 0): UseLevelUpReturn {
  const level = calculateLevelFromXp(xp)
  const prevXpRef = useRef(xp)
  const [justLeveledUp, setJustLeveledUp] = useState(false)

  useEffect(() => {
    const prevXp = prevXpRef.current

    if (detectLevelUp(prevXp, xp)) {
      setJustLeveledUp(true)
    }

    prevXpRef.current = xp
  }, [xp])

  useEffect(() => {
    if (!justLeveledUp || autoClearMs <= 0) return

    const timer = setTimeout(() => setJustLeveledUp(false), autoClearMs)
    return () => clearTimeout(timer)
  }, [justLeveledUp, autoClearMs])

  const clearLevelUp = useCallback(() => setJustLeveledUp(false), [])

  return { level, justLeveledUp, clearLevelUp }
}
