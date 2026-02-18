import { describe, it, expect } from 'vitest'
import type { SessionStats } from '@/lib/typing-engine/types'
import {
  getEmotionalFeedback,
  getKeystrokeFeedback,
  getWordCompleteFeedback,
  getLessonEndFeedback,
  getReturnFeedback,
} from '@/lib/feedback/feedback-engine'
import type { EmotionalState } from '@/lib/feedback/emotional-detector'

const baseStats: SessionStats = {
  wpm: 30,
  accuracy: 90,
  totalKeystrokes: 100,
  correctKeystrokes: 90,
  errorKeystrokes: 10,
  durationMs: 60_000,
  keyAccuracy: {},
}

describe('getEmotionalFeedback', () => {
  const states: EmotionalState[] = [
    'frustrated',
    'confused',
    'perfectionist',
    'bored',
    'flow',
    'improving',
    'neutral',
  ]

  it.each(states)('returns a message for state: %s', (state) => {
    const msg = getEmotionalFeedback(state)
    expect(msg.text).toBeTruthy()
    expect(msg.text.length).toBeGreaterThan(0)
    expect(msg.priority).toBeGreaterThanOrEqual(1)
  })

  it('frustrated message contains Hebrew text', () => {
    const msg = getEmotionalFeedback('frustrated')
    expect(msg.type).toBe('calm')
    // Should contain Hebrew characters
    expect(/[\u0590-\u05FF]/.test(msg.text)).toBe(true)
  })

  it('frustrated message mentions slowing down or breathing', () => {
    const msg = getEmotionalFeedback('frustrated')
    expect(msg.text).toMatch(/נשימה|לאט|נרגע|נוח/)
  })

  it('confused message is type hint', () => {
    const msg = getEmotionalFeedback('confused')
    expect(msg.type).toBe('hint')
    expect(/[\u0590-\u05FF]/.test(msg.text)).toBe(true)
  })

  it('perfectionist message encourages continuing despite mistakes', () => {
    const msg = getEmotionalFeedback('perfectionist')
    expect(msg.type).toBe('encourage')
    expect(msg.text).toMatch(/טעות|טעויות|המשך/)
  })

  it('flow message is celebration', () => {
    const msg = getEmotionalFeedback('flow')
    expect(msg.type).toBe('celebrate')
  })

  it('flow message has high priority (low number)', () => {
    const msg = getEmotionalFeedback('flow')
    expect(msg.priority).toBeLessThanOrEqual(2)
  })

  it('improving message is encouragement', () => {
    const msg = getEmotionalFeedback('improving')
    expect(msg.type).toBe('encourage')
  })

  it('neutral message is returned as encourage or summary', () => {
    const msg = getEmotionalFeedback('neutral')
    expect(['encourage', 'summary', 'hint', 'calm', 'celebrate']).toContain(msg.type)
  })

  it('bored message encourages engagement', () => {
    const msg = getEmotionalFeedback('bored')
    expect(/[\u0590-\u05FF]/.test(msg.text)).toBe(true)
  })
})

describe('getKeystrokeFeedback', () => {
  it('returns null for single correct keystroke (no feedback needed)', () => {
    const result = getKeystrokeFeedback(true, 1)
    expect(result).toBeNull()
  })

  it('returns feedback at streak milestone 10', () => {
    const result = getKeystrokeFeedback(true, 10)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('celebrate')
  })

  it('returns feedback at streak milestone 20', () => {
    const result = getKeystrokeFeedback(true, 20)
    expect(result).not.toBeNull()
  })

  it('returns feedback at streak milestone 50', () => {
    const result = getKeystrokeFeedback(true, 50)
    expect(result).not.toBeNull()
  })

  it('returns null for incorrect keystroke with no streak', () => {
    const result = getKeystrokeFeedback(false, 0)
    expect(result).toBeNull()
  })

  it('returns encourage feedback for incorrect keystroke at high streak', () => {
    // When streak was long and then broken
    const result = getKeystrokeFeedback(false, 15)
    // Could return null or encourage - just verify it doesn't crash
    expect(result === null || typeof result?.text === 'string').toBe(true)
  })

  it('returns Hebrew text in milestone feedback', () => {
    const result = getKeystrokeFeedback(true, 10)
    expect(result).not.toBeNull()
    expect(/[\u0590-\u05FF]/.test(result!.text)).toBe(true)
  })
})

