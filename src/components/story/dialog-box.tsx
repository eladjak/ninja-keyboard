'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, type Transition } from 'framer-motion'

import { cn } from '@/lib/utils'
import {
  CHARACTER_CONFIGS,
  isHeroCharacter,
} from '@/lib/story/character-config'
import { soundManager } from '@/lib/audio/sound-manager'
import type {
  CharacterName,
  DialogChoice,
  DialogLine,
  DialogType,
} from '@/types/story'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Typewriter speed: ms per Hebrew character */
const CHAR_DELAY_MS = 28

/** Minimum ms between keyClick sounds during typewriter */
const SOUND_THROTTLE_MS = 60

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Blinking cursor shown during typewriter effect */
function TypewriterCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      className="inline-block h-4 w-0.5 bg-white/60"
      style={{ verticalAlign: 'middle', marginInlineStart: '2px' }}
      aria-hidden="true"
    />
  )
}

/** Character portrait with idle animation */
function CharacterPortrait({
  character,
  glowColor,
}: {
  character: CharacterName
  glowColor: string
}) {
  const config = CHARACTER_CONFIGS[character]

  return (
    <motion.div
      animate={{
        y: config.idleAnimation.y,
        rotate: config.idleAnimation.rotate,
      }}
      transition={config.idleAnimation.transition as Transition}
      className="shrink-0"
    >
      <div
        className="relative h-14 w-14 overflow-hidden rounded-full border-2"
        style={{ borderColor: glowColor }}
      >
        <Image
          src={config.image}
          alt={config.nameHe}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
    </motion.div>
  )
}

/** Choice buttons rendered below dialog text */
function ChoiceButtons({
  choices,
  onSelect,
}: {
  choices: DialogChoice[]
  onSelect: (choice: DialogChoice) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mt-3 flex flex-col gap-2"
      role="group"
      aria-label="בחירות"
    >
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice)}
          className={cn(
            'rounded-xl px-4 py-2 text-start text-sm font-medium',
            'bg-white/10 text-white/90 backdrop-blur-sm',
            'border border-white/10',
            'transition-colors duration-150',
            'hover:bg-white/20 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--game-accent-purple)]/50',
          )}
        >
          {choice.text}
        </button>
      ))}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Cinematic bars for narration mode
// ---------------------------------------------------------------------------

