/**
 * Tests for useCoinBalance — the shared coin/accent derivation used by the shop
 * and the header coin badge. Drives the real zustand stores so the hook and the
 * pure libs stay in lockstep.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCoinBalance } from './use-coin-balance'
import { useXpStore } from '@/stores/xp-store'
import { useSettingsStore } from '@/stores/settings-store'
import { LESSONS } from '@/lib/content'
import { DEFAULT_ACCENT_ID } from '@/lib/gamification/coins'

function resetStores() {
  useXpStore.setState({ completedLessons: {} })
  useSettingsStore.setState({
    coinsSpent: 0,
    unlockedCosmetics: [],
    equippedAccent: DEFAULT_ACCENT_ID,
  })
}

describe('useCoinBalance', () => {
  beforeEach(resetStores)

  it('is zero with no completed lessons', () => {
    const { result } = renderHook(() => useCoinBalance())
    expect(result.current.totalStars).toBe(0)
    expect(result.current.earned).toBe(0)
    expect(result.current.balance).toBe(0)
  })

  it('derives coins from stars and subtracts spend', () => {
    // Ace the first lesson at/above its targets → stars earned.
    const lesson = LESSONS[0]
    useXpStore.getState().completeLesson(lesson.id, lesson.targetWpm + 20, 100)
    useSettingsStore.setState({ coinsSpent: 10 })

    const { result } = renderHook(() => useCoinBalance())
    expect(result.current.totalStars).toBeGreaterThan(0)
    expect(result.current.earned).toBe(result.current.totalStars * 10)
    expect(result.current.balance).toBe(result.current.earned - 10)
  })

  it('resolves the equipped accent color, defaulting safely', () => {
    useSettingsStore.setState({ equippedAccent: 'accent-teal' })
    const { result } = renderHook(() => useCoinBalance())
    expect(result.current.equippedAccent).toBe('accent-teal')
    expect(result.current.accentColor).toMatch(/^#/)
  })
})
