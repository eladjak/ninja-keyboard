import { describe, it, expect } from 'vitest'
import {
  PRACTICE_TEXTS,
  getPracticeText,
  getAllPracticeTexts,
} from '@/lib/content/practice-texts'

describe('PRACTICE_TEXTS', () => {
  it('contains exactly 5 practice texts', () => {
    expect(PRACTICE_TEXTS).toHaveLength(5)
  })

  it('each text has a unique id', () => {
    const ids = PRACTICE_TEXTS.map((t) => t.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('each text has Hebrew title, English title, text, and difficulty', () => {
    for (const text of PRACTICE_TEXTS) {
      expect(text.id).toBeTruthy()
      expect(text.titleHe).toBeTruthy()
      expect(text.titleEn).toBeTruthy()
      expect(text.text.length).toBeGreaterThan(20)
      expect(['easy', 'medium', 'hard']).toContain(text.difficulty)
    }
  })

  it('all texts contain Hebrew characters', () => {
    const hebrewRegex = /[\u0590-\u05FF]/
    for (const text of PRACTICE_TEXTS) {
      expect(hebrewRegex.test(text.text)).toBe(true)
    }
  })

  it('covers all difficulty levels', () => {
    const difficulties = new Set(PRACTICE_TEXTS.map((t) => t.difficulty))
    expect(difficulties.has('easy')).toBe(true)
    expect(difficulties.has('medium')).toBe(true)
    expect(difficulties.has('hard')).toBe(true)
  })
})

describe('getPracticeText', () => {
  it('returns a text by valid ID', () => {
    const text = getPracticeText('practice-01')
    expect(text).toBeDefined()
    expect(text?.titleHe).toBe('בוקר טוב')
  })

  it('returns undefined for invalid ID', () => {
    expect(getPracticeText('nonexistent')).toBeUndefined()
  })
})

describe('getAllPracticeTexts', () => {
  it('returns all 5 texts', () => {
    const texts = getAllPracticeTexts()
    expect(texts).toHaveLength(5)
    expect(texts).toBe(PRACTICE_TEXTS)
  })
})