function CinematicBars({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-x-0 top-0 z-40 h-16 origin-top bg-black/80"
            aria-hidden="true"
          />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-16 origin-bottom bg-black/80"
            aria-hidden="true"
          />
        </>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DialogBoxProps {
  /** The dialog line to display */
  line: DialogLine
  /** Called when the player wants to advance to the next line */
  onAdvance: () => void
  /** Called when a choice is selected */
  onChoiceSelect?: (choice: DialogChoice) => void
  /** Whether the entire sequence is at its last line */
  isLastLine?: boolean
}

// ---------------------------------------------------------------------------
// Style helpers per DialogType
// ---------------------------------------------------------------------------

function getContainerClasses(type: DialogType): string {
  switch (type) {
    case 'thought':
      return cn(
        'rounded-3xl border border-white/5',
        'bg-black/40 backdrop-blur-lg',
      )
    case 'narration':
      return cn(
        'rounded-none border-y border-white/10',
        'bg-black/70 backdrop-blur-md',
      )
    case 'monologue':
      return cn(
        'rounded-2xl border border-white/10',
        'bg-black/80 backdrop-blur-md',
      )
    case 'dialog':
    default:
      return cn(
        'rounded-2xl border border-white/10',
        'bg-black/60 backdrop-blur-md',
      )
  }
}

function getTextClasses(type: DialogType): string {
  switch (type) {
    case 'thought':
      return 'italic text-white/70'
    case 'narration':
      return 'text-center text-white/80'
    case 'monologue':
      return 'text-white/90'
    case 'dialog':
    default:
      return 'text-white/90'
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * DialogBox — Renders a single dialog line with typewriter effect,
 * character portrait, and interactive choices.
 *
 * Supports four dialog types: dialog, thought, narration, monologue.
 * Keyboard accessible: Enter/Space to advance, Escape to skip typewriter.
 */
export function DialogBox({
  line,
  onAdvance,
  onChoiceSelect,
  isLastLine = false,
}: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTypewriterDone, setIsTypewriterDone] = useState(false)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const charIndexRef = useRef(0)
  const lastSoundTimeRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const config = CHARACTER_CONFIGS[line.character]
  const isHero = isHeroCharacter(line.character)
  const isNarration = line.type === 'narration'
  const hasChoices = (line.choices?.length ?? 0) > 0

  // Reset state when line changes
  useEffect(() => {
    charIndexRef.current = 0
    lastSoundTimeRef.current = 0
    setDisplayedText('')
    setIsTypewriterDone(false)
  }, [line.id])

  // Focus the container for keyboard events
  useEffect(() => {
    containerRef.current?.focus()
  }, [line.id])

  // Typewriter effect
  useEffect(() => {
    if (isTypewriterDone) return

    typewriterRef.current = setInterval(() => {
      charIndexRef.current += 1
      const nextText = line.text.slice(0, charIndexRef.current)
      setDisplayedText(nextText)

      // Throttled typing sound
      const now = Date.now()
      if (now - lastSoundTimeRef.current > SOUND_THROTTLE_MS) {
        soundManager.playKeyClick()
        lastSoundTimeRef.current = now
      }

      if (charIndexRef.current >= line.text.length) {
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current)
          typewriterRef.current = null
        }
        setIsTypewriterDone(true)
      }
    }, CHAR_DELAY_MS)

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current)
        typewriterRef.current = null
      }
    }
  }, [line.text, line.id, isTypewriterDone])

  // Auto-advance when duration is set and typewriter is done
  useEffect(() => {
    if (!isTypewriterDone || !line.duration || hasChoices) return

    const timer = setTimeout(() => {
      onAdvance()
    }, line.duration)

    return () => clearTimeout(timer)
  }, [isTypewriterDone, line.duration, hasChoices, onAdvance])

  // Skip typewriter — show full text immediately
  const skipTypewriter = useCallback(() => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
    charIndexRef.current = line.text.length
    setDisplayedText(line.text)
    setIsTypewriterDone(true)
  }, [line.text])

  // Handle advance: if typewriter running, skip first; else advance
  const handleAdvance = useCallback(() => {
    if (!isTypewriterDone) {
      skipTypewriter()
      return
    }
    // Don't auto-advance if choices are present — wait for selection
    if (hasChoices) return
    onAdvance()
  }, [isTypewriterDone, skipTypewriter, hasChoices, onAdvance])

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleAdvance()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        skipTypewriter()
      }
    },
    [handleAdvance, skipTypewriter],
  )

  // Handle choice selection
  const handleChoiceSelect = useCallback(
    (choice: DialogChoice) => {
      soundManager.playButtonClick()
      onChoiceSelect?.(choice)
    },
    [onChoiceSelect],
  )

  // Advance button label
  const advanceLabel = isLastLine ? 'סיום' : 'המשך'

  return (
    <>
      {/* Cinematic bars for narration type */}
      <CinematicBars visible={isNarration} />

      {/* Monologue dim overlay */}
      <AnimatePresence>
        {line.type === 'monologue' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-40 bg-black/60"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={cn(
          'relative z-50 flex w-full max-w-lg p-4',
          isNarration ? 'flex-col items-center gap-3' : 'items-start gap-3',
          getContainerClasses(line.type),
          // Position: heroes on start side, villains on end side
          !isNarration && (isHero ? 'self-start' : 'self-end'),
        )}
        style={{
          boxShadow: isNarration
            ? undefined
            : `0 0 20px ${config.glowColor}4D`,
        }}
        dir="rtl"
        role="dialog"
        aria-label={`${isNarration ? 'קריינות' : config.nameHe} - דיאלוג`}
        aria-live="polite"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleAdvance}
      >
        {/* Portrait — hidden for narration */}
        {!isNarration && (
          <CharacterPortrait
            character={line.character}
            glowColor={config.glowColor}
          />
        )}

        {/* Content */}
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col gap-1',
            isNarration && 'items-center',
          )}
        >
          {/* Speaker name — hidden for narration */}
          {!isNarration && (
            <span
              className="text-xs font-bold"
              style={{ color: config.glowColor }}
            >
              {config.nameHe}
            </span>
          )}

          {/* Dialog text with typewriter */}
          <p
            className={cn(
              'text-sm leading-relaxed',
              getTextClasses(line.type),
            )}
          >
            {displayedText}
            {!isTypewriterDone && <TypewriterCursor />}
          </p>

          {/* Choices (only after typewriter finishes) */}
          {isTypewriterDone && hasChoices && line.choices && (
            <ChoiceButtons
              choices={line.choices}
              onSelect={handleChoiceSelect}
            />
          )}
        </div>

        {/* Skip / Advance button */}
        {!hasChoices && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAdvance()
            }}
            className={cn(
              'shrink-0 rounded-lg px-2 py-1',
              'text-xs text-white/50 transition-colors duration-150',
              'hover:bg-white/10 hover:text-white/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--game-accent-purple)]/50',
            )}
            aria-label={isTypewriterDone ? advanceLabel : 'דלג'}
          >
            {isTypewriterDone ? advanceLabel : 'דלג'}
          </button>
        )}
      </motion.div>
    </>
  )
}
