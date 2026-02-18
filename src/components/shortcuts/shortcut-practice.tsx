'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { KeyCombo } from './shortcut-card'
import type { ShortcutDefinition } from '@/lib/content/shortcuts'

// ── Key Mapping ───────────────────────────────────────────────────

/** Maps our display key names to the actual KeyboardEvent properties */
function matchesShortcut(
  event: KeyboardEvent,
  shortcut: ShortcutDefinition,
): boolean {
  const keys = shortcut.keys.map((k) => k.toLowerCase())

  // Check modifier keys
  const needsCtrl = keys.includes('ctrl')
  const needsShift = keys.includes('shift')
  const needsAlt = keys.includes('alt')
  const needsWin = keys.includes('win')

  if (event.ctrlKey !== needsCtrl) return false
  if (event.shiftKey !== needsShift) return false
  if (event.altKey !== needsAlt) return false
  if (event.metaKey !== needsWin) return false

  // Find the non-modifier key
  const nonModifiers = keys.filter(
    (k) => !['ctrl', 'shift', 'alt', 'win'].includes(k),
  )

  if (nonModifiers.length === 0) return false

  const targetKey = nonModifiers[0]

  // Special key mappings
  const keyMap: Record<string, string> = {
    tab: 'Tab',
    home: 'Home',
    end: 'End',
    arrow: 'ArrowRight', // Accept any arrow for Ctrl+Shift+Arrow
    prtsc: 'PrintScreen',
    f2: 'F2',
    f4: 'F4',
    f5: 'F5',
    f11: 'F11',
    esc: 'Escape',
  }

  const expectedKey = keyMap[targetKey] ?? targetKey

  // For arrow keys, accept any arrow direction
  if (targetKey === 'arrow') {
    return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
      event.key,
    )
  }

  // Compare case-insensitively for letter keys
  return event.key.toLowerCase() === expectedKey.toLowerCase()
}

// ── Types ─────────────────────────────────────────────────────────

type PracticeState = 'practicing' | 'correct' | 'incorrect' | 'completed'

interface ShortcutPracticeProps {
  /** Shortcuts to practice in this session */
  shortcuts: ShortcutDefinition[]
  /** Called when all shortcuts are completed with score */
  onComplete: (score: number, total: number) => void
  /** Called to go back */
  onBack: () => void
}

// ── Component ─────────────────────────────────────────────────────

export function ShortcutPractice({
  shortcuts,
  onComplete,
  onBack,
}: ShortcutPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [state, setState] = useState<PracticeState>('practicing')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(
    null,
  )
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentShortcut = shortcuts[currentIndex] as
    | ShortcutDefinition
    | undefined
  const total = shortcuts.length
  const isCompleted = state === 'completed'

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [])

  const advanceToNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setState('completed')
    } else {
      setCurrentIndex((prev) => prev + 1)
      setState('practicing')
      setFeedback(null)
    }
  }, [currentIndex, total])

  // Handle keyboard events
  useEffect(() => {
    if (state !== 'practicing' || !currentShortcut) return

    function handleKeyDown(event: KeyboardEvent) {
      // Prevent default browser shortcuts during practice
      event.preventDefault()

      if (!currentShortcut) return

      if (matchesShortcut(event, currentShortcut)) {
        // Correct!
        setFeedback('correct')
        setState('correct')
        setScore((prev) => prev + 1)

        feedbackTimeoutRef.current = setTimeout(() => {
          advanceToNext()
        }, 1200)
      } else {
        // Only give feedback if user pressed a non-modifier key
        const isOnlyModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(
          event.key,
        )
        if (!isOnlyModifier) {
          setFeedback('incorrect')
          setState('incorrect')

          feedbackTimeoutRef.current = setTimeout(() => {
            setFeedback(null)
            setState('practicing')
          }, 1200)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, currentShortcut, advanceToNext])

  const handleRestart = () => {
    setCurrentIndex(0)
    setScore(0)
    setState('practicing')
    setFeedback(null)
  }

  // ── Completed State ───────────────────────────────────────────

  if (isCompleted) {
    const xpReward = score * 10
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Trophy className="size-6 text-yellow-500" />
            סיימתם!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold" data-testid="final-score">
            {score}/{total}
          </div>
          <p className="text-muted-foreground">
            {score === total
              ? 'מושלם! שלטתם בכל הקיצורים!'
              : score >= total / 2
                ? 'כל הכבוד! המשיכו לתרגל!'
                : 'נסו שוב - תרגול עושה מאסטר!'}
          </p>
          {xpReward > 0 && (
            <p className="text-sm font-medium text-primary">
              +{xpReward} XP
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={onBack}>
              חזרה
            </Button>
            <Button onClick={handleRestart}>
              <RotateCcw className="size-4" />
              נסו שוב
            </Button>
            <Button
              variant="default"
              onClick={() => onComplete(score, total)}
            >
              סיום
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Practice State ────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            קיצור {currentIndex + 1} מתוך {total}
          </span>
          <span className="font-medium" data-testid="practice-score">
            {score}/{total} נכון
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${((currentIndex) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Current shortcut card */}
      {currentShortcut && (
        <Card
          className={cn(
            'transition-all duration-150',
            feedback === 'correct' &&
              'border-green-500 bg-green-50 dark:bg-green-950/30',
            feedback === 'incorrect' &&
              'border-red-500 bg-red-50 dark:bg-red-950/30',
          )}
        >
          <CardContent className="space-y-6 p-6 text-center">
            {/* Shortcut name */}
            <div>
              <h2 className="text-xl font-bold">
                {currentShortcut.hebrewName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentShortcut.description}
              </p>
            </div>

            {/* Key combo to press */}
            <div className="flex justify-center">
              <KeyCombo keys={currentShortcut.keys} />
            </div>

            {/* Instruction */}
            <p className="text-sm font-medium text-muted-foreground">
              לחצו על הקיצור במקלדת!
            </p>

            {/* Feedback */}
            <AnimatePresence mode="wait">
              {feedback === 'correct' && (
                <motion.div
                  key="correct"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-2 text-green-600"
                  role="status"
                >
                  <CheckCircle2 className="size-6" />
                  <span className="text-lg font-bold">!נכון</span>
                </motion.div>
              )}
              {feedback === 'incorrect' && (
                <motion.div
                  key="incorrect"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center gap-2 text-red-600"
                  role="status"
                >
                  <XCircle className="size-6" />
                  <span className="text-lg font-bold">נסו שוב</span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Back button */}
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={onBack}>
          חזרה לרשימה
        </Button>
      </div>
    </div>
  )
}
