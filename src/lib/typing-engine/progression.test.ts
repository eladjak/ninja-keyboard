import { describe, expect, it } from 'vitest'
import {
  CONFIDENCE_FLOOR,
  CONFIDENCE_GRACE,
  confidenceThreshold,
  isLessonUnlocked,
  lessonProgressionStatus,
  passedConfidenceGate,
  retryGuidance,
  type CompletedLessonRecord,
} from './progression'
import type { LessonDefinition } from './types'

function lesson(level: number, targetAccuracy: number): LessonDefinition {
  return {
    id: `lesson-${String(level).padStart(2, '0')}`,
    level,
    titleHe: `שיעור ${level}`,
    titleEn: `Lesson ${level}`,
    descriptionHe: 'תיאור',
    targetKeys: ['א'],
    newKeys: ['א'],
    targetWpm: 20,
    targetAccuracy,
    category: 'home-row',
  }
}

const LESSONS: LessonDefinition[] = [
  lesson(1, 90),
  lesson(2, 90),
  lesson(3, 95),
]

function rec(bestAccuracy: number, bestWpm = 25): CompletedLessonRecord {
  return { bestAccuracy, bestWpm }
}

describe('confidenceThreshold', () => {
  it('is target minus grace when above the floor', () => {
    expect(confidenceThreshold(lesson(1, 90))).toBe(90 - CONFIDENCE_GRACE)
  })

  it('never drops below the absolute floor', () => {
    expect(confidenceThreshold(lesson(1, 60))).toBe(CONFIDENCE_FLOOR)
  })
})

describe('passedConfidenceGate', () => {
  const l = lesson(1, 90) // threshold = 85
  it('passes at or above threshold', () => {
    expect(passedConfidenceGate(l, rec(85))).toBe(true)
    expect(passedConfidenceGate(l, rec(99))).toBe(true)
  })
  it('fails below threshold', () => {
    expect(passedConfidenceGate(l, rec(84))).toBe(false)
  })
  it('fails when never completed', () => {
    expect(passedConfidenceGate(l, undefined)).toBe(false)
  })
})

describe('isLessonUnlocked', () => {
  it('always unlocks level 1', () => {
    expect(isLessonUnlocked(LESSONS[0], LESSONS, {})).toBe(true)
  })

  it('keeps the next lesson locked until the previous gate is cleared', () => {
    // lesson 1 completed but only 80% (threshold 85) -> lesson 2 stays locked
    const completed = { 'lesson-01': rec(80) }
    expect(isLessonUnlocked(LESSONS[1], LESSONS, completed)).toBe(false)
  })

  it('unlocks the next lesson once the gate is cleared', () => {
    const completed = { 'lesson-01': rec(88) }
    expect(isLessonUnlocked(LESSONS[1], LESSONS, completed)).toBe(true)
  })

  it('requires the IMMEDIATELY previous lesson, not just any', () => {
    // lesson 1 cleared, lesson 2 not completed -> lesson 3 locked
    const completed = { 'lesson-01': rec(95) }
    expect(isLessonUnlocked(LESSONS[2], LESSONS, completed)).toBe(false)
  })
})

describe('lessonProgressionStatus', () => {
  it('classifies locked / available / needs-practice / mastered', () => {
    // lesson 1: never done -> available (level 1 always unlocked)
    expect(lessonProgressionStatus(LESSONS[0], LESSONS, {})).toBe('available')

    // lesson 1 done at 80% -> needs-practice (completed, below gate)
    expect(
      lessonProgressionStatus(LESSONS[0], LESSONS, { 'lesson-01': rec(80) }),
    ).toBe('needs-practice')

    // lesson 1 done at 92% -> mastered
    expect(
      lessonProgressionStatus(LESSONS[0], LESSONS, { 'lesson-01': rec(92) }),
    ).toBe('mastered')

    // lesson 2 with no progress on lesson 1 -> locked
    expect(lessonProgressionStatus(LESSONS[1], LESSONS, {})).toBe('locked')
  })
})

describe('retryGuidance', () => {
  it('returns an encouraging nudge with the exact accuracy gap', () => {
    const l = lesson(1, 90) // threshold 85
    const msg = retryGuidance(l, rec(80))
    expect(msg).not.toBeNull()
    expect(msg).toContain('5%') // 85 - 80
    expect(msg).toContain('נסה שוב')
  })

  it('returns null when the gate is already cleared', () => {
    expect(retryGuidance(lesson(1, 90), rec(95))).toBeNull()
  })

  it('returns null when the lesson was never completed', () => {
    expect(retryGuidance(lesson(1, 90), undefined)).toBeNull()
  })
})
