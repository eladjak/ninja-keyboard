'use client'

import { useCallback, useState } from 'react'

import type { StoryPhase } from '@/types/story'
import { useStoryStore } from '@/stores/story-store'
import { getStoryBeat } from '@/lib/story/story-script'
import { SpeechBubble } from './speech-bubble'

interface StoryBeatWrapperProps {
  /** The lesson number to show story beats for */
  lessonNumber: number
  /** Whether to show pre-lesson or post-lesson beat */
  phase: StoryPhase
  /** Optional condition key for conditional beats (e.g., boss win/lose) */
  condition?: string
  /** The lesson content to render below/after the story beat */
  children: React.ReactNode
}

/**
 * Wraps lesson content with story beats.
 *
 * - Checks if the beat has already been seen
 * - If not seen, shows SpeechBubble before rendering children (pre)
 *   or after children finish (post)
 * - Marks beat as seen when dismissed
 * - If storyEnabled is false, renders only children
 */
export function StoryBeatWrapper({
  lessonNumber,
  phase,
  condition,
  children,
}: StoryBeatWrapperProps) {
  const storyEnabled = useStoryStore((s) => s.storyEnabled)
  const seenBeats = useStoryStore((s) => s.seenStoryBeats)
  const markBeatSeen = useStoryStore((s) => s.markBeatSeen)

  const alreadySeen =
    phase === 'during'
      ? false
      : (seenBeats[lessonNumber]?.[phase] ?? false)

  const [showBeat, setShowBeat] = useState(!alreadySeen && storyEnabled)

  const beat = getStoryBeat(lessonNumber, phase, condition)

  const handleDismiss = useCallback(() => {
    if (phase === 'pre' || phase === 'post') {
      markBeatSeen(lessonNumber, phase)
    }
    setShowBeat(false)
  }, [markBeatSeen, lessonNumber, phase])

  // Story disabled or no beat for this lesson/phase
  if (!storyEnabled || !beat) {
    return <>{children}</>
  }

  // Pre-phase: show beat above children, block interaction until dismissed
  if (phase === 'pre' && showBeat) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-center px-4">
          <SpeechBubble
            speaker={beat.speaker}
            text={beat.text}
            mood={beat.mood}
            duration={beat.duration}
            onDismiss={handleDismiss}
          />
        </div>
        <div className="pointer-events-none opacity-50">{children}</div>
      </div>
    )
  }

  // Post-phase: show beat below children
  if (phase === 'post' && showBeat) {
    return (
      <div className="flex flex-col gap-4">
        {children}
        <div className="flex justify-center px-4">
          <SpeechBubble
            speaker={beat.speaker}
            text={beat.text}
            mood={beat.mood}
            duration={beat.duration}
            onDismiss={handleDismiss}
          />
        </div>
      </div>
    )
  }

  // Beat already seen or dismissed
  return <>{children}</>
}
