'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings-store'
import type { Finger, Hand } from '@/lib/typing-engine/types'

interface KeyProps {
  /** Hebrew character to display */
  char: string
  /** English reference label (small, bottom-end) */
  enLabel: string
  /** Currently expected key — highlights this key */
  isActive: boolean
  /** Currently being pressed — depresses the key */
  isPressed: boolean
  /** Flash green on true, red on false, no flash on null */
  isCorrect: boolean | null
  /** Finger zone name */
  finger: Finger
  /** Which hand */
  hand: Hand
  /** Width multiplier (1 = min-w-10) */
  width?: number
  /** Finger zone colour (CSS colour value from FINGER_COLORS) */
  fingerColor: string
}

export function Key({
  char,
  enLabel,
  isActive,
  isPressed,
  isCorrect,
  finger: _finger,
  hand: _hand,
  width = 1,
  fingerColor,
}: KeyProps) {
  // Flash colour: green for correct, red for incorrect
  const flashColor =
    isCorrect === true
      ? 'rgba(34,197,94,0.85)' // green-500
      : isCorrect === false
        ? 'rgba(239,68,68,0.85)' // red-500
        : undefined

  // Per-key ripple: a transform/opacity-only pulse that fires on each press.
  // `rippleId` bumps every time the key transitions into the pressed state, so
  // rapid re-presses of the same key each spawn a fresh ripple. Reduced-motion
  // users opt out entirely.
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)
  const [rippleId, setRippleId] = useState(0)
  const wasPressedRef = useRef(false)
  useEffect(() => {
    if (isPressed && !wasPressedRef.current) {
      setRippleId((n) => n + 1)
    }
    wasPressedRef.current = isPressed
  }, [isPressed])
  const showRipple = rippleId > 0 && !reducedMotion
  // Ripple tint matches the correctness flash, else the finger zone colour.
  const rippleColor =
    isCorrect === true
      ? 'rgba(34,197,94,0.5)'
      : isCorrect === false
        ? 'rgba(239,68,68,0.5)'
        : fingerColor

  return (
    <motion.button
      type="button"
      aria-label={`מקש ${char}`}
      aria-pressed={isPressed}
      // Width: each unit ≈ 2.5rem (min-w-10 = 2.5rem)
      style={{
        minWidth: `${width * 2.5}rem`,
        backgroundColor: flashColor ?? (isActive ? fingerColor : undefined),
        transition: 'background-color 80ms ease',
      }}
      // Depress animation — scale only (transform), ≤ 100ms
      animate={{ scale: isPressed ? 0.93 : 1 }}
      transition={{ duration: 0.08, ease: 'easeOut' }}
      className={cn(
        // Base shape
        'relative h-10 rounded-lg flex items-center justify-center',
        'select-none cursor-default focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        // Shadow gives a physical key feel
        'shadow-sm border border-border',
        // Default background (overridden via style when active/flashing)
        !isActive && !flashColor && 'bg-muted',
        // Slightly bolder text when the key is active
        isActive && 'font-semibold',
      )}
    >
      {/* Hebrew character — centred, large */}
      <span className="text-base leading-none" aria-hidden="true">
        {char === ' ' ? '⎵' : char}
      </span>

      {/* English label — small, bottom-end corner, RTL-safe */}
      <span
        className="absolute bottom-0.5 end-1 text-[0.5rem] leading-none opacity-50 font-mono"
        aria-hidden="true"
      >
        {enLabel}
      </span>

      {/* Per-key ripple — scale + fade only, ≤200ms, reduced-motion-aware */}
      {showRipple && (
        <motion.span
          key={`ripple-${rippleId}`}
          data-testid="key-ripple"
          className="pointer-events-none absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: rippleColor }}
          initial={{ scale: 0.3, opacity: 0.55 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        />
      )}

      {/* Correct / incorrect flash overlay (opacity animation only) */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.span
            key={isCorrect ? 'correct' : 'incorrect'}
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              backgroundColor:
                isCorrect
                  ? 'rgba(34,197,94,0.35)'
                  : 'rgba(239,68,68,0.35)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
