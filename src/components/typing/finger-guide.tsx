'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getFingerForChar, FINGER_COLORS } from '@/lib/typing-engine/keyboard-layout'
import type { Finger, Hand } from '@/lib/typing-engine/types'

interface FingerGuideProps {
  /** The current expected character */
  activeChar?: string
  /** Additional CSS classes */
  className?: string
}

// Hebrew names for each finger
const FINGER_LABELS_HE: Record<Finger, string> = {
  pinky: 'זרת',
  ring: 'קמיצה',
  middle: 'אמה',
  index: 'אצבע מורה',
}

// Ordered finger positions for each hand (displayed inner → outer from centre)
const LEFT_FINGERS: Finger[] = ['index', 'middle', 'ring', 'pinky']
const RIGHT_FINGERS: Finger[] = ['index', 'middle', 'ring', 'pinky']

interface FingerCellProps {
  finger: Finger
  hand: Hand
  isActive: boolean
  activeColor: string | undefined
}

function FingerCell({ finger, hand, isActive, activeColor }: FingerCellProps) {
  const colorKey = `${hand}-${finger}` as `${Hand}-${Finger}`
  const baseColor = FINGER_COLORS[colorKey]

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center gap-1',
        !isActive && 'opacity-30',
      )}
      animate={{ opacity: isActive ? 1 : 0.3 }}
      transition={{ duration: 0.12 }}
    >
      {/* Finger "pill" */}
      <motion.div
        className="h-10 w-7 rounded-t-full rounded-b-sm border-2 border-transparent sm:h-12 sm:w-8"
        animate={{
          backgroundColor: isActive ? (activeColor ?? baseColor) : baseColor + '40',
          borderColor: isActive ? (activeColor ?? baseColor) : 'transparent',
          scale: isActive ? 1.15 : 1,
        }}
        transition={{ duration: 0.15 }}
        aria-hidden
      />
      {/* Hebrew finger label – only visible when active */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.span
            key={`${hand}-${finger}-label`}
            className="text-center text-xs font-semibold leading-tight"
            style={{ color: activeColor ?? baseColor }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {FINGER_LABELS_HE[finger]}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Shows a compact two-hand diagram highlighting which finger to use
 * for the current expected character.
 */
export function FingerGuide({ activeChar, className }: FingerGuideProps) {
  const keyDef = activeChar ? getFingerForChar(activeChar) : undefined
  const activeFinger = keyDef?.finger
  const activeHand = keyDef?.hand
  const activeColor = keyDef
    ? FINGER_COLORS[`${keyDef.hand}-${keyDef.finger}` as `${Hand}-${Finger}`]
    : undefined

  function isActive(hand: Hand, finger: Finger): boolean {
    return activeFinger === finger && activeHand === hand
  }

  return (
    <div
      className={cn('flex items-end justify-center gap-8 px-4 py-3', className)}
      aria-label="מדריך אצבעות"
      role="img"
    >
      {/* Left hand – fingers displayed right-to-left (index nearest centre) */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-row-reverse items-end gap-1.5" dir="ltr">
          {LEFT_FINGERS.map((finger) => (
            <FingerCell
              key={`left-${finger}`}
              finger={finger}
              hand="left"
              isActive={isActive('left', finger)}
              activeColor={activeColor}
            />
          ))}
        </div>
        {/* Palm base */}
        <div className="h-3 w-32 rounded-b-lg bg-muted sm:w-36" aria-hidden />
        <span className="text-xs text-muted-foreground">יד שמאל</span>
      </div>

      {/* Active key indicator in the centre */}
      <div className="flex flex-col items-center gap-1 pb-6">
        <AnimatePresence mode="wait">
          {activeChar && (
            <motion.span
              key={activeChar}
              className="flex size-10 items-center justify-center rounded-lg border-2 text-xl font-bold sm:size-12 sm:text-2xl"
              style={{
                borderColor: activeColor,
                color: activeColor,
                backgroundColor: activeColor ? activeColor + '18' : undefined,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.12 }}
              aria-label={`לחץ על: ${activeChar}`}
            >
              {activeChar === ' ' ? '␣' : activeChar}
            </motion.span>
          )}
        </AnimatePresence>
        {keyDef && (
          <span className="text-center text-xs text-muted-foreground">
            {FINGER_LABELS_HE[keyDef.finger]}
          </span>
        )}
      </div>

      {/* Right hand – fingers displayed left-to-right (index nearest centre) */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-end gap-1.5" dir="ltr">
          {RIGHT_FINGERS.map((finger) => (
            <FingerCell
              key={`right-${finger}`}
              finger={finger}
              hand="right"
              isActive={isActive('right', finger)}
              activeColor={activeColor}
            />
          ))}
        </div>
        <div className="h-3 w-32 rounded-b-lg bg-muted sm:w-36" aria-hidden />
        <span className="text-xs text-muted-foreground">יד ימין</span>
      </div>
    </div>
  )
}
