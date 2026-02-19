import { describe, it, expect } from 'vitest'
import {
  WARMUP_EXERCISES,
  getRandomWarmup,
  getWarmupByFocus,
  getDailyWarmup,
  FOCUS_LABELS,
} from '@/lib/warmup/typing-warmup'

describe('WARMUP_EXERCISES', () => {
  it('has at least 5 exercises', () => {
    expect(WARMUP_EXERCISES.length).toBeGreaterThanOrEqual(5)
  })

  it('each exercise has required fields', () => {
    for (const exercise of WARMUP_EXERCISES) {
      expect(exercise.id).toBeTruthy()
      expect(exercise.nameHe).toBeTruthy()
      expect(exercise.text.length).toBeGreaterThan(0)
      expect(exercise.focus).toBeTruthy()
    }
  })

  it('has unique IDs', () => {
    const ids = WARMUP_EXERCISES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all focus areas', () => {
    const focuses = new Set(WARMUP_EXERCISES.map((e) => e.focus))
    expect(focuses.has('home-row')).toBe(true)
    expect(focuses.has('top-row')).toBe(true)
    expect(focuses.has('bottom-row')).toBe(true)
    expect(focuses.has('common-words')).toBe(true)
    expect(focuses.has('mixed')).toBe(true)
  })
})

describe('getRandomWarmup', () => {
  it('returns an exercise', () => {
    const warmup = getRandomWarmup()
    expect(warmup).toBeDefined()
    expect(warmup.id).toBeTruthy()
    expect(warmup.text.length).toBeGreaterThan(0)
  })

  it('returns different exercises over multiple calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => getRandomWarmup().id))
    expect(ids.size).toBeGreaterThan(1)
  })
})

describe('getWarmupByFocus', () => {
  it('returns exercises for home-row', () => {
    const exercises = getWarmupByFocus('home-row')
    expect(exercises.length).toBeGreaterThan(0)
    expect(exercises.every((e) => e.focus === 'home-row')).toBe(true)
  })

  it('returns exercises for common-words', () => {
    const exercises = getWarmupByFocus('common-words')
    expect(exercises.length).toBeGreaterThan(0)
    expect(exercises.every((e) => e.focus === 'common-words')).toBe(true)
  })

  it('returns empty for nonexistent focus', () => {
    const exercises = getWarmupByFocus('nonexistent' as never)
    expect(exercises).toHaveLength(0)
  })
})

describe('getDailyWarmup', () => {
  it('returns a valid exercise', () => {
    const warmup = getDailyWarmup()
    expect(warmup).toBeDefined()
    expect(warmup.id).toBeTruthy()
    expect(WARMUP_EXERCISES.some((e) => e.id === warmup.id)).toBe(true)
  })

  it('returns same exercise for same day', () => {
    const first = getDailyWarmup()
    const second = getDailyWarmup()
    expect(first.id).toBe(second.id)
  })
})

describe('FOCUS_LABELS', () => {
  it('has Hebrew labels for all focuses', () => {
    expect(FOCUS_LABELS['home-row']).toBeTruthy()
    expect(FOCUS_LABELS['top-row']).toBeTruthy()
    expect(FOCUS_LABELS['bottom-row']).toBeTruthy()
    expect(FOCUS_LABELS['common-words']).toBeTruthy()
    expect(FOCUS_LABELS.mixed).toBeTruthy()
  })
})
