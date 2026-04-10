'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion'
import { CharacterIdleWrapper } from '@/components/characters/character-idle-wrapper'
import { computeIndicators, detectEmotionalState } from '@/lib/feedback/emotional-detector'
import type { EmotionalState } from '@/lib/feedback/emotional-detector'
import { getEmotionalFeedback } from '@/lib/feedback/feedback-engine'
import { useTypingSessionStore } from '@/stores/typing-session-store'

/** How often to re-evaluate the emotional state (ms) */
const POLL_INTERVAL_MS = 5_000

/** Maps each emotional state to an idle intensity for Ki */
const STATE_INTENSITY_MAP: Record<EmotionalState, 'subtle' | 'normal' | 'energetic'> = {
  flow: 'energetic',
  improving: 'energetic',
  bored: 'normal',
  frustrated: 'subtle',
  confused: 'subtle',
  perfectionist: 'subtle',
  neutral: 'subtle',
}

/** Ease value typed as const so Framer Motion's `Easing` union accepts it */
const EASE = 'easeInOut' as const

/**
 * Per-state Framer Motion animate props for Ki's image.
 * transform/opacity only — no width/height/top/left.
 */
const kiVariants: Record<EmotionalState, TargetAndTransition> = {
  flow: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.7, repeat: Number.POSITIVE_INFINITY, ease: EASE },
  },
  improving: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: EASE },
  },
  bored: {
    y: [0, -4, 0],
    transition: { duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: EASE },
  },
  frustrated: {
    rotate: [-3, 3, -3],
    transition: { duration: 0.5, repeat: Number.POSITIVE_INFINITY, ease: EASE },
  },
  confused: {
    rotate: [-2, 2, -2],
    transition: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: EASE },
  },
  perfectionist: {
    scale: [1, 0.97, 1],
    transition: { duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: EASE },
  },
  neutral: {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: EASE },
  },
}

export interface KiMascotFeedbackProps {
  /** Show/hide the whole mascot (e.g. only during active session) */
  visible?: boolean
  /** Additional class names for the container */
  className?: string
}

/**
 * Ki mascot feedback widget.
 *
 * Reads the typing session store every 5 seconds, runs emotional-state
 * detection on the accumulated keystrokes, then shows Ki's hero image with a
 * matching Hebrew speech bubble.
 *
 * Animations: transform/opacity only, ≤ 200ms transitions.
 */
export function KiMascotFeedback({ visible = true, className }: KiMascotFeedbackProps) {
  const keystrokes = useTypingSessionStore((s) => s.keystrokes)
  const startedAt = useTypingSessionStore((s) => s.startedAt)
  const isActive = useTypingSessionStore((s) => s.isActive)

  const [state, setState] = useState<EmotionalState>('neutral')
  const [bubbleKey, setBubbleKey] = useState(0) // force re-mount on text change
  const lastEvalRef = useRef<number>(0)

  /** Evaluate emotional state — called on mount and on each poll tick */
  const evaluate = () => {
    if (keystrokes.length === 0) return
    const sessionDuration = startedAt ? performance.now() - startedAt : 0
    const indicators = computeIndicators(keystrokes, sessionDuration)
    const detected = detectEmotionalState(indicators)
    setState((prev) => {
      if (prev !== detected) {
        setBubbleKey((k) => k + 1)
      }
      return detected
    })
  }

  // Poll every 5 seconds while the session is active
  useEffect(() => {
    if (!isActive) return

    // Run once immediately on activation
    evaluate()
    lastEvalRef.current = Date.now()

    const id = setInterval(() => {
      evaluate()
      lastEvalRef.current = Date.now()
    }, POLL_INTERVAL_MS)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, keystrokes])

  // Reset to neutral when session ends
  useEffect(() => {
    if (!isActive) {
      setState('neutral')
    }
  }, [isActive])

  const feedback = getEmotionalFeedback(state)
  const intensity = STATE_INTENSITY_MAP[state]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ki-mascot"
          className={`flex items-end gap-2 ${className ?? ''}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-live="polite"
          aria-label={`קי אומר: ${feedback.text}`}
          dir="rtl"
        >
          {/* Speech bubble — appears to the right of Ki (RTL = logical inline-end) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={bubbleKey}
              className="relative max-w-[180px] rounded-2xl rounded-ee-sm bg-white/90 px-3 py-2 shadow-sm"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              role="status"
            >
              {/* Tail pointing toward Ki (inline-end side in RTL) */}
              <span
                className="absolute -end-2 bottom-2 h-0 w-0 border-y-[6px] border-s-[8px] border-y-transparent border-s-white/90"
                aria-hidden="true"
              />
              <p className="font-['Heebo'] text-xs leading-snug text-gray-800">
                {feedback.emoji && (
                  <span className="me-1" aria-hidden="true">
                    {feedback.emoji}
                  </span>
                )}
                {feedback.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Ki avatar */}
          <CharacterIdleWrapper character="ki" intensity={intensity} entryAnimation={false}>
            <motion.div
              animate={kiVariants[state]}
              className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white/40 shadow-md"
            >
              <Image
                src="/images/characters/heroes/ki-hero.jpg"
                alt="קי"
                fill
                className="object-cover object-top"
                sizes="64px"
                priority
              />
            </motion.div>
          </CharacterIdleWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
