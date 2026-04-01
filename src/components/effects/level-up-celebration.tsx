'use client'

/**
 * LevelUpCelebration — fullscreen overlay shown when a player levels up.
 *
 * Features:
 * - Big level number with Framer Motion scale-in
 * - Hebrew congratulations text
 * - CSS-only star burst ring (16 rays, transform/opacity only)
 * - Optional character image with celebration bounce animation
 * - Auto-dismiss after `autoDismissMs` (default 3000ms)
 * - Respects prefers-reduced-motion (both CSS media query and in-app store)
 * - RTL-first, CSS logical properties throughout
 * - Accessible: role="dialog", aria-live="assertive", focus-trap on dismiss button
 */

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

// ---------------------------------------------------------------------------
// Star burst config — 16 rays distributed evenly in a circle.
// Each ray is a thin rectangle. The ray host is centered on screen; each ray
// starts at the origin (left: 0, centred vertically) and flies outward via
// CSS `translate` animation, while the inline `rotate()` points it in the
// right direction. CSS-only; values are deterministic (no Math.random).
// ---------------------------------------------------------------------------

const RAY_COUNT = 16
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => ({
  id: i,
  // Evenly distributed angles; offset by 11.25° so rays don't align with axes
  angle: (360 / RAY_COUNT) * i + 11.25,
  // Width (length) varies between 40-69px
  length: 40 + ((i * 7) % 30),
  // Staggered delays 0-0.48s so they don't all fire at once
  delay: (i * 0.03).toFixed(2),
  color: i % 2 === 0 ? '#6C5CE7' : '#00B894',
}))

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 28, delay: 0.05 },
  },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.25 } },
}

const LEVEL_NUMBER_VARIANTS = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 22, delay: 0.2 },
  },
}

const CHARACTER_VARIANTS = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 20, delay: 0.35 },
  },
}

// Static (reduced-motion) variants collapse all animations to instant fades
const STATIC_VISIBLE = { opacity: 1, scale: 1 }
const STATIC_HIDDEN = { opacity: 0 }

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LevelUpCelebrationProps {
  /** The new level the player has reached */
  level: number
  /** Optional character image URL shown celebrating */
  characterImage?: string
  /** Optional character name for the alt text */
  characterName?: string
  /** Called when the overlay is dismissed (either by user or auto-timer) */
  onDismiss: () => void
  /** Whether to show the overlay at all */
  visible?: boolean
  /** Auto-dismiss timeout in ms. Set to 0 to disable. Default: 3000 */
  autoDismissMs?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LevelUpCelebration({
  level,
  characterImage,
  characterName,
  onDismiss,
  visible = true,
  autoDismissMs = 3000,
}: LevelUpCelebrationProps) {
  const reducedMotion = useReducedMotion()
  const dismissRef = useRef<HTMLButtonElement>(null)

  // Auto-dismiss
  useEffect(() => {
    if (!visible || autoDismissMs <= 0) return
    const timer = setTimeout(onDismiss, autoDismissMs)
    return () => clearTimeout(timer)
  }, [visible, autoDismissMs, onDismiss])

  // Focus dismiss button on mount for keyboard accessibility
  useEffect(() => {
    if (visible) {
      dismissRef.current?.focus()
    }
  }, [visible])

  // Resolve animation variants based on reduced-motion preference
  const overlayV = reducedMotion
    ? { hidden: STATIC_HIDDEN, visible: STATIC_VISIBLE, exit: STATIC_HIDDEN }
    : OVERLAY_VARIANTS

  const cardV = reducedMotion
    ? { hidden: STATIC_HIDDEN, visible: STATIC_VISIBLE, exit: STATIC_HIDDEN }
    : CARD_VARIANTS

  const levelNumV = reducedMotion
    ? { hidden: STATIC_HIDDEN, visible: STATIC_VISIBLE }
    : LEVEL_NUMBER_VARIANTS

  const charV = reducedMotion
    ? { hidden: STATIC_HIDDEN, visible: STATIC_VISIBLE }
    : CHARACTER_VARIANTS

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="level-up-overlay"
          className="level-up-overlay fixed inset-0 z-[200] flex items-center justify-center"
          variants={overlayV}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-label={`עלית לרמה ${level}`}
          aria-live="assertive"
          onClick={onDismiss}
        >
          {/* ── Star burst ring (CSS-only, behind the card) ── */}
          {!reducedMotion && (
            <div
              className="level-up-star-host pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              {RAYS.map((ray) => (
                <div
                  key={ray.id}
                  className="level-up-ray"
                  style={{
                    // rotate() points the ray; the CSS animation then translates it outward
                    transform: `rotate(${ray.angle}deg)`,
                    width: ray.length,
                    animationDelay: `${ray.delay}s`,
                    backgroundColor: ray.color,
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Main card ── */}
          <motion.div
            className="level-up-card relative flex flex-col items-center gap-4 rounded-2xl px-10 py-8 text-center shadow-2xl"
            variants={cardV}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Character image */}
            {characterImage && (
              <motion.div
                className="level-up-character"
                variants={charV}
                aria-hidden="true"
              >
                <Image
                  src={characterImage}
                  alt={characterName ? `${characterName} חוגג/ת` : 'דמות חוגגת'}
                  width={120}
                  height={120}
                  className={`object-contain${reducedMotion ? '' : ' level-up-character-bounce'}`}
                  priority
                />
              </motion.div>
            )}

            {/* Level number */}
            <motion.div
              className="level-up-number-wrapper"
              variants={levelNumV}
              aria-hidden="true"
            >
              <span className="level-up-number">{level}</span>
            </motion.div>

            {/* Hebrew text */}
            <p className="level-up-text text-xl font-bold">
              {/* Screen-reader gets natural sentence; visual text is split for sizing */}
              <span className="sr-only">{`כל הכבוד! הגעת לרמה ${level}`}</span>
              <span aria-hidden="true">
                <span className="level-up-congrats block text-2xl">כל הכבוד!</span>
                <span className="level-up-reached block text-lg opacity-80">
                  הגעת לרמה{' '}
                  <strong className="text-primary">{level}</strong>
                </span>
              </span>
            </p>

            {/* Dismiss button */}
            <button
              ref={dismissRef}
              type="button"
              className="level-up-dismiss mt-2 rounded-xl px-6 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onDismiss}
              aria-label="סגור חגיגת עלייה ברמה"
            >
              המשך
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
