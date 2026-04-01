'use client'

/**
 * CharacterLoading — Full-screen loading overlay with a random ninja character.
 * Shows a bouncing character hero image and rotating Hebrew loading messages.
 * Uses transform/opacity only for animations (project rule).
 * Respects prefers-reduced-motion via CSS media query and JS check.
 */

import { useEffect, useReducer, useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, type Variants, type TargetAndTransition } from 'framer-motion'

const DEFAULT_MESSAGES = [
  'טוען...',
  'מכין את הזירה...',
  'הנינג\'ות מתכוננות...',
  'עוד רגע...',
] as const

const HERO_CHARACTERS = [
  { key: 'ki',         label: 'קיי',        src: '/images/characters/heroes/ki-hero.jpg' },
  { key: 'yuki',      label: 'יוקי',       src: '/images/characters/heroes/yuki-hero.jpg' },
  { key: 'mika',      label: 'מיקה',       src: '/images/characters/heroes/mika-hero.jpg' },
  { key: 'rex',       label: 'רקס',        src: '/images/characters/heroes/rex-hero.jpg' },
  { key: 'luna',      label: 'לונה',       src: '/images/characters/heroes/luna-hero.jpg' },
  { key: 'sensei-zen', label: 'סנסיי זן', src: '/images/characters/heroes/sensei-zen-hero.jpg' },
] as const

/** Stable random index seeded once per component mount (SSR-safe: starts at 0, replaced on client). */
function pickRandomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

interface CharacterLoadingProps {
  /** Override the rotating default messages with a single fixed message. */
  message?: string
}

interface State {
  characterIndex: number
  messageIndex: number
  dots: string
}

type Action =
  | { type: 'TICK_MESSAGE' }
  | { type: 'TICK_DOTS' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TICK_MESSAGE':
      return { ...state, messageIndex: (state.messageIndex + 1) % DEFAULT_MESSAGES.length }
    case 'TICK_DOTS':
      return { ...state, dots: state.dots.length >= 3 ? '' : state.dots + '.' }
    default:
      return state
  }
}

export function CharacterLoading({ message }: CharacterLoadingProps) {
  const shouldReduceMotion = useReducedMotion()

  const initialCharacterIndex = useRef(pickRandomIndex(HERO_CHARACTERS.length))

  const [state, dispatch] = useReducer(reducer, {
    characterIndex: initialCharacterIndex.current,
    messageIndex: 0,
    dots: '.',
  })

  // Rotate loading message every 2s
  useEffect(() => {
    if (message) return
    const id = setInterval(() => dispatch({ type: 'TICK_MESSAGE' }), 2000)
    return () => clearInterval(id)
  }, [message])

  // Animate typing dots every 400ms
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK_DOTS' }), 400)
    return () => clearInterval(id)
  }, [])

  const character = HERO_CHARACTERS[state.characterIndex]
  const displayMessage = message ?? DEFAULT_MESSAGES[state.messageIndex]

  const bounceAnimate: TargetAndTransition = shouldReduceMotion
    ? { y: 0 }
    : {
        y: [0, -18, 0],
        transition: {
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }

  const fadeInVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
  }

  return (
    <div
      dir="rtl"
      className="character-loading-overlay"
      role="status"
      aria-live="polite"
      aria-label={`${displayMessage}${state.dots}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d0b1a',
        gap: '1.5rem',
      }}
    >
      {/* Character bounce */}
      <motion.div
        animate={bounceAnimate}
        style={{ width: 220, height: 220, position: 'relative', flexShrink: 0 }}
        aria-hidden="true"
      >
        <Image
          src={character.src}
          alt={character.label}
          fill
          sizes="220px"
          style={{ objectFit: 'contain', borderRadius: '1rem' }}
          priority
        />
      </motion.div>

      {/* Glow ring under character */}
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        aria-hidden="true"
        style={{
          width: 160,
          height: 16,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(108,92,231,0.45) 0%, transparent 70%)',
          marginTop: '-1.75rem',
          flexShrink: 0,
        }}
      />

      {/* Message + dots */}
      <motion.p
        key={displayMessage}
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        style={{
          color: '#a29bfe',
          fontSize: '1.25rem',
          fontFamily: 'Heebo, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.02em',
          margin: 0,
          textAlign: 'center',
          direction: 'rtl',
        }}
      >
        {displayMessage}
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            minWidth: '1.5ch',
            color: '#6C5CE7',
          }}
        >
          {state.dots}
        </span>
      </motion.p>

      {/* Progress bar (decorative) */}
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        aria-hidden="true"
        style={{
          width: 220,
          height: 4,
          borderRadius: 2,
          background: 'rgba(108,92,231,0.2)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  x: ['-100%', '100%'],
                  transition: {
                    duration: 1.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
          }
          style={{
            width: '60%',
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(90deg, transparent, #6C5CE7, transparent)',
          }}
        />
      </motion.div>
    </div>
  )
}
