'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/audio/sound-manager'
import type { DialogChoice, DialogStoryBeat } from '@/types/story'
import { DialogBox } from './dialog-box'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StoryPlayerProps {
  /** The dialog story beat to play through */
  beat: DialogStoryBeat
  /** Called when the entire sequence finishes (all lines + beat.onComplete) */
  onComplete: () => void
  /** Optional: called whenever a choice is made */
  onChoice?: (lineId: string, choice: DialogChoice) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * StoryPlayer — Full-screen overlay that plays through a sequence of
 * DialogLines from a DialogStoryBeat.
 *
 * Features:
 * - Portal-rendered overlay on top of game UI
 * - Manages line index progression
 * - Handles branching via choices (nextDialogId jumps)
 * - Calls onComplete when the last line is dismissed
 * - Keyboard accessible (delegates to DialogBox)
 */
export function StoryPlayer({ beat, onComplete, onChoice }: StoryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const completedRef = useRef(false)

  // Resolve portal target (browser only)
  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  const currentLine = beat.lines[currentIndex]
  const isLastLine = currentIndex >= beat.lines.length - 1

  // Advance to the next line or finish
  const handleAdvance = useCallback(() => {
    if (isLastLine) {
      setIsVisible(false)
      return
    }
    setCurrentIndex((prev) => prev + 1)
  }, [isLastLine])

  // Handle choice selection — may jump to a specific line
  const handleChoiceSelect = useCallback(
    (choice: DialogChoice) => {
      if (currentLine) {
        onChoice?.(currentLine.id, choice)
      }

      // If the choice specifies a target line, jump to it
      if (choice.nextDialogId) {
        const targetIndex = beat.lines.findIndex(
          (l) => l.id === choice.nextDialogId,
        )
        if (targetIndex !== -1) {
          setCurrentIndex(targetIndex)
          return
        }
      }

      // Otherwise advance normally
      handleAdvance()
    },
    [currentLine, beat.lines, onChoice, handleAdvance],
  )

  // When exit animation completes, fire completion callbacks
  const handleExitComplete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    soundManager.playNavigate()
    beat.onComplete?.()
    onComplete()
  }, [beat, onComplete])

  // Guard: if beat has no lines, complete immediately
  useEffect(() => {
    if (beat.lines.length === 0) {
      onComplete()
    }
  }, [beat.lines.length, onComplete])

  if (!portalTarget || beat.lines.length === 0 || !currentLine) {
    return null
  }

  const overlay = (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-[100]',
            'flex items-end justify-center',
            'bg-black/40 backdrop-blur-sm',
            'pb-8 px-4',
          )}
          dir="rtl"
          role="presentation"
        >
          {/* The dialog box anchored to the bottom */}
          <AnimatePresence mode="wait">
            <DialogBox
              key={currentLine.id}
              line={currentLine}
              onAdvance={handleAdvance}
              onChoiceSelect={handleChoiceSelect}
              isLastLine={isLastLine}
            />
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(overlay, portalTarget)
}
