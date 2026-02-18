import { describe, expect, it } from 'vitest'
import { getMascotReaction, getMascotTip } from '@/lib/mascot/mascot-reactions'
import type { MascotMessage } from '@/lib/mascot/mascot-reactions'

describe('getMascotReaction', () => {
  it('returns thinking mood for lesson-start', () => {
    const result = getMascotReaction('lesson-start')
    expect(result).toEqual<MascotMessage>({
      mood: 'thinking',
      text: 'בוא נתחיל! 🥷',
      duration: 3000,
    })
  })

  it('returns happy mood for correct-key', () => {
    const result = getMascotReaction('correct-key')
    expect(result.mood).toBe('happy')
    expect(result.text).toBe('יופי!')
  })

  it('returns thinking mood for error-key', () => {
    const result = getMascotReaction('error-key')
    expect(result.mood).toBe('thinking')
    expect(result.text).toBe('נסה שוב, אתה יכול!')
  })

  it('returns excited mood for streak-3', () => {
    const result = getMascotReaction('streak-3')
    expect(result.mood).toBe('excited')
    expect(result.text).toContain('שלושה ברצף')
  })

  it('returns cheering mood for streak-5', () => {
    const result = getMascotReaction('streak-5')
    expect(result.mood).toBe('cheering')
    expect(result.text).toContain('נינג\'ה אמיתי')
  })

  it('returns cheering mood for lesson-complete', () => {
    const result = getMascotReaction('lesson-complete')
    expect(result.mood).toBe('cheering')
    expect(result.text).toContain('כל הכבוד')
  })

  it('returns sad mood for lesson-fail', () => {
    const result = getMascotReaction('lesson-fail')
    expect(result.mood).toBe('sad')
    expect(result.text).toContain('ננסה שוב')
  })

  it('returns excited mood for level-up', () => {
    const result = getMascotReaction('level-up')
    expect(result.mood).toBe('excited')
    expect(result.text).toContain('עלית רמה')
  })

  it('returns cheering mood for badge-earned', () => {
    const result = getMascotReaction('badge-earned')
    expect(result.mood).toBe('cheering')
    expect(result.text).toContain('תג חדש')
  })

  it('returns sleeping mood for idle-long', () => {
    const result = getMascotReaction('idle-long')
    expect(result.mood).toBe('sleeping')
    expect(result.text).toBe('zzz...')
  })

  it('returns surprised mood for comeback', () => {
    const result = getMascotReaction('comeback')
    expect(result.mood).toBe('surprised')
    expect(result.text).toContain('חזרת')
  })

  it('returns excited mood for speed-record', () => {
    const result = getMascotReaction('speed-record')
    expect(result.mood).toBe('excited')
    expect(result.text).toContain('שיא חדש')
  })

  it('returns idle for unknown event', () => {
    const result = getMascotReaction('unknown-event')
    expect(result).toEqual<MascotMessage>({
      mood: 'idle',
      text: '',
      duration: 0,
    })
  })

  it('returns idle for empty string event', () => {
    const result = getMascotReaction('')
    expect(result.mood).toBe('idle')
  })

  it('returns positive duration for all known events', () => {
    const events = [
      'lesson-start', 'correct-key', 'error-key', 'streak-3',
      'streak-5', 'lesson-complete', 'lesson-fail', 'level-up',
      'badge-earned', 'idle-long', 'comeback', 'speed-record',
    ]
    for (const event of events) {
      const result = getMascotReaction(event)
      expect(result.duration).toBeGreaterThan(0)
    }
  })
})

describe('getMascotTip', () => {
  it('returns a string', () => {
    const tip = getMascotTip()
    expect(typeof tip).toBe('string')
    expect(tip.length).toBeGreaterThan(0)
  })

  it('returns Hebrew text', () => {
    const tip = getMascotTip()
    // Check that it contains at least one Hebrew character
    expect(tip).toMatch(/[\u0590-\u05FF]/)
  })

  it('returns varied tips (not always the same)', () => {
    const tips = new Set<string>()
    // Run 50 times to get variety (12 tips, should get multiple unique ones)
    for (let i = 0; i < 50; i++) {
      tips.add(getMascotTip())
    }
    // Should have at least 2 different tips
    expect(tips.size).toBeGreaterThanOrEqual(2)
  })
})
