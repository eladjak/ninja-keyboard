'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * All supported character names for idle animations.
 * Maps to CSS classes `.idle-{name}` defined in globals.css.
 */
export type IdleCharacterName =
  | 'ki'
  | 'yuki'
  | 'luna'
  | 'kai'
  | 'mika'
  | 'noa'
  | 'rex'
  | 'pixel'
  | 'sensei'
  | 'shadow'
  | 'storm'
  | 'blaze'
  | 'bug'
  | 'bugking'
  | 'glitch'
  | 'phantom'

/** Controls the speed of the idle animation loop */
export type IdleIntensity = 'subtle' | 'normal' | 'energetic'

interface CharacterIdleWrapperProps {
  /** Character name — determines which idle animation to apply */
  character: IdleCharacterName
  /** The character image or element to wrap */
  children: ReactNode
  /** Controls animation speed: subtle (50% slower), normal, energetic (50% faster) */
  intensity?: IdleIntensity
  /** Pause all animations (for accessibility or performance) */
  paused?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether to show an entry animation via Framer Motion */
  entryAnimation?: boolean
  /** Test ID for testing */
  'data-testid'?: string
}

/** CSS class name for the character-specific idle animation */
const IDLE_CLASS_MAP: Record<IdleCharacterName, string> = {
  ki: 'idle-ki',
  yuki: 'idle-yuki',
  luna: 'idle-luna',
  kai: 'idle-kai',
  mika: 'idle-mika',
  noa: 'idle-noa',
  rex: 'idle-rex',
  pixel: 'idle-pixel',
  sensei: 'idle-sensei',
  shadow: 'idle-shadow',
  storm: 'idle-storm',
  blaze: 'idle-blaze',
  bug: 'idle-bug',
  bugking: 'idle-bugking',
  glitch: 'idle-glitch',
  phantom: 'idle-phantom',
}

/** CSS class name for the intensity modifier */
const INTENSITY_CLASS_MAP: Record<IdleIntensity, string> = {
  subtle: 'idle-subtle',
  normal: '',
  energetic: 'idle-energetic',
}

/**
 * Wraps a character element with continuous idle animations.
 *
 * Uses CSS keyframes for the ongoing idle loop (GPU-accelerated,
 * transform/opacity only) and an optional Framer Motion entry animation.
 *
 * Respects `prefers-reduced-motion` — animations are disabled automatically.
 *
 * @example
 * ```tsx
 * <CharacterIdleWrapper character="yuki" intensity="energetic">
 *   <Image src="/images/characters/yuki.jpg" alt="יוקי" width={80} height={80} />
 * </CharacterIdleWrapper>
 * ```
 */
export function CharacterIdleWrapper({
  character,
  children,
  intensity = 'normal',
  paused = false,
  className,
  entryAnimation = true,
  'data-testid': testId,
}: CharacterIdleWrapperProps) {
  const idleClass = IDLE_CLASS_MAP[character]
  const intensityClass = INTENSITY_CLASS_MAP[intensity]
  const pausedClass = paused ? 'idle-paused' : ''

  const combinedClassName = cn(
    idleClass,
    intensityClass,
    pausedClass,
    'inline-flex items-center justify-center',
    className,
  )

  if (!entryAnimation) {
    return (
      <div
        className={combinedClassName}
        data-testid={testId ?? `idle-${character}`}
        data-character={character}
        data-intensity={intensity}
        data-paused={paused}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={combinedClassName}
      data-testid={testId ?? `idle-${character}`}
      data-character={character}
      data-intensity={intensity}
      data-paused={paused}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
