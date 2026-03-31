'use client'

/**
 * useTrackUnlocks — evaluates which jukebox tracks the player has unlocked
 * based on their current game progress.
 *
 * Architecture:
 * - Pure evaluation functions (evaluateUnlock, getUnlockProgress) are exported
 *   for easy unit testing.
 * - The hook assembles a PlayerSnapshot from live Zustand stores and derives
 *   per-track unlock status.
 * - checkAndApplyUnlocks() is called on mount and whenever store values change,
 *   so tracks are auto-unlocked the moment the player qualifies.
 */

import { useMemo, useEffect, useRef } from 'react'
import { useXpStore } from '@/stores/xp-store'
import { useBadgeStore } from '@/stores/badge-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { useMusicStore, TRACK_UNLOCK_CONDITIONS } from '@/stores/music-store'
import type { TrackUnlockCondition } from '@/stores/music-store'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** A snapshot of the player's progress used to evaluate unlock conditions. */
export interface PlayerSnapshot {
  level: number
  totalXp: number
  completedLessonCount: number
  bestWpm: number
  earnedBadges: string[]
  wonBattles: string[]
}

/** Per-track unlock status returned by the hook. */
export interface TrackUnlockStatus {
  /** Whether the track is currently unlocked. */
  isUnlocked: boolean
  /**
   * Progress toward unlocking (0-1).
   * 1 means fully unlocked (or free).
   */
  progress: number
  /**
   * Hebrew progress label for UI, e.g. "3/10 שיעורים".
   * undefined when free or binary (badge/battle).
   */
  progressLabel?: string
}

// ---------------------------------------------------------------------------
// Pure evaluation helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Returns true if the given condition is satisfied by the player snapshot.
 */
export function evaluateUnlock(
  condition: TrackUnlockCondition,
  snapshot: PlayerSnapshot,
): boolean {
  switch (condition.type) {
    case 'free':
      return true
    case 'lessons':
      return snapshot.completedLessonCount >= Number(condition.value)
    case 'wpm':
      return snapshot.bestWpm >= Number(condition.value)
    case 'level':
      return snapshot.level >= Number(condition.value)
    case 'badge':
      return snapshot.earnedBadges.includes(String(condition.value))
    case 'battle-win':
      return snapshot.wonBattles.includes(String(condition.value))
    case 'accuracy':
      // Placeholder — accuracy unlocks are future-proof; treat as locked until
      // we have practice accuracy in the snapshot.
      return false
    default:
      return false
  }
}

/**
 * Returns a 0-1 progress fraction toward the unlock condition.
 * Free tracks return 1; binary conditions (badge, battle) return 0 or 1.
 */
export function getUnlockProgress(
  condition: TrackUnlockCondition,
  snapshot: PlayerSnapshot,
): number {
  switch (condition.type) {
    case 'free':
      return 1
    case 'lessons': {
      const required = Number(condition.value)
      if (required === 0) return 1
      return Math.min(snapshot.completedLessonCount / required, 1)
    }
    case 'wpm': {
      const required = Number(condition.value)
      if (required === 0) return 1
      return Math.min(snapshot.bestWpm / required, 1)
    }
    case 'level': {
      const required = Number(condition.value)
      if (required === 0) return 1
      return Math.min(snapshot.level / required, 1)
    }
    case 'badge':
      return snapshot.earnedBadges.includes(String(condition.value)) ? 1 : 0
    case 'battle-win':
      return snapshot.wonBattles.includes(String(condition.value)) ? 1 : 0
    case 'accuracy':
      return 0
    default:
      return 0
  }
}

/**
 * Builds a short Hebrew progress label for a numeric condition.
 * Returns undefined for binary or free conditions.
 */
function buildProgressLabel(
  condition: TrackUnlockCondition,
  snapshot: PlayerSnapshot,
): string | undefined {
  switch (condition.type) {
    case 'lessons':
      return `${Math.min(snapshot.completedLessonCount, Number(condition.value))}/${condition.value} שיעורים`
    case 'wpm':
      return `${snapshot.bestWpm}/${condition.value} WPM`
    case 'level':
      return `רמה ${snapshot.level} מתוך ${condition.value}`
    default:
      return undefined
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseTrackUnlocksReturn {
  /** Per-track unlock status, keyed by track ID. */
  trackStatus: Record<string, TrackUnlockStatus>
  /** IDs of tracks unlocked in the current render cycle (used for animation). */
  newlyUnlocked: string[]
}

/**
 * Evaluates jukebox track unlock conditions against live player state.
 * Automatically calls `unlockTrack` in the music store for newly eligible tracks.
 */
export function useTrackUnlocks(): UseTrackUnlocksReturn {
  // --- Live store values ---
  const level = useXpStore((s) => s.level)
  const completedLessons = useXpStore((s) => s.completedLessons)
  const earnedBadges = useBadgeStore((s) => s.earnedBadges)
  const bestWpm = usePracticeHistoryStore((s) => s.getBestWpm())
  const unlockedTracks = useMusicStore((s) => s.unlockedTracks)
  const unlockTrack = useMusicStore((s) => s.unlockTrack)

  // --- Build snapshot ---
  const snapshot = useMemo<PlayerSnapshot>(
    () => ({
      level,
      totalXp: 0, // not needed for current condition types
      completedLessonCount: Object.keys(completedLessons).length,
      bestWpm,
      earnedBadges: Object.keys(earnedBadges),
      // wonBattles would come from a battle store — empty for now, can be
      // wired up once the battle store exposes won opponents.
      wonBattles: [],
    }),
    [level, completedLessons, earnedBadges, bestWpm],
  )

  // --- Track newly unlocked in this render ---
  const prevUnlockedRef = useRef<Set<string>>(new Set(unlockedTracks))

  // --- Compute per-track status ---
  const trackStatus = useMemo<Record<string, TrackUnlockStatus>>(() => {
    const status: Record<string, TrackUnlockStatus> = {}

    for (const [trackId, condition] of Object.entries(TRACK_UNLOCK_CONDITIONS)) {
      const isEligible = evaluateUnlock(condition, snapshot)
      const isUnlocked = isEligible || unlockedTracks.includes(trackId)
      const progress = getUnlockProgress(condition, snapshot)
      const progressLabel = isUnlocked
        ? undefined
        : buildProgressLabel(condition, snapshot)

      status[trackId] = { isUnlocked, progress, progressLabel }
    }

    return status
  }, [snapshot, unlockedTracks])

  // --- Auto-unlock: call unlockTrack for newly eligible tracks ---
  const newlyUnlocked: string[] = []

  useEffect(() => {
    const prev = prevUnlockedRef.current
    const next: string[] = []

    for (const [trackId, condition] of Object.entries(TRACK_UNLOCK_CONDITIONS)) {
      if (prev.has(trackId)) continue
      if (evaluateUnlock(condition, snapshot)) {
        unlockTrack(trackId)
        next.push(trackId)
      }
    }

    if (next.length > 0) {
      prevUnlockedRef.current = new Set([...prev, ...next])
    }
  }, [snapshot, unlockTrack])

  return { trackStatus, newlyUnlocked }
}
