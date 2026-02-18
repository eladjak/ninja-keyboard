import { describe, it, expect, beforeEach } from 'vitest'
import { useDailyChallengeStore } from '@/stores/daily-challenge-store'

describe('useDailyChallengeStore', () => {
  beforeEach(() => {
    useDailyChallengeStore.setState({ completedChallenges: {} })
  })

  it('starts with no completed challenges', () => {
    const { completedChallenges } = useDailyChallengeStore.getState()
    expect(completedChallenges).toEqual({})
  })

  it('completes a challenge', () => {
    const store = useDailyChallengeStore.getState()
    store.completeChallenge('2026-02-18', 30)

    const { completedChallenges } = useDailyChallengeStore.getState()
    expect(completedChallenges['2026-02-18']).toBeDefined()
    expect(completedChallenges['2026-02-18'].xpEarned).toBe(30)
    expect(completedChallenges['2026-02-18'].completedAt).toBeGreaterThan(0)
  })

  it('isChallengeCompleted returns true for completed dates', () => {
    const store = useDailyChallengeStore.getState()
    store.completeChallenge('2026-02-18', 25)

    expect(useDailyChallengeStore.getState().isChallengeCompleted('2026-02-18')).toBe(true)
    expect(useDailyChallengeStore.getState().isChallengeCompleted('2026-02-19')).toBe(false)
  })

  it('getTotalCompleted counts completed challenges', () => {
    const store = useDailyChallengeStore.getState()
    expect(store.getTotalCompleted()).toBe(0)

    store.completeChallenge('2026-02-16', 20)
    store.completeChallenge('2026-02-17', 25)
    store.completeChallenge('2026-02-18', 30)

    expect(useDailyChallengeStore.getState().getTotalCompleted()).toBe(3)
  })

  it('getChallengeStreak returns 0 when no challenges completed', () => {
    expect(useDailyChallengeStore.getState().getChallengeStreak()).toBe(0)
  })

  it('does not overwrite already completed challenge', () => {
    const store = useDailyChallengeStore.getState()
    store.completeChallenge('2026-02-18', 30)
    const firstCompletedAt = useDailyChallengeStore.getState().completedChallenges['2026-02-18'].completedAt

    // Completing again should overwrite (latest attempt)
    store.completeChallenge('2026-02-18', 40)
    const { completedChallenges } = useDailyChallengeStore.getState()
    expect(completedChallenges['2026-02-18'].xpEarned).toBe(40)
  })
})
