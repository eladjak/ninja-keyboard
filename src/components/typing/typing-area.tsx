'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

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
  /** Optional callback fired on combo milestones (10, 20, 50) */
  onComboMilestone?: (combo: number) => void
}

/** Minimum streak length before the combo counter appears */
const COMBO_THRESHOLD = 5

/** Returns the count of consecutive correct keystrokes at the end of the array */
function getCurrentCombo(keystrokes: Keystroke[]): number {
  let count = 0
  for (let i = keystrokes.length - 1; i >= 0; i--) {
    if (keystrokes[i].isCorrect) {
      count++
    } else {
      break
    }
  }
  return count
}

/** Visual intensity class based on combo size */
function comboIntensityClass(combo: number): string {
  if (combo >= 50) return 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]'
  if (combo >= 20) return 'text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.7)]'
  if (combo >= 10) return 'text-primary drop-shadow-[0_0_5px_oklch(0.72_0.15_292_/_60%)]'
  return 'text-secondary drop-shadow-[0_0_4px_oklch(0.72_0.15_168_/_50%)]'
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
  onComboMilestone,
}: TypingAreaProps) {
  const reduceMotion = useReducedMotion()

  // Derived combo value — count of trailing correct keystrokes
  const combo = useMemo(() => getCurrentCombo(keystrokes), [keystrokes])
  const showCombo = combo >= COMBO_THRESHOLD && isActive

  // Track combo key so framer-motion re-mounts the counter on each increment
  const comboAnimKey = useRef(0)
  const prevCombo = useRef(0)
  if (combo !== prevCombo.current) {
    comboAnimKey.current++
    prevCombo.current = combo
  }

  // Fire milestone callback for sound effects
  useEffect(() => {
    if (!onComboMilestone) return
    if (combo === 10 || combo === 20 || combo === 50) {
      onComboMilestone(combo)
    }
  }, [combo, onComboMilestone])

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
        {/* Combo counter — floats above the text area when active */}
        <AnimatePresence>
          {showCombo && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? {} : { opacity: 0, scale: 0.7, y: -6 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.12, ease: 'easeOut' }}
              className="mb-2 flex items-center justify-end gap-1.5"
              aria-live="polite"
              aria-label={`קומבו: ${combo} הקשות רצופות`}
            >
              <span className="text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
                קומבו
              </span>
              <motion.span
                key={comboAnimKey.current}
                initial={reduceMotion ? false : { scale: 1.25 }}
                animate={{ scale: 1 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
                className={cn(
                  'min-w-[2.5rem] rounded-md px-2 py-0.5 text-center font-mono text-lg font-extrabold tabular-nums',
                  'border border-current/20 bg-current/5',
                  comboIntensityClass(combo),
                )}
              >
                x{combo}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Practice text display */}
        <div
          className="min-h-32 rounded-lg bg-muted/30 px-4 py-4 sm:px-6 sm:py-5"
          dir="rtl"
          role="textbox"
          aria-readonly
          aria-label="טקסט לתרגול"
        >
          <p className="flex flex-wrap justify-start font-mono text-2xl leading-loose tracking-wider sm:text-3xl">
            {characters.map(({ char, index, isTyped, isCurrent, isCorrect }) => {
              // Flash animation on the character that was just typed
              const justTyped = isTyped && index === currentIndex - 1

              return (
                <motion.span
                  key={index}
                  className={cn(
                    'relative inline-block',
                    // Already typed – green for correct, red for error
                    isTyped && isCorrect === true &&
                      'text-green-600 dark:text-green-400 drop-shadow-[0_0_3px_rgba(22,163,74,0.3)]',
                    isTyped && isCorrect === false &&
                      'rounded bg-red-200/60 text-red-600 dark:bg-red-900/30 dark:text-red-400 drop-shadow-[0_0_3px_rgba(220,38,38,0.3)]',
                    // Current character – normal foreground, cursor rendered below
                    isCurrent && 'text-foreground',
                    // Future characters – dimmed
                    !isTyped && !isCurrent && 'text-muted-foreground/40',
                  )}
                  animate={justTyped && !reduceMotion
                    ? { scale: [1.3, 1], opacity: [0.6, 1] }
                    : {}
                  }
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
                >
                  {/* Non-breaking space so empty chars keep their width */}
                  {char === ' ' ? '\u00A0' : char}

                  {/* Blinking cursor under the current character */}
                  {isCurrent && (
                    <motion.span
                      className="absolute bottom-0 start-0 h-0.5 w-full rounded-full bg-primary cursor-glow"
                      animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }}
                      transition={reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.8, repeat: Infinity, ease: 'linear' }
                      }
                    />
                  )}
                </motion.span>
              )
            })}
          </p>
        </div>

        {/* "Press any key to start" overlay */}
        {!isActive && (
          <motion.p
            className="mt-4 text-center text-sm text-muted-foreground"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
            aria-live="polite"
          >
            לחץ על כל מקש כדי להתחיל
          </motion.p>
        )}
      </CardContent>
    </Card>
  )
}
