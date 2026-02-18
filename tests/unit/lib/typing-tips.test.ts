import { describe, it, expect } from 'vitest'
import {
  TYPING_TIPS,
  getTipsForLevel,
  getRandomTip,
  getTipsByCategory,
  CATEGORY_LABELS,
} from '@/lib/content/typing-tips'

describe('TYPING_TIPS', () => {
  it('has at least 10 tips', () => {
    expect(TYPING_TIPS.length).toBeGreaterThanOrEqual(10)
  })

  it('each tip has required fields', () => {
    for (const tip of TYPING_TIPS) {
      expect(tip.id).toBeTruthy()
      expect(tip.titleHe).toBeTruthy()
      expect(tip.contentHe).toBeTruthy()
      expect(['posture', 'technique', 'practice', 'mindset']).toContain(tip.category)
      expect(tip.minLevel).toBeGreaterThanOrEqual(1)
    }
  })

  it('has tips in all categories', () => {
    const categories = new Set(TYPING_TIPS.map((t) => t.category))
    expect(categories).toContain('posture')
    expect(categories).toContain('technique')
    expect(categories).toContain('practice')
    expect(categories).toContain('mindset')
  })

  it('has unique IDs', () => {
    const ids = TYPING_TIPS.map((t) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('getTipsForLevel', () => {
  it('returns tips for level 1', () => {
    const tips = getTipsForLevel(1)
    expect(tips.length).toBeGreaterThan(0)
    for (const tip of tips) {
      expect(tip.minLevel).toBeLessThanOrEqual(1)
    }
  })

  it('returns more tips for higher levels', () => {
    const level1 = getTipsForLevel(1)
    const level10 = getTipsForLevel(10)
    expect(level10.length).toBeGreaterThanOrEqual(level1.length)
  })

  it('level 20 gets all tips', () => {
    const all = getTipsForLevel(20)
    expect(all).toHaveLength(TYPING_TIPS.length)
  })
})

describe('getRandomTip', () => {
  it('returns a tip', () => {
    const tip = getRandomTip(1)
    expect(tip).toBeDefined()
    expect(tip.titleHe).toBeTruthy()
  })

  it('returns deterministic tip with same seed', () => {
    const a = getRandomTip(5, 42)
    const b = getRandomTip(5, 42)
    expect(a.id).toBe(b.id)
  })

  it('returns appropriate level tip', () => {
    const tip = getRandomTip(1, 0)
    expect(tip.minLevel).toBeLessThanOrEqual(1)
  })
})

describe('getTipsByCategory', () => {
  it('returns only tips of the specified category', () => {
    const postureTips = getTipsByCategory('posture')
    expect(postureTips.length).toBeGreaterThan(0)
    for (const tip of postureTips) {
      expect(tip.category).toBe('posture')
    }
  })

  it('returns technique tips', () => {
    const tips = getTipsByCategory('technique')
    expect(tips.length).toBeGreaterThan(0)
  })
})

describe('CATEGORY_LABELS', () => {
  it('has Hebrew labels for all categories', () => {
    expect(CATEGORY_LABELS.posture).toBeTruthy()
    expect(CATEGORY_LABELS.technique).toBeTruthy()
    expect(CATEGORY_LABELS.practice).toBeTruthy()
    expect(CATEGORY_LABELS.mindset).toBeTruthy()
  })
})
