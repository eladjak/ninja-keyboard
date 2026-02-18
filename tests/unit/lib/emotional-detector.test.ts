import { describe, it, expect } from 'vitest'
import type { Keystroke } from '@/lib/typing-engine/types'
import {
  detectEmotionalState,
  computeIndicators,
} from '@/lib/feedback/emotional-detector'
import type { EmotionalIndicators } from '@/lib/feedback/emotional-detector'

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

// Base indicators for testing
const neutralIndicators: EmotionalIndicators = {
  wpmTrend: 'stable',
  accuracyTrend: 'stable',
  backspaceRatio: 0.1,
  pauseCount: 0,
  avgPauseDuration: 0,
  streakLength: 5,
  sessionDuration: 60_000,
}

describe('detectEmotionalState', () => {
  it('returns neutral for balanced indicators', () => {
    expect(detectEmotionalState(neutralIndicators)).toBe('neutral')
  })

  it('detects frustrated: WPM rising + accuracy falling', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      wpmTrend: 'rising',
      accuracyTrend: 'falling',
    }
    expect(detectEmotionalState(indicators)).toBe('frustrated')
  })

  it('detects confused: many pauses + long average pause', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      pauseCount: 4,
      avgPauseDuration: 12_000,
    }
    expect(detectEmotionalState(indicators)).toBe('confused')
  })

  it('detects confused: exactly 3 pauses with long duration', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      pauseCount: 3,
      avgPauseDuration: 11_000,
    }
    expect(detectEmotionalState(indicators)).toBe('confused')
  })

  it('does NOT detect confused when pauses are short', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      pauseCount: 5,
      avgPauseDuration: 5_000,
    }
    expect(detectEmotionalState(indicators)).not.toBe('confused')
  })

  it('detects perfectionist: high backspace ratio', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      backspaceRatio: 0.35,
    }
    expect(detectEmotionalState(indicators)).toBe('perfectionist')
  })

  it('does NOT detect perfectionist below threshold', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      backspaceRatio: 0.29,
    }
    expect(detectEmotionalState(indicators)).not.toBe('perfectionist')
  })

  it('detects bored: WPM falling + accuracy stable + long session', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      wpmTrend: 'falling',
      accuracyTrend: 'stable',
      sessionDuration: 6 * 60_000,
    }
    expect(detectEmotionalState(indicators)).toBe('bored')
  })

  it('does NOT detect bored for short sessions', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      wpmTrend: 'falling',
      accuracyTrend: 'stable',
      sessionDuration: 3 * 60_000,
    }
    expect(detectEmotionalState(indicators)).not.toBe('bored')
  })

  it('detects flow: long streak + high accuracy', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      streakLength: 25,
      accuracyTrend: 'rising',
    }
    expect(detectEmotionalState(indicators)).toBe('flow')
  })

  it('detects flow: exactly 20 streak length', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      streakLength: 20,
    }
    expect(detectEmotionalState(indicators)).toBe('flow')
  })

  it('does NOT detect flow below streak threshold', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      streakLength: 19,
    }
    expect(detectEmotionalState(indicators)).not.toBe('flow')
  })

  it('detects improving: WPM rising + accuracy stable', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      wpmTrend: 'rising',
      accuracyTrend: 'stable',
    }
    expect(detectEmotionalState(indicators)).toBe('improving')
  })

  it('detects improving: WPM rising + accuracy rising', () => {
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      wpmTrend: 'rising',
      accuracyTrend: 'rising',
    }
    expect(detectEmotionalState(indicators)).toBe('improving')
  })

  it('prioritizes frustrated over improving (frustrated wins when accuracy falls)', () => {
    // frustrated: wpmTrend rising + accuracyTrend falling
    const indicators: EmotionalIndicators = {
      ...neutralIndicators,
      wpmTrend: 'rising',
      accuracyTrend: 'falling',
    }
    expect(detectEmotionalState(indicators)).toBe('frustrated')
  })
})