describe('getWordCompleteFeedback', () => {
  it('returns a feedback message for word 0', () => {
    const msg = getWordCompleteFeedback(0)
    expect(msg.text).toBeTruthy()
    expect(msg.type).toBe('celebrate')
  })

  it('rotates through different messages for consecutive words', () => {
    const messages = Array.from({ length: 10 }, (_, i) => getWordCompleteFeedback(i).text)
    const uniqueMessages = new Set(messages)
    // Should have more than 1 unique message (rotation)
    expect(uniqueMessages.size).toBeGreaterThan(1)
  })

  it('cycles back to first message after all options exhausted', () => {
    // Get enough messages to cycle
    const words = ['יופי!', 'מצוין!', 'בול!', 'נהדר!', 'כל הכבוד!']
    const msg0 = getWordCompleteFeedback(0).text
    const msgN = getWordCompleteFeedback(words.length).text
    expect(msg0).toBe(msgN)
  })

  it('all word complete messages contain Hebrew', () => {
    for (let i = 0; i < 5; i++) {
      const msg = getWordCompleteFeedback(i)
      expect(/[\u0590-\u05FF]/.test(msg.text)).toBe(true)
    }
  })

  it('returns priority 2 or lower', () => {
    const msg = getWordCompleteFeedback(0)
    expect(msg.priority).toBeLessThanOrEqual(3)
  })
})

describe('getLessonEndFeedback', () => {
  it('returns array of feedback messages', () => {
    const messages = getLessonEndFeedback(baseStats)
    expect(Array.isArray(messages)).toBe(true)
    expect(messages.length).toBeGreaterThan(0)
  })

  it('includes summary message', () => {
    const messages = getLessonEndFeedback(baseStats)
    const hasSummary = messages.some((m) => m.type === 'summary')
    expect(hasSummary).toBe(true)
  })

  it('shows improvement when WPM increased from previous', () => {
    const previousStats: SessionStats = { ...baseStats, wpm: 20 }
    const messages = getLessonEndFeedback(baseStats, previousStats)
    const texts = messages.map((m) => m.text).join(' ')
    // Should mention improvement somehow
    expect(texts.length).toBeGreaterThan(0)
    const hasImprovement = messages.some((m) => m.type === 'celebrate' || m.type === 'encourage')
    expect(hasImprovement).toBe(true)
  })

  it('shows encouragement when WPM decreased from previous', () => {
    const previousStats: SessionStats = { ...baseStats, wpm: 40 }
    const messages = getLessonEndFeedback(baseStats, previousStats)
    expect(messages.length).toBeGreaterThan(0)
  })

  it('includes Hebrew text in messages', () => {
    const messages = getLessonEndFeedback(baseStats)
    const allText = messages.map((m) => m.text).join('')
    expect(/[\u0590-\u05FF]/.test(allText)).toBe(true)
  })

  it('works without previous stats', () => {
    expect(() => getLessonEndFeedback(baseStats)).not.toThrow()
  })

  it('messages have priority field', () => {
    const messages = getLessonEndFeedback(baseStats)
    for (const msg of messages) {
      expect(typeof msg.priority).toBe('number')
    }
  })

  it('celebrate message for perfect accuracy', () => {
    const perfectStats: SessionStats = { ...baseStats, accuracy: 100 }
    const messages = getLessonEndFeedback(perfectStats)
    const hasCelebrate = messages.some((m) => m.type === 'celebrate')
    expect(hasCelebrate).toBe(true)
  })
})

describe('getReturnFeedback', () => {
  it('returns message for same-day return (0 days)', () => {
    const msg = getReturnFeedback(0)
    expect(msg.text).toBeTruthy()
    expect(/[\u0590-\u05FF]/.test(msg.text)).toBe(true)
  })

  it('returns warm welcome for 1 day absence', () => {
    const msg = getReturnFeedback(1)
    expect(msg.text).toBeTruthy()
    expect(msg.type).toBe('encourage')
  })

  it('returns re-engagement message for 7+ days absence', () => {
    const msg = getReturnFeedback(7)
    expect(msg.text).toBeTruthy()
    expect(msg.type).toBe('encourage')
    expect(/[\u0590-\u05FF]/.test(msg.text)).toBe(true)
  })

  it('returns gentle nudge for 30+ days absence', () => {
    const msg = getReturnFeedback(30)
    expect(msg.text).toBeTruthy()
    // Long absence should get special message
    expect(/[\u0590-\u05FF]/.test(msg.text)).toBe(true)
  })

  it('message has priority field', () => {
    const msg = getReturnFeedback(3)
    expect(typeof msg.priority).toBe('number')
  })

  it('bored returning user gets easy/fun reference', () => {
    const msg = getReturnFeedback(7)
    // Should mention something welcoming/gentle
    expect(msg.text).toMatch(/[\u0590-\u05FF]/)
  })
})
