/**
 * Confidence-gated lesson progression (keybr / Dance-Mat style).
 *
 * Completing a lesson isn't enough to advance — the player must reach a
 * minimum *accuracy* on the previous lesson so they build muscle memory
 * before moving on. The gate is deliberately forgiving (a grace margin below
 * the lesson's own target) and the retry path is encouraging, never punishing.
 *
 * Pure & DOM-free so it is fully unit-testable.
 */

import type { LessonDefinition } from './types'

/** Minimal record of a completed lesson (subset of the xp-store shape). */
export interface CompletedLessonRecord {
  bestWpm: number
  bestAccuracy: number
}

/**
 * How far below a lesson's target accuracy still counts as "confident enough"
 * to unlock the next lesson. Keeps progression motivating rather than a wall.
 */
export const CONFIDENCE_GRACE = 5

/**
 * Absolute floor — even if a lesson has a very low target, the player must
 * clear this accuracy to advance (prevents button-mashing past lessons).
 */
export const CONFIDENCE_FLOOR = 70

/**
 * The accuracy a player must reach on `lesson` to unlock the next lesson.
 * = max(floor, lesson.targetAccuracy - grace).
 */
export function confidenceThreshold(lesson: LessonDefinition): number {
  return Math.max(CONFIDENCE_FLOOR, lesson.targetAccuracy - CONFIDENCE_GRACE)
}

/**
 * Did the player clear the confidence gate on a given completed lesson?
 * Returns false if the lesson was never completed.
 */
export function passedConfidenceGate(
  lesson: LessonDefinition,
  record: CompletedLessonRecord | undefined,
): boolean {
  if (!record) return false
  return record.bestAccuracy >= confidenceThreshold(lesson)
}

/**
 * Is `lesson` unlocked? Level 1 is always open. Higher levels require the
 * immediately-previous lesson to have *passed its confidence gate*.
 */
export function isLessonUnlocked(
  lesson: LessonDefinition,
  lessons: LessonDefinition[],
  completed: Record<string, CompletedLessonRecord>,
): boolean {
  if (lesson.level <= 1) return true
  const prev = lessons.find((l) => l.level === lesson.level - 1)
  if (!prev) return true // defensive: no previous lesson defined -> open
  return passedConfidenceGate(prev, completed[prev.id])
}

export type ProgressionStatus =
  | 'locked' // previous lesson not yet cleared
  | 'available' // unlocked, not completed
  | 'needs-practice' // completed but accuracy below the confidence gate
  | 'mastered' // completed and cleared the gate

/** Classify a lesson's progression state for UI rendering. */
export function lessonProgressionStatus(
  lesson: LessonDefinition,
  lessons: LessonDefinition[],
  completed: Record<string, CompletedLessonRecord>,
): ProgressionStatus {
  if (!isLessonUnlocked(lesson, lessons, completed)) return 'locked'
  const record = completed[lesson.id]
  if (!record) return 'available'
  return passedConfidenceGate(lesson, record) ? 'mastered' : 'needs-practice'
}

/**
 * Encouraging guidance shown when a completed lesson hasn't cleared its gate.
 * Returns null when there's nothing to nudge about.
 */
export function retryGuidance(
  lesson: LessonDefinition,
  record: CompletedLessonRecord | undefined,
): string | null {
  if (!record) return null
  if (passedConfidenceGate(lesson, record)) return null
  const target = confidenceThreshold(lesson)
  const gap = Math.max(1, Math.ceil(target - record.bestAccuracy))
  return `כמעט שם! עוד ${gap}% דיוק ותפתח את השיעור הבא. נסה שוב — אתה משתפר!`
}
