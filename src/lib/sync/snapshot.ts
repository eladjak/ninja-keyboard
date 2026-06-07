/**
 * The serializable snapshot of v1-relevant single-player progress.
 *
 * This is the unit that flows between localStorage (guest), the Zustand stores,
 * and Supabase. It mirrors the persisted shapes of the v1 stores:
 *   - xp-store         -> totalXp / level / streak / lastPracticeDate / completedLessons
 *   - badge-store      -> earnedBadges
 *   - story-store      -> story (whole persisted blob)
 *   - daily-challenge  -> dailyChallenges
 * Practice-history sessions are append-only and synced separately (insert, not
 * merge), so they are not part of the merge snapshot.
 */

import type { CharacterName, StoryFlags } from '@/types/story'

export interface CompletedLessonSnapshot {
  lessonId: string
  bestWpm: number
  bestAccuracy: number
  completedAt: number
  attempts: number
}

export interface EarnedBadgeSnapshot {
  earnedAt: string
  lessonId?: string
}

interface BossResultSnapshot {
  defeated: boolean
  attempts: number
  bestAccuracy: number
}

interface SeenBeatsSnapshot {
  pre: boolean
  post: boolean
}

interface RecordedChoiceSnapshot {
  lineId: string
  choiceId: string
  characterEffect?: { character: CharacterName; delta: number }
}

/** Mirrors the persisted state of story-store.ts. */
export interface StorySnapshot {
  currentAct: 1 | 2 | 3
  unlockedCharacters: CharacterName[]
  storyFlags: StoryFlags
  seenStoryBeats: Record<number, SeenBeatsSnapshot>
  seenDialogBeats: Record<string, boolean>
  dialogChoices: Record<string, RecordedChoiceSnapshot[]>
  bossResults: Record<number, BossResultSnapshot>
  storyEnabled: boolean
}

/** Mirrors daily-challenge-store completedChallenges map. */
export type DailyChallengesSnapshot = Record<
  string,
  { completedAt: number; xpEarned: number }
>

export interface ProgressSnapshot {
  totalXp: number
  level: number
  streak: number
  lastPracticeDate: string | null
  completedLessons: Record<string, CompletedLessonSnapshot>
  earnedBadges: Record<string, EarnedBadgeSnapshot>
  story: StorySnapshot | null
  dailyChallenges: DailyChallengesSnapshot
  /** Stamp set after a guest->account merge to prevent double-merge (Step C4). */
  migratedAt?: string | null
}

/** An empty snapshot (a brand-new account with no progress). */
export function emptyProgressSnapshot(): ProgressSnapshot {
  return {
    totalXp: 0,
    level: 1,
    streak: 0,
    lastPracticeDate: null,
    completedLessons: {},
    earnedBadges: {},
    story: null,
    dailyChallenges: {},
    migratedAt: null,
  }
}

/**
 * Heuristic: does this snapshot represent real played progress (vs a fresh
 * default)? Used to decide whether a guest has anything worth merging up.
 */
export function hasProgress(s: ProgressSnapshot): boolean {
  return (
    s.totalXp > 0 ||
    Object.keys(s.completedLessons).length > 0 ||
    Object.keys(s.earnedBadges).length > 0 ||
    Object.keys(s.dailyChallenges).length > 0
  )
}