describe('computeIndicators', () => {
  it('returns stable trends for empty keystrokes', () => {
    const result = computeIndicators([], 60_000)
    expect(result.wpmTrend).toBe('stable')
    expect(result.accuracyTrend).toBe('stable')
    expect(result.backspaceRatio).toBe(0)
    expect(result.pauseCount).toBe(0)
    expect(result.streakLength).toBe(0)
    expect(result.sessionDuration).toBe(60_000)
  })

  it('computes backspace ratio correctly', () => {
    // 10 keystrokes, 3 backspaces
    const keystrokes: Keystroke[] = [
      ...makeKeystrokes(
        Array.from({ length: 7 }, () => ({ expected: 'א', actual: 'א' })),
        1000,
        200,
      ),
      ...([0, 1, 2].map((i) => ({
        expected: 'Backspace',
        actual: 'Backspace',
        isCorrect: false,
        timestamp: 3000 + i * 200,
        code: 'Backspace',
      })) as Keystroke[]),
    ]
    const result = computeIndicators(keystrokes, 10_000)
    expect(result.backspaceRatio).toBeCloseTo(0.3, 1)
  })

  it('computes streak length from end of keystrokes', () => {
    // 3 correct then 2 correct (only count trailing correct)
    const keystrokes: Keystroke[] = [
      { expected: 'א', actual: 'ב', isCorrect: false, timestamp: 1000, code: 'KeyB' },
      { expected: 'ב', actual: 'ב', isCorrect: true, timestamp: 1200, code: 'KeyB' },
      { expected: 'ג', actual: 'ג', isCorrect: true, timestamp: 1400, code: 'KeyG' },
      { expected: 'ד', actual: 'ד', isCorrect: true, timestamp: 1600, code: 'KeyD' },
    ]
    const result = computeIndicators(keystrokes, 5000)
    expect(result.streakLength).toBe(3)
  })

  it('streak is 0 when last keystroke is incorrect', () => {
    const keystrokes: Keystroke[] = [
      { expected: 'א', actual: 'א', isCorrect: true, timestamp: 1000, code: 'KeyA' },
      { expected: 'ב', actual: 'ג', isCorrect: false, timestamp: 1200, code: 'KeyG' },
    ]
    const result = computeIndicators(keystrokes, 5000)
    expect(result.streakLength).toBe(0)
  })

  it('detects pauses over 10 seconds', () => {
    const keystrokes: Keystroke[] = [
      { expected: 'א', actual: 'א', isCorrect: true, timestamp: 1000, code: 'KeyA' },
      { expected: 'ב', actual: 'ב', isCorrect: true, timestamp: 12_000, code: 'KeyB' }, // 11s pause
      { expected: 'ג', actual: 'ג', isCorrect: true, timestamp: 25_000, code: 'KeyG' }, // 13s pause
      { expected: 'ד', actual: 'ד', isCorrect: true, timestamp: 26_000, code: 'KeyD' }, // 1s - no pause
    ]
    const result = computeIndicators(keystrokes, 30_000)
    expect(result.pauseCount).toBe(2)
  })

  it('computes avg pause duration correctly', () => {
    const keystrokes: Keystroke[] = [
      { expected: 'א', actual: 'א', isCorrect: true, timestamp: 1000, code: 'KeyA' },
      { expected: 'ב', actual: 'ב', isCorrect: true, timestamp: 12_000, code: 'KeyB' }, // 11s pause
      { expected: 'ג', actual: 'ג', isCorrect: true, timestamp: 25_000, code: 'KeyG' }, // 13s pause
    ]
    const result = computeIndicators(keystrokes, 30_000)
    expect(result.avgPauseDuration).toBeCloseTo(12_000, -2)
  })

  it('computes WPM trend as rising when second half is faster', () => {
    // first half: slow keystrokes, second half: fast keystrokes
    const slow = Array.from({ length: 10 }, (_, i) => ({
      expected: 'א',
      actual: 'א',
      isCorrect: true,
      timestamp: i * 500, // 500ms apart
      code: 'KeyA',
    })) as Keystroke[]
    const fast = Array.from({ length: 10 }, (_, i) => ({
      expected: 'ב',
      actual: 'ב',
      isCorrect: true,
      timestamp: 5000 + i * 100, // 100ms apart
      code: 'KeyB',
    })) as Keystroke[]
    const result = computeIndicators([...slow, ...fast], 6000)
    expect(result.wpmTrend).toBe('rising')
  })

  it('computes accuracy trend as falling when second half has more errors', () => {
    const goodHalf: Keystroke[] = Array.from({ length: 10 }, (_, i) => ({
      expected: 'א',
      actual: 'א',
      isCorrect: true,
      timestamp: i * 200,
      code: 'KeyA',
    }))
    const badHalf: Keystroke[] = Array.from({ length: 10 }, (_, i) => ({
      expected: 'א',
      actual: 'ב',
      isCorrect: false,
      timestamp: 2000 + i * 200,
      code: 'KeyB',
    }))
    const result = computeIndicators([...goodHalf, ...badHalf], 5000)
    expect(result.accuracyTrend).toBe('falling')
  })

  it('sessionDuration is passed through', () => {
    const result = computeIndicators([], 120_000)
    expect(result.sessionDuration).toBe(120_000)
  })
})
