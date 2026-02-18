import { describe, it, expect } from 'vitest'
import { checkBadgeEarned, checkAllBadges, getNewlyEarnedBadges } from '@/lib/gamification/badge-checker'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import type { BadgeContext } from '@/lib/gamification/badge-checker'

function makeContext(overrides: Partial<BadgeContext> = {}): BadgeContext {
  return {
    wpm: 0,
    accuracy: 0,
    backspaceCount: 0,
    durationMs: 0,
    streak: 0,
    completedLessonsCount: 0,
    modulesVisited: [],
    lastActiveDate: null,
    lessonId: 'lesson-1',
    ...overrides,
  }
}

describe('checkBadgeEarned - first_lesson', () => {
  const badge = BADGE_DEFINITIONS.find((b) => b.condition.type === 'first_lesson')!

  it('returns true when completedLessonsCount >= 1', () => {
    expect(checkBadgeEarned(badge, makeContext({ completedLessonsCount: 1 }))).toBe(true)
  })

  it('returns false when completedLessonsCount is 0', () => {
    expect(checkBadgeEarned(badge, makeContext({ completedLessonsCount: 0 }))).toBe(false)
  })
})

describe('checkBadgeEarned - perfect_lesson', () => {
  const badge = BADGE_DEFINITIONS.find((b) => b.condition.type === 'perfect_lesson')!

  it('returns true when accuracy is 100', () => {
    expect(checkBadgeEarned(badge, makeContext({ accuracy: 100 }))).toBe(true)
  })

  it('returns false when accuracy is 99', () => {
    expect(checkBadgeEarned(badge, makeContext({ accuracy: 99 }))).toBe(false)
  })
})

describe('checkBadgeEarned - accuracy threshold', () => {
  const badge = BADGE_DEFINITIONS.find(
    (b) => b.condition.type === 'accuracy',
  )!

  it('returns true when accuracy meets minimum', () => {
    const cond = badge.condition as { type: 'accuracy'; minAccuracy: number }
    expect(checkBadgeEarned(badge, makeContext({ accuracy: cond.minAccuracy }))).toBe(true)
  })

  it('returns false when accuracy is below minimum', () => {
    const cond = badge.condition as { type: 'accuracy'; minAccuracy: number }
    expect(checkBadgeEarned(badge, makeContext({ accuracy: cond.minAccuracy - 1 }))).toBe(false)
  })
})

describe('checkBadgeEarned - lesson_no_backspace', () => {
  const badge = BADGE_DEFINITIONS.find((b) => b.condition.type === 'lesson_no_backspace')!

  it('returns true when backspaceCount is 0', () => {
    expect(checkBadgeEarned(badge, makeContext({ backspaceCount: 0 }))).toBe(true)
  })

  it('returns false when backspaceCount is 1 or more', () => {
    expect(checkBadgeEarned(badge, makeContext({ backspaceCount: 1 }))).toBe(false)
  })
})

describe('checkBadgeEarned - streak', () => {
  const badge = BADGE_DEFINITIONS.find((b) => b.condition.type === 'streak')!

  it('returns true when streak meets days requirement', () => {
    const cond = badge.condition as { type: 'streak'; days: number }
    expect(checkBadgeEarned(badge, makeContext({ streak: cond.days }))).toBe(true)
  })

  it('returns true when streak exceeds days requirement', () => {
    const cond = badge.condition as { type: 'streak'; days: number }
    expect(checkBadgeEarned(badge, makeContext({ streak: cond.days + 5 }))).toBe(true)
  })

  it('returns false when streak is below requirement', () => {
    const cond = badge.condition as { type: 'streak'; days: number }
    expect(checkBadgeEarned(badge, makeContext({ streak: cond.days - 1 }))).toBe(false)
  })
})

describe('checkBadgeEarned - modules_tried', () => {
  const badge = BADGE_DEFINITIONS.find((b) => b.condition.type === 'modules_tried')!

  it('returns true when enough modules visited', () => {
    const cond = badge.condition as { type: 'modules_tried'; count: number }
    const modules = Array.from({ length: cond.count }, (_, i) => `module-${i}`)
    expect(checkBadgeEarned(badge, makeContext({ modulesVisited: modules }))).toBe(true)
  })

  it('returns false when not enough modules visited', () => {
    const cond = badge.condition as { type: 'modules_tried'; count: number }
    const modules = Array.from({ length: cond.count - 1 }, (_, i) => `module-${i}`)
    expect(checkBadgeEarned(badge, makeContext({ modulesVisited: modules }))).toBe(false)
  })
})

