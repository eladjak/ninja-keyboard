'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, type Transition } from 'framer-motion'

import { cn } from '@/lib/utils'
import { CHARACTER_CONFIGS, isHeroCharacter } from '@/lib/story/character-config'
import type { CharacterMood, CharacterName } from '@/types/story'

interface SpeechBubbleProps {
  /** Which character is speaking */
  speaker: CharacterName
  /** Hebrew text to display */
  text: string
  /** Character mood (affects glow color intensity) */
  mood: CharacterMood
  /** How long to display before auto-dismiss (ms) */
  duration: number
  /** Called when the bubble is dismissed (auto or manual) */
  onDismiss: () => void
}

/** Typewriter speed: ms per Hebrew character */
const CHAR_DELAY_MS = 30

export function SpeechBubble({
  speaker,
  text,
  mood,
  duration,
  onDismiss,
}: SpeechBubbleProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const charIndexRef = useRef(0)

  const config = CHARACTER_CONFIGS[speaker]
  const isHero = isHeroCharacter(speaker)

  // Cleanup helper
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
  }, [])

  // Typewriter effect
  useEffect(() => {
    charIndexRef.current = 0
    setDisplayedText('')

    typewriterRef.current = setInterval(() => {
      charIndexRef.current += 1
      const nextText = text.slice(0, charIndexRef.current)
      setDisplayedText(nextText)

      if (charIndexRef.current >= text.length) {
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current)
          typewriterRef.current = null
        }
      }
    }, CHAR_DELAY_MS)

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current)
      }
    }
  }, [text])

  // Auto-dismiss timer
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [duration])

  const handleSkip = useCallback(() => {
    clearTimers()
    setIsVisible(false)
  }, [clearTimers])

  const handleExitComplete = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  // Mood-based glow intensity
  const glowIntensity =
    mood === 'excited' || mood === 'mischievous' ? '0.6' : '0.3'

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'flex items-start gap-3 rounded-2xl p-4',
            'bg-black/60 backdrop-blur-md',
            'border border-white/10',
            'max-w-md w-full',
            // Position: heroes bottom-start, villains top-end
            isHero
              ? 'self-start'
              : 'self-end',
          )}
          style={{
            boxShadow: `0 0 20px ${config.glowColor}${glowIntensity === '0.6' ? '99' : '4D'}`,
          }}
          dir="rtl"
        >
          {/* Character avatar */}
          <motion.div
            animate={{
              y: config.idleAnimation.y,
              rotate: config.idleAnimation.rotate,
            }}
            transition={config.idleAnimation.transition as Transition}
            className="shrink-0"
          >
            <div
              className="relative h-12 w-12 overflow-hidden rounded-full border-2"
              style={{ borderColor: config.glowColor }}
            >
              <Image
                src={config.image}
                alt={config.nameHe}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          </motion.div>

          {/* Speech content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {/* Speaker name */}
            <span
              className="text-xs font-bold"
              style={{ color: config.glowColor }}
            >
              {config.nameHe}
            </span>

            {/* Text with typewriter effect */}
            <p className="text-sm leading-relaxed text-white/90">
              {displayedText}
              {displayedText.length < text.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="inline-block h-4 w-0.5 bg-white/60"
                  style={{ verticalAlign: 'middle', marginInlineStart: '2px' }}
                />
              )}
            </p>
          </div>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className={cn(
              'shrink-0 rounded-lg px-2 py-1',
              'text-xs text-white/50 transition-colors',
              'hover:bg-white/10 hover:text-white/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            )}
            aria-label="דלג על הודעה"
          >
            דלג
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
