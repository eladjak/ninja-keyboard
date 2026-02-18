'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { HebrewKeyboard } from '@/components/typing/hebrew-keyboard'
import { FingerGuide } from '@/components/typing/finger-guide'
import { TypingArea } from '@/components/typing/typing-area'
import { useXpStore } from '@/stores/xp-store'
import { useSettingsStore } from '@/stores/settings-store'
import { soundManager } from '@/lib/audio/sound-manager'

// ── Types ─────────────────────────────────────────────────────────

export interface FirstLessonMagicProps {
  /** Called when the onboarding flow is complete */
  onComplete: (result: { xpEarned: number; wordsTyped: number }) => void
  /** Optional player name for personalised messages */
  playerName?: string
}

interface Keystroke {
  expected: string
  actual: string
  isCorrect: boolean
}

/** Five steps of the onboarding experience */
type Step = 1 | 2 | 3 | 4 | 5

// ── Constants ─────────────────────────────────────────────────────

const STEP_1_WORD = 'שלום'      // 4 letters, step 2
const STEP_4_TEXT = 'שלום עולם' // 9 chars incl. space, step 4
const XP_REWARD = 50
const BADGE_NAME = 'צעד ראשון'

// Home row keys (ש ד ג כ ע י ח ל ך ף)
const HOME_ROW_CHARS = ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף']

// ── Step Indicator ────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`שלב ${current} מתוך ${total}`}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <motion.div
          key={step}
          className={cn(
            'h-2 rounded-full transition-all',
            step === current
              ? 'w-6 bg-primary'
              : step < current
                ? 'w-2 bg-primary/50'
                : 'w-2 bg-muted',
          )}
          animate={{ scale: step === current ? 1.1 : 1 }}
          transition={{ duration: 0.15 }}
        />
      ))}
    </div>
  )
}

// ── Step 1: Finger Placement ──────────────────────────────────────

function Step1FingerPlacement({ onNext }: { onNext: () => void }) {
  const [pulseIndex, setPulseIndex] = useState(0)

  // Cycle through home row keys to show finger placement
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((i) => (i + 1) % HOME_ROW_CHARS.length)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          שים את האצבעות ככה
        </h2>
        <p className="mt-2 text-muted-foreground">
          הנח כל אצבע על המקש שלה בשורת הבית
        </p>
      </div>

      <HebrewKeyboard
        activeKey={HOME_ROW_CHARS[pulseIndex]}
        showFingerColors
        className="scale-90 sm:scale-100"
      />

      <FingerGuide
        activeChar={HOME_ROW_CHARS[pulseIndex]}
        className="w-full max-w-sm"
      />

      <motion.button
        className={cn(
          'mt-2 rounded-xl bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground',
          'shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        onClick={onNext}
        aria-label="המשך לשלב הבא"
      >
        הבנתי, בוא נתחיל!
      </motion.button>
    </div>
  )
}

// ── Step 2: Type שלום ─────────────────────────────────────────────

interface Step2TypingProps {
  onWordComplete: () => void
  soundEnabled: boolean
}

function Step2Typing({ onWordComplete, soundEnabled }: Step2TypingProps) {
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const completedRef = useRef(false)

  const handleKeyPress = useCallback(
    (key: string, _code: string) => {
      if (completedRef.current) return
      const expected = STEP_1_WORD[currentIndex]
      if (expected === undefined) return

      const isCorrect = key === expected
      const newKeystroke: Keystroke = { expected, actual: key, isCorrect }

      if (soundEnabled) {
        if (isCorrect) {
          soundManager.playCorrect()
        } else {
          soundManager.playKeyClick()
        }
      }

      setKeystrokes((prev) => [...prev, newKeystroke])

      // Only advance on correct key (very forgiving — no wrong answer blocks progress)
      if (isCorrect) {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)

        if (nextIndex >= STEP_1_WORD.length) {
          completedRef.current = true
          // Small delay for the last correct animation to show
          setTimeout(() => {
            onWordComplete()
          }, 400)
        }
      }
    },
    [currentIndex, onWordComplete, soundEnabled],
  )

  const activeChar = STEP_1_WORD[currentIndex]

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          הקלד: {STEP_1_WORD}
        </h2>
        <p className="mt-2 text-muted-foreground">
          הקלד כל אות בזהירות — לא נחזיר אותך
        </p>
      </div>

      {/* Target word with large text */}
      <div
        className="flex flex-row-reverse gap-1 rounded-2xl bg-muted/40 px-6 py-4"
        dir="rtl"
        aria-label={`הקלד: ${STEP_1_WORD}`}
      >
        {STEP_1_WORD.split('').map((char, i) => {
          const isTyped = i < currentIndex
          const isCurrent = i === currentIndex
          const ks = keystrokes[i]
          return (
            <motion.span
              key={i}
              className={cn(
                'text-5xl font-bold sm:text-6xl',
                isTyped && ks?.isCorrect && 'text-green-500',
                isTyped && !ks?.isCorrect && 'text-red-500',
                isCurrent && 'text-primary underline decoration-wavy underline-offset-4',
                !isTyped && !isCurrent && 'text-muted-foreground/40',
              )}
              animate={isTyped && ks?.isCorrect ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.15 }}
            >
              {char}
            </motion.span>
          )
        })}
      </div>

      <TypingArea
        text={STEP_1_WORD}
        currentIndex={currentIndex}
        keystrokes={keystrokes}
        isActive
        onKeyPress={handleKeyPress}
      />

      <HebrewKeyboard
        activeKey={activeChar}
        showFingerColors
        className="scale-90 sm:scale-100"
      />

      <FingerGuide
        activeChar={activeChar}
        className="w-full max-w-sm"
      />
    </div>
  )
}

