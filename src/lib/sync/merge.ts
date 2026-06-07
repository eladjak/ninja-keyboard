/**
 * Guest -> account merge resolver (Step C of the Phase 1 blueprint).
 *
 * Rule: max on numeric bests/totals, union on collections, server-wins-on-tie.
 * This guarantees "play as guest, then sign in keeps my progress" never clobbers
 * either side. Pure functions only — fully unit-testable, no I/O.
 */

import type { StoryFlags } from '@/types/story'
import {
  type CompletedLessonSnapshot,
  type DailyChallengesSnapshot,
  type EarnedBadgeSnapshot,
  type ProgressSnapshot,
  type StorySnapshot,
} from './snapshot'

function mergeCompletedLesson(
  a: CompletedLessonSnapshot,
  b: CompletedLessonSnapshot,
): CompletedLessonSnapshot {
  return {
    lessonId: a.lessonId,
    bestWpm: Math.max(a.bestWpm, b.bestWpm),
    bestAccuracy: Math.max(a.bestAccuracy, b.bestAccuracy),
    // Keep the latest completion timestamp.
    completedAt: Math.max(a.completedAt, b.completedAt),
    // Attempts represent two independent histories — sum them.
    attempts: a.attempts + b.attempts,
  }
}

function mergeCompletedLessons(
  local: Record<string, CompletedLessonSnapshot>,
  server: Record<string, CompletedLessonSnapshot>,
): Record<string, CompletedLessonSnapshot> {
  const out: Record<string, CompletedLessonSnapshot> = { ...server }
  for (const [lessonId, localLesson] of Object.entries(local)) {
    const serverLesson = out[lessonId]
    out[lessonId] = serverLesson
      ? mergeCompletedLesson(serverLesson, localLesson)
      : localLesson
  }
  return out
}

function mergeBadges(
  local: Record<string, EarnedBadgeSnapshot>,
  server: Record<string, EarnedBadgeSnapshot>,
): Record<string, EarnedBadgeSnapshot> {
  // Union; server wins on tie (keeps the earliest-recorded server award).
  return { ...local, ...server }
}

function mergeDailyChallenges(
  local: DailyChallengesSnapshot,
  server: DailyChallengesSnapshot,
): DailyChallengesSnapshot {
  const out: DailyChallengesSnapshot = { ...server }
  for (const [date, localEntry] of Object.entries(local)) {
    const serverEntry = out[date]
    if (!serverEntry) {
      out[date] = localEntry
    } else {
      // Both completed that day — keep the higher xp, earliest timestamp.
      out[date] = {
        completedAt: Math.min(serverEntry.completedAt, localEntry.completedAt),
        xpEarned: Math.max(serverEntry.xpEarned, localEntry.xpEarned),
      }
    }
  }
  return out
}

function mergeStoryFlags(a: StoryFlags, b: StoryFlags): StoryFlags {
  return {
    bugFirstAppearance: a.bugFirstAppearance || b.bugFirstAppearance,
    mikaJoined: a.mikaJoined || b.mikaJoined,
    senseiIntroduced: a.senseiIntroduced || b.senseiIntroduced,
    noaJoined: a.noaJoined || b.noaJoined,
    lunaJoined: a.lunaJoined || b.lunaJoined,
    glitchRevealed: a.glitchRevealed || b.glitchRevealed,
    finalBossDefeated: a.finalBossDefeated || b.finalBossDefeated,
  }
}

function mergeStory(
  local: StorySnapshot | null,
  server: StorySnapshot | null,
): StorySnapshot | null {
  if (!local) return server
  if (!server) return local

  const unlockedCharacters = Array.from(
    new Set([...server.unlockedCharacters, ...local.unlockedCharacters]),
  )

  const seenStoryBeats = { ...server.seenStoryBeats }
  for (const [k, v] of Object.entries(local.seenStoryBeats)) {
    const key = Number(k)
    const existing = seenStoryBeats[key]
    seenStoryBeats[key] = existing
      ? { pre: existing.pre || v.pre, post: existing.post || v.post }
      : v
  }

  const seenDialogBeats = { ...server.seenDialogBeats }
  for (const [k, v] of Object.entries(local.seenDialogBeats)) {
    seenDialogBeats[k] = seenDialogBeats[k] || v
  }

  // Dialog choices: union by beat id; server wins on a tie (keeps server record).
  const dialogChoices = { ...local.dialogChoices, ...server.dialogChoices }

  const bossResults = { ...server.bossResults }
  for (const [k, v] of Object.entries(local.bossResults)) {
    const key = Number(k)
    const existing = bossResults[key]
    bossResults[key] = existing
      ? {
          defeated: existing.defeated || v.defeated,
          attempts: existing.attempts + v.attempts,
          bestAccuracy: Math.max(existing.bestAccuracy, v.bestAccuracy),
        }
      : v
  }

  return {
    currentAct: Math.max(server.currentAct, local.currentAct) as 1 | 2 | 3,
    unlockedCharacters,
    storyFlags: mergeStoryFlags(server.storyFlags, local.storyFlags),
    seenStoryBeats,
    seenDialogBeats,
    dialogChoices,
    bossResults,
    // Story can be toggled off; respect a disable from either side conservatively
    // by keeping it enabled only if both enabled. Server wins where ambiguous:
    storyEnabled: server.storyEnabled && local.storyEnabled,
  }
}

/**
 * Merge a local (guest) snapshot into a server snapshot. Server-biased on ties.
 * Result is the canonical state to write back to both the stores and Supabase.
 */
export function mergeSnapshots(
  local: ProgressSnapshot,
  server: ProgressSnapshot,
): ProgressSnapshot {
  return {
    totalXp: Math.max(local.totalXp, server.totalXp),
    level: Math.max(local.level, server.level),
    streak: Math.max(local.streak, server.streak),
    lastPracticeDate: maxDateString(
      local.lastPracticeDate,
      server.lastPracticeDate,
    ),
    completedLessons: mergeCompletedLessons(
      local.completedLessons,
      server.completedLessons,
    ),
    earnedBadges: mergeBadges(local.earnedBadges, server.earnedBadges),
    story: mergeStory(local.story, server.story),
    dailyChallenges: mergeDailyChallenges(
      local.dailyChallenges,
      server.dailyChallenges,
    ),
    migratedAt: new Date().toISOString(),
  }
}

/** Returns the lexicographically-later YYYY-MM-DD string (or whichever exists). */
function maxDateString(
  a: string | null,
  b: string | null,
): string | null {
  if (a === null) return b
  if (b === null) return a
  return a >= b ? a : b
}
