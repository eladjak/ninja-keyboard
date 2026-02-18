'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Keystroke {
  expected: string
  actual: string
  isCorrect: boolean
}

interface TypingAreaProps {
  /** The text to type */
  text: string
  /** Current position in the text */
  currentIndex: number
  /** History of keystrokes */
  keystrokes: Keystroke[]
  /** Whether the session is running */
  isActive: boolean
  /** Called when the user presses a key */
  onKeyPress: (key: string, code: string) => void
}

/** Keys that should have their default browser behavior prevented */
const TYPING_KEYS = new Set([
  'Backspace', 'Tab', 'Enter', 'Space', ' ',
])

/**
 * The main typing practice area.
 * Renders the target text with per-character colour feedback and a blinking cursor.
 * Attaches a window keydown listener while the session is active.
 */
export function TypingArea({
  text,
  currentIndex,
  keystrokes,
  isActive,
  onKeyPress,
}: TypingAreaProps) {
  // Attach / detach keydown listener based on isActive
  useEffect(() => {
    if (!isActive) return

    function handleKeyDown(event: KeyboardEvent) {
      // Prevent default for keys that would interfere with the page
      if (TYPING_KEYS.has(event.key) || TYPING_KEYS.has(event.code)) {
        event.preventDefault()
      }
      // Ignore modifier-only presses
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return
      onKeyPress(event.key, event.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onKeyPress])

  // Build a lookup: index → keystroke result (for characters already typed)
  const keystrokeMap = useMemo(() => {
    const map = new Map<number, boolean>()
    keystrokes.forEach((ks, i) => {
      map.set(i, ks.isCorrect)
    })
    return map
  }, [keystrokes])

  const characters = useMemo(
    () =>
      text.split('').map((char, index) => {
        const isTyped = index < currentIndex
        const isCurrent = index === currentIndex
        const isCorrect = keystrokeMap.get(index)
        return { char, index, isTyped, isCurrent, isCorrect }
      }),
    [text, currentIndex, keystrokeMap],
  )

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {/* Practice text display */}
        <div
          className="min-h-32 rounded-lg bg-muted/30 px-4 py-4 sm:px-6 sm:py-5"
          dir="rtl"
          role="textbox"
          aria-readonly
          aria-label="טקסט לתרגול"
        >
          <p className="flex flex-wrap justify-start font-mono text-2xl leading-loose tracking-wider sm:text-3xl">
            {characters.map(({ char, index, isTyped, isCurrent, isCorrect }) => (
              <span
                key={index}
                className={cn(
                  'relative inline-block transition-colors duration-100',
                  // Already typed – green for correct, red for error
                  isTyped && isCorrect === true &&
                    'text-green-600 dark:text-green-400',
                  isTyped && isCorrect === false &&
                    'bg-red-200/60 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                  // Current character – normal foreground, cursor rendered below
                  isCurrent && 'text-foreground',
                  // Future characters – dimmed
                  !isTyped && !isCurrent && 'text-muted-foreground/40',
                )}
              >
                {/* Non-breaking space so empty chars keep their width */}
                {char === ' ' ? '\u00A0' : char}

                {/* Blinking cursor under the current character */}
                {isCurrent && (
                  <motion.span
                    className="absolute bottom-0 start-0 h-0.5 w-full rounded-full bg-primary"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
              </span>
            ))}
          </p>
        </div>

        {/* "Press any key to start" overlay */}
        {!isActive && (
          <motion.p
            className="mt-4 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            aria-live="polite"
          >
            לחץ על כל מקש כדי להתחיל
          </motion.p>
        )}
      </CardContent>
    </Card>
  )
}