// ── Step 3: Celebration ───────────────────────────────────────────

function Step3Celebration({
  onNext,
  playerName,
}: {
  onNext: () => void
  playerName?: string
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
        className="text-6xl"
        aria-hidden
      >
        🎉
      </motion.div>

      <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
        {playerName ? `כל הכבוד, ${playerName}!` : 'כל הכבוד!'}
      </h2>

      <p className="text-lg text-muted-foreground">הקלדת את המילה הראשונה שלך!</p>

      {/* XP badge */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.1 }}
        className={cn(
          'flex items-center gap-3 rounded-2xl px-6 py-3',
          'bg-gradient-to-r from-primary/20 to-secondary/20',
          'border border-primary/30',
        )}
      >
        <span className="text-2xl font-black text-primary">+{XP_REWARD} XP</span>
      </motion.div>

      {/* Achievement badge */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.2 }}
        className={cn(
          'flex flex-col items-center gap-1 rounded-2xl px-6 py-4',
          'border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
          'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
        )}
      >
        <span className="text-3xl" aria-hidden>🏅</span>
        <span className="text-base font-bold text-yellow-700 dark:text-yellow-400">
          עיטור: {BADGE_NAME}
        </span>
      </motion.div>

      <motion.button
        className={cn(
          'mt-2 rounded-xl bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground',
          'shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        onClick={onNext}
        aria-label="המשך לשלב הבא"
      >
        המשך
      </motion.button>
    </div>
  )
}

// ── Step 4: Type שלום עולם ────────────────────────────────────────

interface Step4TypingProps {
  onComplete: () => void
  soundEnabled: boolean
}

function Step4Typing({ onComplete, soundEnabled }: Step4TypingProps) {
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const completedRef = useRef(false)

  const handleKeyPress = useCallback(
    (key: string, _code: string) => {
      if (completedRef.current) return
      const expected = STEP_4_TEXT[currentIndex]
      if (expected === undefined) return

      const isCorrect = key === expected
      const newKeystroke: Keystroke = { expected, actual: key, isCorrect }

      if (soundEnabled) {
        if (isCorrect) {
          soundManager.playCorrect()
        } else {
          soundManager.playKeyClick()
        }
      }

      setKeystrokes((prev) => [...prev, newKeystroke])

      if (isCorrect) {
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)

        if (nextIndex >= STEP_4_TEXT.length) {
          completedRef.current = true
          setTimeout(() => {
            onComplete()
          }, 400)
        }
      }
    },
    [currentIndex, onComplete, soundEnabled],
  )

  const activeChar = STEP_4_TEXT[currentIndex]
  const words = STEP_4_TEXT.split(' ')

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          עכשיו: {STEP_4_TEXT}
        </h2>
        <p className="mt-2 text-muted-foreground">
          מצוין! עכשיו נוסיף עוד מילה. זוכר את רווח?
        </p>
        {activeChar === ' ' && (
          <motion.p
            className="mt-1 font-semibold text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            לחץ על מקש הרווח
          </motion.p>
        )}
      </div>

      {/* Target phrase */}
      <div
        className="flex flex-row-reverse flex-wrap justify-center gap-x-4 gap-y-2"
        dir="rtl"
        aria-label={`הקלד: ${STEP_4_TEXT}`}
      >
        {words.map((word, wIdx) => (
          <div key={wIdx} className="flex flex-row-reverse gap-0.5">
            {word.split('').map((char, cIdx) => {
              // Calculate absolute position in full text
              const absIdx =
                words.slice(0, wIdx).reduce((acc, w) => acc + w.length + 1, 0) + cIdx
              const isTyped = absIdx < currentIndex
              const isCurrent = absIdx === currentIndex
              const ks = keystrokes[absIdx]
              return (
                <motion.span
                  key={cIdx}
                  className={cn(
                    'text-4xl font-bold sm:text-5xl',
                    isTyped && ks?.isCorrect && 'text-green-500',
                    isTyped && !ks?.isCorrect && 'text-red-500',
                    isCurrent && 'text-primary underline decoration-wavy underline-offset-4',
                    !isTyped && !isCurrent && 'text-muted-foreground/40',
                  )}
                  animate={isTyped && ks?.isCorrect ? { scale: [1, 1.25, 1] } : {}}
                  transition={{ duration: 0.12 }}
                >
                  {char}
                </motion.span>
              )
            })}
          </div>
        ))}
      </div>

      <TypingArea
        text={STEP_4_TEXT}
        currentIndex={currentIndex}
        keystrokes={keystrokes}
        isActive
        onKeyPress={handleKeyPress}
      />

      <HebrewKeyboard
        activeKey={activeChar}
        showFingerColors
        className="scale-90 sm:scale-100"
      />

      <FingerGuide
        activeChar={activeChar}
        className="w-full max-w-sm"
      />
    </div>
  )
}

