import { describe, it, expect } from 'vitest'
import {
  calculateWpm,
  calculateAccuracy,
  processKeystroke,
  computeSessionStats,
  findWeakKeys,
  calculateRealtimeWpm,
  isLessonComplete,
  calculateXpReward,
} from '@/lib/typing-engine/engine'
import type { Keystroke } from '@/lib/typing-engine/types'

// Helper: create keystroke sequence
function makeKeystrokes(
  chars: Array<{ expected: string; actual: string }>,
  startTime: number,
  intervalMs: number,
): Keystroke[] {
  return chars.map((c, i) => ({
    expected: c.expected,
    actual: c.actual,
    isCorrect: c.expected === c.actual,
    timestamp: startTime + i * intervalMs,
    code: `Key${c.actual.toUpperCase()}`,
  }))
}

describe('calculateWpm', () => {
  it('returns 0 when elapsed time is 0', () => {
    expect(calculateWpm(10, 0)).toBe(0)
  })

  it('returns 0 when elapsed time is negative', () => {
    expect(calculateWpm(10, -1000)).toBe(0)
  })

  it('returns 0 when charCount is 0', () => {
    expect(calculateWpm(0, 60_000)).toBe(0)
  })

  it('calculates WPM for 55 chars in 1 minute (10 words)', () => {
    // 55 chars / 5.5 avg = 10 words, 1 minute = 10 WPM
    expect(calculateWpm(55, 60_000)).toBe(10)
  })
})

describe('calculateAccuracy', () => {
  it('returns 100 when no characters typed', () => {
    expect(calculateAccuracy(0, 0)).toBe(100)
  })

  it('returns 100 for all correct', () => {
    expect(calculateAccuracy(10, 10)).toBe(100)
  })

  it('returns 50 for half correct', () => {
    expect(calculateAccuracy(5, 10)).toBe(50)
  })

  it('returns 0 for none correct', () => {
    expect(calculateAccuracy(0, 10)).toBe(0)
  })
})

describe('processKeystroke', () => {
  it('creates correct keystroke when chars match', () => {
    const ks = processKeystroke('ש', 'ש', 'KeyA', 1000)
    expect(ks.isCorrect).toBe(true)
    expect(ks.expected).toBe('ש')
    expect(ks.actual).toBe('ש')
    expect(ks.timestamp).toBe(1000)
  })

  it('creates incorrect keystroke when chars differ', () => {
    const ks = processKeystroke('ש', 'ד', 'KeyS', 2000)
    expect(ks.isCorrect).toBe(false)
  })
})

describe('computeSessionStats', () => {
  it('computes stats from keystrokes', () => {
    const keystrokes = makeKeystrokes(
      [
        { expected: 'ש', actual: 'ש' },
        { expected: 'ד', actual: 'ד' },
        { expected: 'ג', actual: 'כ' }, // wrong
      ],
      0,
      200,
    )
    const stats = computeSessionStats(keystrokes, 0, 600)
    expect(stats.totalKeystrokes).toBe(3)
    expect(stats.correctKeystrokes).toBe(2)
    expect(stats.errorKeystrokes).toBe(1)
    expect(stats.accuracy).toBe(67)
    expect(stats.durationMs).toBe(600)
  })

  it('returns zero WPM for empty keystrokes', () => {
    const stats = computeSessionStats([], 0, 1000)
    expect(stats.wpm).toBe(0)
    expect(stats.accuracy).toBe(100)
  })

  it('tracks per-key accuracy', () => {
    const keystrokes = makeKeystrokes(
      [
        { expected: 'ש', actual: 'ש' },
        { expected: 'ש', actual: 'ד' }, // error on ש
        { expected: 'ד', actual: 'ד' },
      ],
      0,
      100,
    )
    const stats = computeSessionStats(keystrokes, 0, 300)
    expect(stats.keyAccuracy['ש']).toEqual({ correct: 1, total: 2 })
    expect(stats.keyAccuracy['ד']).toEqual({ correct: 1, total: 1 })
  })
})

describe('findWeakKeys', () => {
  it('finds keys with lowest accuracy', () => {
    const keystrokes = makeKeystrokes(
      [
        { expected: 'ש', actual: 'ש' },
        { expected: 'ש', actual: 'ש' },
        { expected: 'ש', actual: 'ש' },
        { expected: 'ד', actual: 'ג' },
        { expected: 'ד', actual: 'ג' },
        { expected: 'ד', actual: 'ד' },
      ],
      0,
      100,
    )
    const stats = computeSessionStats(keystrokes, 0, 600)
    const weak = findWeakKeys(stats)
    expect(weak[0].char).toBe('ד')
    expect(weak[0].accuracy).toBe(33)
  })
})

describe('calculateRealtimeWpm', () => {
  it('returns 0 for less than 2 keystrokes', () => {
    expect(calculateRealtimeWpm([])).toBe(0)
    expect(
      calculateRealtimeWpm([
        { expected: 'ש', actual: 'ש', isCorrect: true, timestamp: 100, code: 'KeyA' },
      ]),
    ).toBe(0)
  })
})

describe('isLessonComplete', () => {
  it('returns true when stats meet targets', () => {
    const stats = computeSessionStats(
      makeKeystrokes(
        Array.from({ length: 20 }, () => ({ expected: 'ש', actual: 'ש' })),
        0,
        100,
      ),
      0,
      2000,
    )
    expect(isLessonComplete(stats, 5, 80)).toBe(true)
  })

  it('returns false when accuracy too low', () => {
    const stats = computeSessionStats(
      makeKeystrokes(
        [
          { expected: 'ש', actual: 'ש' },
          { expected: 'ד', actual: 'ג' },
        ],
        0,
        100,
      ),
      0,
      200,
    )
    expect(isLessonComplete(stats, 1, 90)).toBe(false)
  })
})

describe('calculateXpReward', () => {
  it('gives base XP plus bonuses', () => {
    const stats = computeSessionStats(
      makeKeystrokes(
        Array.from({ length: 20 }, () => ({ expected: 'ש', actual: 'ש' })),
        0,
        100,
      ),
      0,
      2000,
    )
    const reward = calculateXpReward(stats, 5, 80, 0)
    expect(reward.base).toBe(10)
    expect(reward.total).toBeGreaterThanOrEqual(10)
    expect(reward.streakMultiplier).toBe(1)
  })

  it('increases with streak', () => {
    const stats = computeSessionStats(
      makeKeystrokes(
        Array.from({ length: 10 }, () => ({ expected: 'ש', actual: 'ש' })),
        0,
        100,
      ),
      0,
      1000,
    )
    const noStreak = calculateXpReward(stats, 5, 80, 0)
    const withStreak = calculateXpReward(stats, 5, 80, 5)
    expect(withStreak.total).toBeGreaterThan(noStreak.total)
  })
})
