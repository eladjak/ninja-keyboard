import { describe, it, expect, beforeEach } from 'vitest'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import type { PracticeResult } from '@/stores/practice-history-store'

function makeSampleResult(overrides: Partial<Omit<PracticeResult, 'id'>> = {}) {
  return {
    textId: 'practice-01',
    wpm: 30,
    accuracy: 90,
    durationMs: 60_000,
    totalKeystrokes: 100,
    correctKeystrokes: 90,
    keyAccuracy: {
      'ש': { correct: 10, total: 12 },
      'ל': { correct: 8, total: 8 },
    },
    completedAt: Date.now(),
    timerDuration: 60,
    ...overrides,
  }
}

describe('usePracticeHistoryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePracticeHistoryStore.setState({ results: [] })
  })

  it('starts with empty results', () => {
    const { results } = usePracticeHistoryStore.getState()
    expect(results).toEqual([])
  })

  it('adds a result and generates an ID', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult())

    const { results } = usePracticeHistoryStore.getState()
    expect(results).toHaveLength(1)
    expect(results[0].id).toMatch(/^practice-/)
    expect(results[0].wpm).toBe(30)
    expect(results[0].accuracy).toBe(90)
  })

  it('newest results appear first', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult({ wpm: 20, completedAt: 1000 }))
    store.addResult(makeSampleResult({ wpm: 40, completedAt: 2000 }))

    const { results } = usePracticeHistoryStore.getState()
    expect(results).toHaveLength(2)
    expect(results[0].wpm).toBe(40) // newest first
    expect(results[1].wpm).toBe(20)
  })

  it('getBestWpm returns the highest WPM', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult({ wpm: 25 }))
    store.addResult(makeSampleResult({ wpm: 45 }))
    store.addResult(makeSampleResult({ wpm: 35 }))

    expect(usePracticeHistoryStore.getState().getBestWpm()).toBe(45)
  })

  it('getBestWpm returns 0 when no results', () => {
    expect(usePracticeHistoryStore.getState().getBestWpm()).toBe(0)
  })

  it('getBestAccuracy returns the highest accuracy', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult({ accuracy: 80 }))
    store.addResult(makeSampleResult({ accuracy: 95 }))
    store.addResult(makeSampleResult({ accuracy: 88 }))

    expect(usePracticeHistoryStore.getState().getBestAccuracy()).toBe(95)
  })

  it('getTotalPracticeTime sums all durations', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult({ durationMs: 60_000 }))
    store.addResult(makeSampleResult({ durationMs: 120_000 }))

    expect(usePracticeHistoryStore.getState().getTotalPracticeTime()).toBe(180_000)
  })

  it('getProblematicKeys aggregates and sorts by accuracy', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(
      makeSampleResult({
        keyAccuracy: {
          'ש': { correct: 3, total: 10 }, // 30% accuracy
          'ל': { correct: 9, total: 10 }, // 90% accuracy
        },
      }),
    )

    const keys = usePracticeHistoryStore.getState().getProblematicKeys()
    expect(keys.length).toBe(2)
    expect(keys[0].char).toBe('ש') // worst first
    expect(keys[0].accuracy).toBe(30)
    expect(keys[1].char).toBe('ל')
    expect(keys[1].accuracy).toBe(90)
  })

  it('getProblematicKeys filters keys with less than 5 total hits', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(
      makeSampleResult({
        keyAccuracy: {
          'ש': { correct: 1, total: 3 }, // only 3 hits, should be filtered
          'ל': { correct: 4, total: 8 }, // 8 hits, should be included
        },
      }),
    )

    const keys = usePracticeHistoryStore.getState().getProblematicKeys()
    expect(keys.length).toBe(1)
    expect(keys[0].char).toBe('ל')
  })

  it('getWpmTrend returns data in chronological order (oldest first)', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult({ wpm: 20, completedAt: 1000 }))
    store.addResult(makeSampleResult({ wpm: 30, completedAt: 2000 }))
    store.addResult(makeSampleResult({ wpm: 40, completedAt: 3000 }))

    const trend = usePracticeHistoryStore.getState().getWpmTrend()
    expect(trend).toHaveLength(3)
    // Store stores newest first, but getWpmTrend reverses
    expect(trend[0].wpm).toBe(20) // oldest
    expect(trend[2].wpm).toBe(40) // newest
    expect(trend[0].sessionIndex).toBe(1)
    expect(trend[2].sessionIndex).toBe(3)
  })

  it('getWpmTrend returns at most 20 sessions', () => {
    const store = usePracticeHistoryStore.getState()
    for (let i = 0; i < 25; i++) {
      store.addResult(makeSampleResult({ wpm: 10 + i, completedAt: i * 1000 }))
    }

    const trend = usePracticeHistoryStore.getState().getWpmTrend()
    expect(trend.length).toBeLessThanOrEqual(20)
  })

  it('getRecentResults filters by days', () => {
    const now = Date.now()
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult({ completedAt: now })) // today
    store.addResult(makeSampleResult({ completedAt: now - 2 * 24 * 60 * 60 * 1000 })) // 2 days ago
    store.addResult(makeSampleResult({ completedAt: now - 10 * 24 * 60 * 60 * 1000 })) // 10 days ago

    const recent1 = usePracticeHistoryStore.getState().getRecentResults(1)
    expect(recent1).toHaveLength(1)

    const recent7 = usePracticeHistoryStore.getState().getRecentResults(7)
    expect(recent7).toHaveLength(2)

    const recent30 = usePracticeHistoryStore.getState().getRecentResults(30)
    expect(recent30).toHaveLength(3)
  })

  it('clearHistory removes all results', () => {
    const store = usePracticeHistoryStore.getState()
    store.addResult(makeSampleResult())
    store.addResult(makeSampleResult())

    expect(usePracticeHistoryStore.getState().results).toHaveLength(2)

    usePracticeHistoryStore.getState().clearHistory()
    expect(usePracticeHistoryStore.getState().results).toHaveLength(0)
  })
})