// ── Step 5: Finish ─────────────────────────────────────────────────

function Step5Finish({
  onComplete,
  playerName,
}: {
  onComplete: () => void
  playerName?: string
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 180 }}
        className="text-5xl"
        aria-hidden
      >
        🥷
      </motion.div>

      <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
        {playerName ? `מעולה, ${playerName}!` : 'מעולה!'}
      </h2>

      <p className="max-w-xs text-lg text-muted-foreground">
        חזור מחר ל-2 דקות נוספות ותהפוך לנינג&#x27;ה מקלדת אמיתי
      </p>

      {/* Summary card */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.1 }}
        className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-md"
      >
        <h3 className="text-center text-sm font-semibold text-muted-foreground">
          סיכום האימון
        </h3>

        <div className="flex items-center justify-between text-base">
          <span className="text-muted-foreground">מילים שהקלדת</span>
          <span className="font-bold text-foreground">2</span>
        </div>

        <div className="flex items-center justify-between text-base">
          <span className="text-muted-foreground">XP שנצברו</span>
          <span className="font-bold text-primary">+{XP_REWARD}</span>
        </div>

        <div className="flex items-center justify-between text-base">
          <span className="text-muted-foreground">עיטור</span>
          <span className="flex items-center gap-1 font-bold text-yellow-600 dark:text-yellow-400">
            <span aria-hidden>🏅</span> {BADGE_NAME}
          </span>
        </div>
      </motion.div>

      {/* Zeigarnik Effect: tease next content */}
      <p className="text-sm text-muted-foreground/70">
        שלב הבא: שורת הבית המלאה — תלמד עוד 10 מקשים!
      </p>

      <motion.button
        className={cn(
          'mt-2 rounded-xl bg-primary px-10 py-3 text-lg font-semibold text-primary-foreground',
          'shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        onClick={onComplete}
        aria-label="עבור לשיעורים"
      >
        בוא נתחיל!
      </motion.button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────

/**
 * FirstLessonMagic — 3-minute "first magic" onboarding experience.
 * Regardless of level, the first lesson MUST feel like SUCCESS.
 *
 * Flow:
 *  Step 1 (15s) → Finger placement guide
 *  Step 2 (30s) → Type "שלום"
 *  Step 3       → Celebration + XP + badge
 *  Step 4 (30s) → Type "שלום עולם"
 *  Step 5       → Finish summary + call onComplete
 */
export function FirstLessonMagic({
  onComplete,
  playerName,
}: FirstLessonMagicProps) {
  const [step, setStep] = useState<Step>(1)
  const addXp = useXpStore((s) => s.addXp)
  const { soundEnabled, soundVolume } = useSettingsStore()

  // Sync sound manager with settings
  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
    soundManager.setVolume(soundVolume)
  }, [soundEnabled, soundVolume])

  const goToStep = useCallback((s: Step) => setStep(s), [])

  const handleStep2Complete = useCallback(() => {
    if (soundEnabled) {
      soundManager.playLevelComplete()
    }
    addXp(XP_REWARD)
    goToStep(3)
  }, [addXp, goToStep, soundEnabled])

  const handleStep4Complete = useCallback(() => {
    if (soundEnabled) {
      soundManager.playXpGain()
    }
    goToStep(5)
  }, [goToStep, soundEnabled])

  const handleFinish = useCallback(() => {
    onComplete({ xpEarned: XP_REWARD, wordsTyped: 2 })
  }, [onComplete])

  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col items-center justify-center px-4 py-8',
        'bg-background',
      )}
      dir="rtl"
    >
      <div className="w-full max-w-2xl">
        {/* Step indicator */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <StepIndicator current={step} total={5} />
          <p className="text-xs text-muted-foreground">
            שלב {step} מתוך 5
          </p>
        </div>

        {/* Step content — animated transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {step === 1 && (
              <Step1FingerPlacement onNext={() => goToStep(2)} />
            )}
            {step === 2 && (
              <Step2Typing
                onWordComplete={handleStep2Complete}
                soundEnabled={soundEnabled}
              />
            )}
            {step === 3 && (
              <Step3Celebration
                onNext={() => goToStep(4)}
                playerName={playerName}
              />
            )}
            {step === 4 && (
              <Step4Typing
                onComplete={handleStep4Complete}
                soundEnabled={soundEnabled}
              />
            )}
            {step === 5 && (
              <Step5Finish
                onComplete={handleFinish}
                playerName={playerName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
