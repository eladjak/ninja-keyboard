import { describe, it, expect } from 'vitest'
import {
  generateSpeedTestText,
  getSpeedRank,
  SPEED_RANK_LABELS,
} from '@/lib/challenges/speed-test'

describe('generateSpeedTestText', () => {
  it('returns a non-empty string', () => {
    const text = generateSpeedTestText()
    expect(text.length).toBeGreaterThan(0)
  })

  it('returns text long enough for a 1-minute test', () => {
    const text = generateSpeedTestText()
    // At least 100 characters
    expect(text.length).toBeGreaterThan(100)
  })

  it('returns deterministic text with the same seed', () => {
    const a = generateSpeedTestText(42)
    const b = generateSpeedTestText(42)
    expect(a).toBe(b)
  })

  it('returns different text with different seeds', () => {
    const a = generateSpeedTestText(1)
    const b = generateSpeedTestText(2)
    expect(a).not.toBe(b)
  })

  it('contains Hebrew text', () => {
    const text = generateSpeedTestText()
    // Hebrew unicode range
    expect(/[\u0590-\u05FF]/.test(text)).toBe(true)
  })

  it('does not exceed reasonable length', () => {
    const text = generateSpeedTestText()
    // Should not be excessively long
    expect(text.length).toBeLessThan(1000)
  })
})

describe('getSpeedRank', () => {
  it('returns beginner for wpm < 15', () => {
    expect(getSpeedRank(10)).toBe('beginner')
    expect(getSpeedRank(0)).toBe('beginner')
    expect(getSpeedRank(14)).toBe('beginner')
  })

  it('returns intermediate for wpm 15-24', () => {
    expect(getSpeedRank(15)).toBe('intermediate')
    expect(getSpeedRank(20)).toBe('intermediate')
    expect(getSpeedRank(24)).toBe('intermediate')
  })

  it('returns advanced for wpm 25-34', () => {
    expect(getSpeedRank(25)).toBe('advanced')
    expect(getSpeedRank(30)).toBe('advanced')
    expect(getSpeedRank(34)).toBe('advanced')
  })

  it('returns expert for wpm 35-49', () => {
    expect(getSpeedRank(35)).toBe('expert')
    expect(getSpeedRank(40)).toBe('expert')
    expect(getSpeedRank(49)).toBe('expert')
  })

  it('returns ninja for wpm >= 50', () => {
    expect(getSpeedRank(50)).toBe('ninja')
    expect(getSpeedRank(60)).toBe('ninja')
    expect(getSpeedRank(100)).toBe('ninja')
  })
})

describe('SPEED_RANK_LABELS', () => {
  it('has labels for all ranks', () => {
    const ranks = ['beginner', 'intermediate', 'advanced', 'expert', 'ninja'] as const
    for (const rank of ranks) {
      expect(SPEED_RANK_LABELS[rank]).toBeDefined()
      expect(SPEED_RANK_LABELS[rank].he).toBeTruthy()
      expect(SPEED_RANK_LABELS[rank].emoji).toBeTruthy()
      expect(SPEED_RANK_LABELS[rank].color).toBeTruthy()
    }
  })
})
