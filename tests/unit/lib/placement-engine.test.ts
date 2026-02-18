import { describe, it, expect } from 'vitest'
import {
  determineLevel,
  calculateFingerTechnique,
  computePlacementResult,
  getRecommendedLesson,
} from '@/lib/placement/placement-engine'
import type { Keystroke } from '@/lib/typing-engine/types'

// ── determineLevel ───────────────────────────────────────────────

describe('determineLevel', () => {
  it('returns "shatil" when WPM is 0', () => {
    expect(determineLevel(0)).toBe('shatil')
  })

  it('returns "shatil" when WPM is 4 (< 5)', () => {
    expect(determineLevel(4)).toBe('shatil')
  })

  it('returns "nevet" when WPM is exactly 5', () => {
    expect(determineLevel(5)).toBe('nevet')
  })

  it('returns "nevet" when WPM is 10', () => {
    expect(determineLevel(10)).toBe('nevet')
  })

  it('returns "nevet" when WPM is 14 (< 15)', () => {
    expect(determineLevel(14)).toBe('nevet')
  })

  it('returns "geza" when WPM is exactly 15', () => {
    expect(determineLevel(15)).toBe('geza')
  })

  it('returns "geza" when WPM is 25', () => {
    expect(determineLevel(25)).toBe('geza')
  })

  it('returns "geza" when WPM is 29 (< 30)', () => {
    expect(determineLevel(29)).toBe('geza')
  })

  it('returns "anaf" when WPM is exactly 30', () => {
    expect(determineLevel(30)).toBe('anaf')
  })

  it('returns "anaf" when WPM is 45', () => {
    expect(determineLevel(45)).toBe('anaf')
  })

  it('returns "tzameret" when WPM is 60 (> 50)', () => {
    expect(determineLevel(60)).toBe('tzameret')
  })
})

// ── calculateFingerTechnique ─────────────────────────────────────

function makeKeystroke(
  expected: string,
  code: string,
  isCorrect = true,
): Keystroke {
  return {
    expected,
    actual: isCorrect ? expected : '?',
    timestamp: 0,
    isCorrect,
    code,
  }
}

describe('calculateFingerTechnique', () => {
  it('returns "none" for empty keystrokes', () => {
    expect(calculateFingerTechnique([])).toBe('none')
  })

  it('returns "full" when all keystrokes use the correct finger (home row)', () => {
    // ש=KeyA (pinky-left), ד=KeyS (ring-left), ג=KeyD (middle-left)
    const keystrokes = [
      makeKeystroke('ש', 'KeyA'),
      makeKeystroke('ד', 'KeyS'),
      makeKeystroke('ג', 'KeyD'),
      makeKeystroke('כ', 'KeyF'),
    ]
    expect(calculateFingerTechnique(keystrokes)).toBe('full')
  })

  it('returns "none" when wrong codes are used for all characters', () => {
    // ש should be KeyA but using KeyZ instead
    const keystrokes = [
      makeKeystroke('ש', 'KeyZ'),
      makeKeystroke('ד', 'KeyZ'),
      makeKeystroke('ג', 'KeyZ'),
    ]
    expect(calculateFingerTechnique(keystrokes)).toBe('none')
  })

  it('returns "partial" when about half use correct finger', () => {
    const correctKeystrokes = [
      makeKeystroke('ש', 'KeyA'),
      makeKeystroke('ד', 'KeyS'),
    ]
    const wrongKeystrokes = [
      makeKeystroke('ג', 'KeyZ'), // wrong code
      makeKeystroke('כ', 'KeyZ'), // wrong code
    ]
    expect(calculateFingerTechnique([...correctKeystrokes, ...wrongKeystrokes])).toBe('partial')
  })
})

// ── computePlacementResult ───────────────────────────────────────

describe('computePlacementResult', () => {
  it('produces a complete result with all fields', () => {
    const stage1 = {
      keystrokes: [makeKeystroke('ש', 'KeyA'), makeKeystroke('ד', 'KeyS')],
      durationMs: 30_000,
    }
    const stage2 = { knownKeys: ['א', 'ב', 'ג', 'ד'] }
    const stage3 = { knownShortcuts: [] }

    const result = computePlacementResult(stage1, stage2, stage3)

    expect(result).toMatchObject({
      wpm: expect.any(Number),
      accuracy: expect.any(Number),
      knownKeys: ['א', 'ב', 'ג', 'ד'],
      knownShortcuts: [],
      fingerTechnique: expect.stringMatching(/^(none|partial|full)$/),
      level: expect.stringMatching(/^(shatil|nevet|geza|anaf|tzameret)$/),
      recommendedLesson: expect.any(Number),
    })
  })

  it('assigns "shatil" level when WPM is very low', () => {
    const stage1 = {
      // only 2 keystrokes in 30 seconds → very low WPM
      keystrokes: [makeKeystroke('ש', 'KeyA'), makeKeystroke('ד', 'KeyS')],
      durationMs: 30_000,
    }
    const stage2 = { knownKeys: [] }
    const stage3 = { knownShortcuts: [] }

    const result = computePlacementResult(stage1, stage2, stage3)
    expect(result.level).toBe('shatil')
  })
})

// ── getRecommendedLesson ─────────────────────────────────────────

describe('getRecommendedLesson', () => {
  function makeResult(
    level: 'shatil' | 'nevet' | 'geza' | 'anaf' | 'tzameret',
    wpm: number,
    knownKeys: string[] = [],
  ) {
    return {
      level,
      wpm,
      accuracy: 90,
      knownKeys,
      knownShortcuts: [] as string[],
      fingerTechnique: 'partial' as const,
      recommendedLesson: 1,
    }
  }

  it('returns lesson 1 for shatil level', () => {
    expect(getRecommendedLesson(makeResult('shatil', 2))).toBe(1)
  })

  it('returns lesson >= 3 for nevet level', () => {
    expect(getRecommendedLesson(makeResult('nevet', 8))).toBeGreaterThanOrEqual(3)
  })

  it('returns lesson >= 6 for geza level', () => {
    expect(getRecommendedLesson(makeResult('geza', 20))).toBeGreaterThanOrEqual(6)
  })

  it('returns lesson >= 11 for anaf level', () => {
    expect(getRecommendedLesson(makeResult('anaf', 35))).toBeGreaterThanOrEqual(11)
  })

  it('returns lesson >= 16 for tzameret level', () => {
    expect(getRecommendedLesson(makeResult('tzameret', 55))).toBeGreaterThanOrEqual(16)
  })

  it('returns lesson within 1-20 range for all levels', () => {
    const levels = ['shatil', 'nevet', 'geza', 'anaf', 'tzameret'] as const
    for (const level of levels) {
      const lesson = getRecommendedLesson(makeResult(level, 10))
      expect(lesson).toBeGreaterThanOrEqual(1)
      expect(lesson).toBeLessThanOrEqual(20)
    }
  })
})
