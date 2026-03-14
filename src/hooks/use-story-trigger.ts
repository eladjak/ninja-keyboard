'use client'

import { useMemo } from 'react'

import { CHAPTER_1_BEATS } from '@/data/story/chapter-1'
import { CHAPTER_2_BEATS } from '@/data/story/chapter-2'
import { CHAPTER_3_BEATS } from '@/data/story/chapter-3'
import { CHAPTER_4_BEATS } from '@/data/story/chapter-4'
import { CHAPTER_5_BEATS } from '@/data/story/chapter-5'
import { CHAPTER_6_BEATS } from '@/data/story/chapter-6'
import { useStoryStore } from '@/stores/story-store'
import type { DialogChoice, DialogStoryBeat, StoryTrigger } from '@/types/story'

// ---------------------------------------------------------------------------
// All beats from all chapters, collected once
// ---------------------------------------------------------------------------

const ALL_BEATS: DialogStoryBeat[] = [
  ...CHAPTER_1_BEATS,
  ...CHAPTER_2_BEATS,
  ...CHAPTER_3_BEATS,
  ...CHAPTER_4_BEATS,
  ...CHAPTER_5_BEATS,
  ...CHAPTER_6_BEATS,
]

// ---------------------------------------------------------------------------
// Trigger matching
// ---------------------------------------------------------------------------

function triggerMatchesEvent(
  trigger: StoryTrigger,
  event: StoryTriggerEvent,
): boolean {
  switch (trigger.type) {
    case 'lesson-complete':
      return (
        event.type === 'lesson-complete' &&
        event.lessonId === trigger.lessonId
      )
    case 'wpm-milestone':
      return event.type === 'wpm-milestone' && event.wpm >= trigger.wpm
    case 'badge-earned':
      return (
        event.type === 'badge-earned' && event.badgeId === trigger.badgeId
      )
    case 'battle-result':
      return (
        event.type === 'battle-result' && event.result === trigger.result
      )
    case 'streak':
      return event.type === 'streak' && event.days >= trigger.days
    case 'manual':
      return false // manual beats are never auto-triggered
    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type StoryTriggerEvent =
  | { type: 'lesson-complete'; lessonId: string }
  | { type: 'wpm-milestone'; wpm: number }
  | { type: 'badge-earned'; badgeId: string }
  | { type: 'battle-result'; result: 'win' | 'lose' }
  | { type: 'streak'; days: number }

interface UseStoryTriggerResult {
  /** The beat that should be played now, or null if nothing to show */
  pendingBeat: DialogStoryBeat | null
  /** Call this after the StoryPlayer finishes to mark the beat as seen */
  completeBeat: () => void
  /** Record a choice the player made during the beat */
  recordChoice: (lineId: string, choice: DialogChoice) => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Checks if a story beat should trigger based on a game event.
 *
 * - Imports all chapter data (chapters 1-3)
 * - Checks story-store for already-seen dialog beats
 * - When a trigger matches, returns the beat to play
 * - Provides completeBeat to mark it as seen after playback
 *
 * @param event - The game event that just occurred, or null if nothing happened
 */
export function useStoryTrigger(
  event: StoryTriggerEvent | null,
): UseStoryTriggerResult {
  const storyEnabled = useStoryStore((s) => s.storyEnabled)
  const seenDialogBeats = useStoryStore((s) => s.seenDialogBeats)
  const markDialogBeatSeen = useStoryStore((s) => s.markDialogBeatSeen)
  const recordDialogChoice = useStoryStore((s) => s.recordDialogChoice)

  const pendingBeat = useMemo(() => {
    if (!storyEnabled || !event) return null

    for (const beat of ALL_BEATS) {
      if (seenDialogBeats[beat.id]) continue
      if (triggerMatchesEvent(beat.trigger, event)) {
        return beat
      }
    }

    return null
  }, [storyEnabled, event, seenDialogBeats])

  const completeBeat = () => {
    if (pendingBeat) {
      markDialogBeatSeen(pendingBeat.id)
    }
  }

  const recordChoice = (lineId: string, choice: DialogChoice) => {
    if (pendingBeat) {
      recordDialogChoice(pendingBeat.id, lineId, choice)
    }
  }

  return { pendingBeat, completeBeat, recordChoice }
}

/** Get all beats grouped by chapter */
export function getAllChapterBeats(): {
  chapter: number
  titleHe: string
  beats: DialogStoryBeat[]
}[] {
  return [
    { chapter: 1, titleHe: 'הקריאה', beats: CHAPTER_1_BEATS },
    { chapter: 2, titleHe: 'צעדים ראשונים', beats: CHAPTER_2_BEATS },
    { chapter: 3, titleHe: 'הסערה מתקרבת', beats: CHAPTER_3_BEATS },
    { chapter: 4, titleHe: 'מעבר לדוג\'ו', beats: CHAPTER_4_BEATS },
    { chapter: 5, titleHe: 'הטורניר', beats: CHAPTER_5_BEATS },
    { chapter: 6, titleHe: 'המלחמה הגדולה', beats: CHAPTER_6_BEATS },
  ]
}
