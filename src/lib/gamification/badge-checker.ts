/** Pure functions for checking badge conditions */

import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import type { BadgeDefinition, BadgeCondition } from '@/lib/gamification/badge-definitions'

export interface BadgeContext {
  /** Current session WPM */
  wpm: number
  /** Current session accuracy (0-100) */
  accuracy: number
  /** Number of backspace presses in current session */
  backspaceCount: number
  /** Session duration in milliseconds */
  durationMs: number
  /** Current daily streak */
  streak: number
  /** Total completed lessons count */
  completedLessonsCount: number
  /** List of unique module IDs visited */
  modulesVisited: string[]
  /** Date of last activity before today (YYYY-MM-DD or null) */
  lastActiveDate: string | null
  /** Current lesson ID */
  lessonId: string
}

/**
 * Returns true if the given badge condition is satisfied by the context.
 * Pure function - no side effects.
 */
export function checkBadgeEarned(
  badge: BadgeDefinition,
  context: BadgeContext,
): boolean {
  const cond: BadgeCondition = badge.condition

  switch (cond.type) {
    case 'first_lesson':
      return context.completedLessonsCount >= 1

    case 'perfect_lesson':
      return context.accuracy >= 100

    case 'accuracy':
      return context.accuracy >= cond.minAccuracy

    case 'lesson_no_backspace':
      return context.backspaceCount === 0

    case 'streak':
      return context.streak >= cond.days

    case 'modules_tried':
      return context.modulesVisited.length >= cond.count

    case 'focus_duration': {
      const requiredMs = cond.minutes * 60_000
      return context.durationMs >= requiredMs
    }

    case 'return_after_absence': {
      if (context.lastActiveDate === null) return false
      const last = new Date(context.lastActiveDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      last.setHours(0, 0, 0, 0)
      const diffMs = today.getTime() - last.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      return diffDays >= cond.days
    }

    case 'wpm_milestone':
      return context.wpm >= cond.wpm

    case 'lessons_completed':
      return context.completedLessonsCount >= cond.count

    case 'one_hand_lesson':
    case 'self_voicing_lesson':
      // These require session metadata not yet available; return false for now
      return false

    default:
      return false
  }
}

/**
 * Returns all badges from the full catalog whose conditions are met.
 */
export function checkAllBadges(context: BadgeContext): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((badge) =>
    checkBadgeEarned(badge, context),
  )
}

/**
 * Returns badges that are newly earned (conditions met and not in alreadyEarned list).
 */
export function getNewlyEarnedBadges(
  context: BadgeContext,
  alreadyEarned: string[],
): BadgeDefinition[] {
  const alreadySet = new Set(alreadyEarned)
  return checkAllBadges(context).filter((badge) => !alreadySet.has(badge.id))
}
