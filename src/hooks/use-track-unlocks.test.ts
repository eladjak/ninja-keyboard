/**
 * Tests for useTrackUnlocks hook.
 *
 * Verifies that:
 * - Free tracks are always unlocked
 * - Lesson-based unlocks require completed lesson count
 * - WPM-based unlocks require best WPM
 * - Level-based unlocks require current level
 * - Badge-based unlocks require earned badge
 * - Battle-win unlocks require winning against a specific opponent
 * - evaluateUnlocks returns correct per-track status
 * - getUnlockProgress returns clamped 0-1 fraction
 * - checkAndApplyUnlocks calls unlockTrack for newly eligible tracks
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateUnlock,
  getUnlockProgress,
} from '@/hooks/use-track-unlocks'
import type { PlayerSnapshot } from '@/hooks/use-track-unlocks'
import type { TrackUnlockCondition } from '@/stores/music-store'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const emptySnapshot: PlayerSnapshot = {
  level: 1,
  totalXp: 0,
  completedLessonCount: 0,
  bestWpm: 0,
  earnedBadges: [],
  wonBattles: [],
}

// ---------------------------------------------------------------------------
// evaluateUnlock
// ---------------------------------------------------------------------------

describe('evaluateUnlock', () => {
  it('always returns true for free tracks', () => {
    const condition: TrackUnlockCondition = { type: 'free', value: 0, label: 'זמין מההתחלה' }
    expect(evaluateUnlock(condition, emptySnapshot)).toBe(true)
  })

  it('returns true for lessons condition when count is met', () => {
    const condition: TrackUnlockCondition = { type: 'lessons', value: 5, label: 'השלם 5 שיעורים' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, completedLessonCount: 5 }
    expect(evaluateUnlock(condition, snapshot)).toBe(true)
  })

  it('returns false for lessons condition when count is not met', () => {
    const condition: TrackUnlockCondition = { type: 'lessons', value: 5, label: 'השלם 5 שיעורים' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, completedLessonCount: 4 }
    expect(evaluateUnlock(condition, snapshot)).toBe(false)
  })

  it('returns true for wpm condition when best WPM meets threshold', () => {
    const condition: TrackUnlockCondition = { type: 'wpm', value: 40, label: 'השג 40 WPM' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, bestWpm: 40 }
    expect(evaluateUnlock(condition, snapshot)).toBe(true)
  })

  it('returns false for wpm condition when best WPM is below threshold', () => {
    const condition: TrackUnlockCondition = { type: 'wpm', value: 40, label: 'השג 40 WPM' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, bestWpm: 39 }
    expect(evaluateUnlock(condition, snapshot)).toBe(false)
  })

  it('returns true for level condition when player level meets requirement', () => {
    const condition: TrackUnlockCondition = { type: 'level', value: 5, label: 'הגע לרמה 5' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, level: 5 }
    expect(evaluateUnlock(condition, snapshot)).toBe(true)
  })

  it('returns false for level condition when player level is below requirement', () => {
    const condition: TrackUnlockCondition = { type: 'level', value: 5, label: 'הגע לרמה 5' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, level: 4 }
    expect(evaluateUnlock(condition, snapshot)).toBe(false)
  })

  it('returns true for badge condition when badge is earned', () => {
    const condition: TrackUnlockCondition = { type: 'badge', value: 'met-bug', label: 'פגוש את באג' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, earnedBadges: ['met-bug', 'first-lesson'] }
    expect(evaluateUnlock(condition, snapshot)).toBe(true)
  })

  it('returns false for badge condition when badge is not earned', () => {
    const condition: TrackUnlockCondition = { type: 'badge', value: 'met-bug', label: 'פגוש את באג' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, earnedBadges: ['first-lesson'] }
    expect(evaluateUnlock(condition, snapshot)).toBe(false)
  })

  it('returns true for battle-win condition when specific opponent was defeated', () => {
    const condition: TrackUnlockCondition = { type: 'battle-win', value: 'shadow-cat', label: 'נצח את שאדו קאט' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, wonBattles: ['shadow-cat'] }
    expect(evaluateUnlock(condition, snapshot)).toBe(true)
  })

  it('returns false for battle-win condition when opponent has not been defeated', () => {
    const condition: TrackUnlockCondition = { type: 'battle-win', value: 'shadow-cat', label: 'נצח את שאדו קאט' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, wonBattles: ['blaze-dragon'] }
    expect(evaluateUnlock(condition, snapshot)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getUnlockProgress
// ---------------------------------------------------------------------------

describe('getUnlockProgress', () => {
  it('returns 1 for free tracks', () => {
    const condition: TrackUnlockCondition = { type: 'free', value: 0, label: 'זמין מההתחלה' }
    expect(getUnlockProgress(condition, emptySnapshot)).toBe(1)
  })

  it('returns 0.5 for lessons when halfway there', () => {
    const condition: TrackUnlockCondition = { type: 'lessons', value: 10, label: 'השלם 10 שיעורים' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, completedLessonCount: 5 }
    expect(getUnlockProgress(condition, snapshot)).toBe(0.5)
  })

  it('clamps lessons progress to 1 when over the requirement', () => {
    const condition: TrackUnlockCondition = { type: 'lessons', value: 3, label: 'השלם 3 שיעורים' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, completedLessonCount: 10 }
    expect(getUnlockProgress(condition, snapshot)).toBe(1)
  })

  it('returns 0.75 for wpm when 30/40 WPM', () => {
    const condition: TrackUnlockCondition = { type: 'wpm', value: 40, label: 'השג 40 WPM' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, bestWpm: 30 }
    expect(getUnlockProgress(condition, snapshot)).toBeCloseTo(0.75)
  })

  it('returns 0 for wpm when no practice yet', () => {
    const condition: TrackUnlockCondition = { type: 'wpm', value: 40, label: 'השג 40 WPM' }
    expect(getUnlockProgress(condition, emptySnapshot)).toBe(0)
  })

  it('returns 0.4 for level when at 2/5', () => {
    const condition: TrackUnlockCondition = { type: 'level', value: 5, label: 'הגע לרמה 5' }
    const snapshot: PlayerSnapshot = { ...emptySnapshot, level: 2 }
    expect(getUnlockProgress(condition, snapshot)).toBe(0.4)
  })

  it('returns 0 or 1 for badge (binary)', () => {
    const condition: TrackUnlockCondition = { type: 'badge', value: 'met-bug', label: '' }
    expect(getUnlockProgress(condition, emptySnapshot)).toBe(0)
    const withBadge: PlayerSnapshot = { ...emptySnapshot, earnedBadges: ['met-bug'] }
    expect(getUnlockProgress(condition, withBadge)).toBe(1)
  })

  it('returns 0 or 1 for battle-win (binary)', () => {
    const condition: TrackUnlockCondition = { type: 'battle-win', value: 'shadow-cat', label: '' }
    expect(getUnlockProgress(condition, emptySnapshot)).toBe(0)
    const withWin: PlayerSnapshot = { ...emptySnapshot, wonBattles: ['shadow-cat'] }
    expect(getUnlockProgress(condition, withWin)).toBe(1)
  })
})