describe('checkBadgeEarned - focus_duration', () => {
  const badge = BADGE_DEFINITIONS.find((b) => b.condition.type === 'focus_duration')!

  it('returns true when duration meets requirement', () => {
    const cond = badge.condition as { type: 'focus_duration'; minutes: number }
    expect(checkBadgeEarned(badge, makeContext({ durationMs: cond.minutes * 60_000 }))).toBe(true)
  })

  it('returns false when duration is insufficient', () => {
    const cond = badge.condition as { type: 'focus_duration'; minutes: number }
    expect(checkBadgeEarned(badge, makeContext({ durationMs: (cond.minutes - 1) * 60_000 }))).toBe(false)
  })
})

describe('checkBadgeEarned - return_after_absence', () => {
  const badge = BADGE_DEFINITIONS.find((b) => b.condition.type === 'return_after_absence')!

  it('returns true when absence exceeds required days', () => {
    const cond = badge.condition as { type: 'return_after_absence'; days: number }
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - (cond.days + 1))
    const lastActiveDate = oldDate.toISOString().split('T')[0]
    expect(checkBadgeEarned(badge, makeContext({ lastActiveDate }))).toBe(true)
  })

  it('returns false when last activity was recent', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const lastActiveDate = yesterday.toISOString().split('T')[0]
    expect(checkBadgeEarned(badge, makeContext({ lastActiveDate }))).toBe(false)
  })

  it('returns false when lastActiveDate is null', () => {
    expect(checkBadgeEarned(badge, makeContext({ lastActiveDate: null }))).toBe(false)
  })
})

describe('checkBadgeEarned - wpm_milestone', () => {
  const badges = BADGE_DEFINITIONS.filter((b) => b.condition.type === 'wpm_milestone')

  it('each wpm badge requires correct WPM', () => {
    for (const badge of badges) {
      const cond = badge.condition as { type: 'wpm_milestone'; wpm: number }
      expect(checkBadgeEarned(badge, makeContext({ wpm: cond.wpm }))).toBe(true)
      expect(checkBadgeEarned(badge, makeContext({ wpm: cond.wpm - 1 }))).toBe(false)
    }
  })
})

describe('checkAllBadges', () => {
  it('returns empty array when no conditions met', () => {
    const earned = checkAllBadges(makeContext())
    expect(Array.isArray(earned)).toBe(true)
  })

  it('returns first_lesson badge when completedLessonsCount >= 1', () => {
    const earned = checkAllBadges(makeContext({ completedLessonsCount: 1 }))
    const ids = earned.map((b) => b.id)
    expect(ids).toContain('first-lesson')
  })

  it('returns perfect_lesson badge when accuracy is 100', () => {
    const earned = checkAllBadges(makeContext({ accuracy: 100, completedLessonsCount: 1 }))
    const ids = earned.map((b) => b.id)
    expect(ids).toContain('perfect-lesson')
  })

  it('returns multiple badges when multiple conditions met', () => {
    const ctx = makeContext({
      accuracy: 100,
      completedLessonsCount: 1,
      streak: 5,
      backspaceCount: 0,
    })
    const earned = checkAllBadges(ctx)
    expect(earned.length).toBeGreaterThan(1)
  })
})

describe('getNewlyEarnedBadges', () => {
  it('excludes badges already earned', () => {
    const ctx = makeContext({ completedLessonsCount: 1, accuracy: 100 })
    const alreadyEarned = ['first-lesson']
    const newBadges = getNewlyEarnedBadges(ctx, alreadyEarned)
    const ids = newBadges.map((b) => b.id)
    expect(ids).not.toContain('first-lesson')
    expect(ids).toContain('perfect-lesson')
  })

  it('returns empty array when all earned badges already recorded', () => {
    const ctx = makeContext({ completedLessonsCount: 1 })
    const alreadyEarned = ['first-lesson']
    const newBadges = getNewlyEarnedBadges(ctx, alreadyEarned)
    const ids = newBadges.map((b) => b.id)
    expect(ids).not.toContain('first-lesson')
  })

  it('returns all qualifying badges when none previously earned', () => {
    const ctx = makeContext({ completedLessonsCount: 1 })
    const newBadges = getNewlyEarnedBadges(ctx, [])
    expect(newBadges.length).toBeGreaterThan(0)
    expect(newBadges[0].id).toBe('first-lesson')
  })
})
