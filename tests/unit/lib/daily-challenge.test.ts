import { describe, it, expect } from 'vitest'
import {
  getDailyChallenge,
  isDailyChallengeCompleted,
  getTodayDateStr,
} from '@/lib/challenges/daily-challenge'

describe('getDailyChallenge', () => {
  it('returns a challenge with all required fields', () => {
    const challenge = getDailyChallenge('2026-02-18')
    expect(challenge.id).toBe('daily-2026-02-18')
    expect(challenge.date).toBe('2026-02-18')
    expect(challenge.titleHe).toBeTruthy()
    expect(challenge.descriptionHe).toBeTruthy()
    expect(challenge.text).toBeTruthy()
    expect(challenge.xpReward).toBeGreaterThan(0)
    expect(['speed', 'accuracy', 'endurance']).toContain(challenge.type)
  })

  it('returns the same challenge for the same date', () => {
    const a = getDailyChallenge('2026-01-15')
    const b = getDailyChallenge('2026-01-15')
    expect(a).toEqual(b)
  })

  it('returns different challenges for different dates', () => {
    const a = getDailyChallenge('2026-01-15')
    const b = getDailyChallenge('2026-01-16')
    // At minimum the ID should differ
    expect(a.id).not.toBe(b.id)
  })

  it('uses today when no date provided', () => {
    const challenge = getDailyChallenge()
    const today = getTodayDateStr()
    expect(challenge.date).toBe(today)
    expect(challenge.id).toBe(`daily-${today}`)
  })

  it('speed challenge has targetWpm > 0', () => {
    // Find a speed challenge by trying different dates
    for (let i = 1; i <= 30; i++) {
      const challenge = getDailyChallenge(`2026-03-${String(i).padStart(2, '0')}`)
      if (challenge.type === 'speed') {
        expect(challenge.targetWpm).toBeGreaterThan(0)
        return
      }
    }
  })

  it('accuracy challenge has targetAccuracy > 0', () => {
    for (let i = 1; i <= 30; i++) {
      const challenge = getDailyChallenge(`2026-04-${String(i).padStart(2, '0')}`)
      if (challenge.type === 'accuracy') {
        expect(challenge.targetAccuracy).toBeGreaterThan(0)
        return
      }
    }
  })

  it('endurance challenge has targetKeystrokes > 0', () => {
    for (let i = 1; i <= 30; i++) {
      const challenge = getDailyChallenge(`2026-05-${String(i).padStart(2, '0')}`)
      if (challenge.type === 'endurance') {
        expect(challenge.targetKeystrokes).toBeGreaterThan(0)
        return
      }
    }
  })

  it('description contains the target value', () => {
    const challenge = getDailyChallenge('2026-02-18')
    // The description should contain the numeric target
    const hasNumber = /\d+/.test(challenge.descriptionHe)
    expect(hasNumber).toBe(true)
  })
})

describe('isDailyChallengeCompleted', () => {
  it('returns true when speed target met', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'speed' as const,
      targetWpm: 20,
      targetAccuracy: 70,
      targetKeystrokes: 0,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 25, accuracy: 80, totalKeystrokes: 50 }),
    ).toBe(true)
  })

  it('returns false when speed target not met', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'speed' as const,
      targetWpm: 20,
      targetAccuracy: 70,
      targetKeystrokes: 0,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 15, accuracy: 80, totalKeystrokes: 50 }),
    ).toBe(false)
  })

  it('speed challenge also requires minimum accuracy', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'speed' as const,
      targetWpm: 20,
      targetAccuracy: 70,
      targetKeystrokes: 0,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 30, accuracy: 60, totalKeystrokes: 50 }),
    ).toBe(false)
  })

  it('returns true when accuracy target met', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'accuracy' as const,
      targetWpm: 0,
      targetAccuracy: 90,
      targetKeystrokes: 0,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 10, accuracy: 95, totalKeystrokes: 50 }),
    ).toBe(true)
  })

  it('returns false when accuracy target not met', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'accuracy' as const,
      targetWpm: 0,
      targetAccuracy: 90,
      targetKeystrokes: 0,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 30, accuracy: 85, totalKeystrokes: 50 }),
    ).toBe(false)
  })

  it('returns true when endurance target met', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'endurance' as const,
      targetWpm: 0,
      targetAccuracy: 70,
      targetKeystrokes: 150,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 10, accuracy: 80, totalKeystrokes: 160 }),
    ).toBe(true)
  })

  it('returns false when endurance keystroke target not met', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'endurance' as const,
      targetWpm: 0,
      targetAccuracy: 70,
      targetKeystrokes: 150,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 30, accuracy: 90, totalKeystrokes: 100 }),
    ).toBe(false)
  })

  it('endurance also requires minimum accuracy', () => {
    const challenge = {
      ...getDailyChallenge('2026-01-01'),
      type: 'endurance' as const,
      targetWpm: 0,
      targetAccuracy: 70,
      targetKeystrokes: 150,
    }
    expect(
      isDailyChallengeCompleted(challenge, { wpm: 30, accuracy: 50, totalKeystrokes: 200 }),
    ).toBe(false)
  })
})

describe('getTodayDateStr', () => {
  it('returns date in YYYY-MM-DD format', () => {
    const dateStr = getTodayDateStr()
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
