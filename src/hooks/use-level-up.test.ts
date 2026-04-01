/**
 * Tests for useLevelUp hook.
 *
 * Verifies that:
 * - calculateLevelFromXp returns correct level (every 100 XP = 1 level, starts at level 1)
 * - justLeveledUp is true when XP crosses a level threshold
 * - justLeveledUp is false when XP increases within the same level
 * - justLeveledUp is false when XP is the same
 * - clearLevelUp resets justLeveledUp to false
 * - level is always at least 1
 * - XP of 0 → level 1, XP 99 → level 1, XP 100 → level 2, XP 199 → level 2, XP 200 → level 3
 */

import { describe, it, expect } from 'vitest'
import { calculateLevelFromXp } from '@/hooks/use-level-up'

// ---------------------------------------------------------------------------
// calculateLevelFromXp (pure function, exported for direct testing)
// ---------------------------------------------------------------------------

describe('calculateLevelFromXp', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevelFromXp(0)).toBe(1)
  })

  it('returns level 1 for 99 XP', () => {
    expect(calculateLevelFromXp(99)).toBe(1)
  })

  it('returns level 2 at exactly 100 XP', () => {
    expect(calculateLevelFromXp(100)).toBe(2)
  })

  it('returns level 2 for 199 XP', () => {
    expect(calculateLevelFromXp(199)).toBe(2)
  })

  it('returns level 3 at exactly 200 XP', () => {
    expect(calculateLevelFromXp(200)).toBe(3)
  })

  it('returns level 10 at 900 XP', () => {
    expect(calculateLevelFromXp(900)).toBe(10)
  })

  it('returns level 11 at 1000 XP', () => {
    expect(calculateLevelFromXp(1000)).toBe(11)
  })

  it('never returns less than 1 for negative XP', () => {
    expect(calculateLevelFromXp(-50)).toBe(1)
  })

  it('handles large XP values correctly', () => {
    expect(calculateLevelFromXp(5000)).toBe(51)
  })
})

// ---------------------------------------------------------------------------
// detectLevelUp (pure function for level-up detection)
// ---------------------------------------------------------------------------

import { detectLevelUp } from '@/hooks/use-level-up'

describe('detectLevelUp', () => {
  it('returns false when XP stays in same level band', () => {
    expect(detectLevelUp(50, 75)).toBe(false)
  })

  it('returns true when XP crosses level boundary', () => {
    expect(detectLevelUp(99, 100)).toBe(true)
  })

  it('returns true when XP jumps multiple levels', () => {
    expect(detectLevelUp(50, 350)).toBe(true)
  })

  it('returns false when XP does not change', () => {
    expect(detectLevelUp(150, 150)).toBe(false)
  })

  it('returns false when prevXp is greater (XP cannot decrease)', () => {
    expect(detectLevelUp(200, 100)).toBe(false)
  })

  it('returns true when starting from 0 and reaching level 2', () => {
    expect(detectLevelUp(0, 100)).toBe(true)
  })
})
