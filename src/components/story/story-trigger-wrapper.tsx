'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import type { DialogChoice } from '@/types/story'
import {
  useStoryTrigger,
  type StoryTriggerEvent,
} from '@/hooks/use-story-trigger'
import { StoryPlayer } from './story-player'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoryTriggerWrapperProps {
  /** The trigger event that just occurred (e.g., lesson completion) */
  event: StoryTriggerEvent | null
  /** Called after the story beat finishes playing */
  onStoryComplete?: () => void
  /** The lesson content to render */
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * StoryTriggerWrapper — Wraps around lesson content and shows the StoryPlayer
 * overlay when a dialog story beat is triggered.
 *
 * - Uses useStoryTrigger to find matching beats
 * - Renders StoryPlayer as an overlay when a beat should play
 * - Saves choices to story-store via the hook
 * - After story completes, marks beat as seen and calls onStoryComplete
 */
export function StoryTriggerWrapper({
  event,
  onStoryComplete,
  children,
}: StoryTriggerWrapperProps) {
  const { pendingBeat, completeBeat, recordChoice } = useStoryTrigger(event)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeatId, setCurrentBeatId] = useState<string | null>(null)

  // When a new beat appears and we haven't started playing it yet
  if (pendingBeat && !isPlaying && currentBeatId !== pendingBeat.id) {
    setIsPlaying(true)
    setCurrentBeatId(pendingBeat.id)
  }

  const handleComplete = useCallback(() => {
    completeBeat()
    setIsPlaying(false)
    onStoryComplete?.()
  }, [completeBeat, onStoryComplete])

  const handleChoice = useCallback(
    (lineId: string, choice: DialogChoice) => {
      recordChoice(lineId, choice)
    },
    [recordChoice],
  )

  return (
    <>
      {children}
      <AnimatePresence>
        {isPlaying && pendingBeat && (
          <StoryPlayer
            key={pendingBeat.id}
            beat={pendingBeat}
            onComplete={handleComplete}
            onChoice={handleChoice}
          />
        )}
      </AnimatePresence>
    </>
  )
}
