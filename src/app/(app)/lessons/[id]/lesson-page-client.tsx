'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, Trophy, Star, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StoryTriggerWrapper } from '@/components/story/story-trigger-wrapper'
import { ConfettiBurst } from '@/components/effects/confetti-burst'
import { useTypingSessionStore } from '@/stores/typing-session-store'
import { useXpStore } from '@/stores/xp-store'
import { useSettingsStore } from '@/stores/settings-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { soundManager } from '@/lib/audio/sound-manager'
import {
  computeSessionStats,
  isLessonComplete,
  calculateXpReward,
} from '@/lib/typing-engine/engine'
import {
  buildDrillSuggestion,
  drillHref,
  type DrillSuggestion,
} from '@/lib/typing-engine/weak-key-suggestion'
import { calculateStars } from '@/lib/typing-engine/stars'
import { CHAR_TO_KEY } from '@/lib/typing-engine/keyboard-layout'
import type { LessonDefinition, LessonContent } from '@/lib/typing-engine/types'
import type { StoryTriggerEvent } from '@/hooks/use-story-trigger'

interface LessonPageClientProps {
  lesson: LessonDefinition
  content: LessonContent
}

export function LessonPageClient({ lesson, content }: LessonPageClientProps) {
  const router = useRouter()
  const store = useTypingSessionStore()
  const xpStore = useXpStore()
  const addPracticeResult = usePracticeHistoryStore((s) => s.addResult)
  const { soundEnabled, soundVolume } = useSettingsStore()

  // Keep sound in sync with settings
  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
    soundManager.setVolume(soundVolume)
  }, [soundEnabled, soundVolume])

  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [pressedKey, setPressedKey] = useState<string | undefined>()
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  // Combo streak: consecutive correct keystrokes (escalating visual tiers)
  const [streak, setStreak] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [storyFinished, setStoryFinished] = useState(false)
  const [finalStats, setFinalStats] = useState<ReturnType<
    typeof computeSessionStats
  > | null>(null)
  // Weak-key drill auto-suggestion (set when a finished lesson is below the
  // accuracy threshold and the kid missed specific keys).
  const [drillSuggestion, setDrillSuggestion] = useState<DrillSuggestion | null>(
    null,
  )
  // Screen shake: set to true on error, cleared after animation via onAnimationEnd
  const [isShaking, setIsShaking] = useState(false)
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Confetti trigger: becomes true when lesson is completed successfully
  const [showConfetti, setShowConfetti] = useState(false)

  // Build the story trigger event: fires only after lesson is completed
  const storyEvent = useMemo<StoryTriggerEvent | null>(() => {
    if (!lessonCompleted) return null
    return { type: 'lesson-complete', lessonId: lesson.id }
  }, [lessonCompleted, lesson.id])

  // Initialize session with first line
  useEffect(() => {
    if (content.lines.length > 0) {
      store.startSession(content.lines[0], lesson.id)
      xpStore.updateStreak()
    }
    return () => {
      store.endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  // Handle key press
  const handleKeyPress = useCallback(
    (key: string, code: string) => {
      if (!store.isActive || store.isPaused) return

      const expected = store.text[store.currentIndex]
      const correct = key === expected

      store.typeKey(key, code)

      // Combo streak tracking
      if (correct) {
        setStreak((s) => {
          const next = s + 1
          // Combo milestone hit sound on tier boundaries
          if (next === 10 || next === 25 || next === 50) {
            soundManager.playComboHit()
          }
          return next
        })
      } else {
        setStreak(0)
      }

      // Sound feedback
      soundManager.playKeyClick()
      if (correct) {
        soundManager.playCorrect()
      } else {
        soundManager.playError()
        // Trigger screen shake (clear any in-flight shake first)
        setIsShaking(false)
        if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current)
        // Tiny delay so React re-renders false→true even on rapid errors
        shakeTimerRef.current = setTimeout(() => {
          setIsShaking(true)
          // Remove class after animation finishes (120ms)
          shakeTimerRef.current = setTimeout(() => setIsShaking(false), 150)
        }, 0)
      }

      // Visual feedback
      setPressedKey(key)
      setTimeout(() => setPressedKey(undefined), 100)

      setLastCorrect(correct)
      setTimeout(() => setLastCorrect(null), 200)
    },
    [store],
  )

  // Check if current line is complete
  useEffect(() => {
    if (!store.isActive) return
    if (store.currentIndex < store.text.length) return

    const nextIndex = currentLineIndex + 1

    if (nextIndex < content.lines.length) {
      // Move to next line
      setCurrentLineIndex(nextIndex)
      store.nextLine(content.lines[nextIndex])
    } else {
      // Lesson complete
      store.endSession()
      const stats = store.getStats()
      if (stats) {
        setFinalStats(stats)
        const completed = isLessonComplete(
          stats,
          lesson.targetWpm,
          lesson.targetAccuracy,
        )
        if (completed) {
          const reward = calculateXpReward(
            stats,
            lesson.targetWpm,
            lesson.targetAccuracy,
            xpStore.streak,
          )
          xpStore.addXp(reward.total)
          xpStore.completeLesson(lesson.id, stats.wpm, stats.accuracy)
        }
        // Record the session so per-key history (and the drill page) learn from
        // it, then auto-suggest a weak-key drill when accuracy was low.
        addPracticeResult({
          textId: lesson.id,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          durationMs: stats.durationMs,
          totalKeystrokes: stats.totalKeystrokes,
          correctKeystrokes: stats.correctKeystrokes,
          keyAccuracy: stats.keyAccuracy,
          completedAt: Date.now(),
          timerDuration: 0,
        })
        const suggestion = buildDrillSuggestion(stats)
        setDrillSuggestion(suggestion.suggest ? suggestion : null)
      }
      // Play completion sound
      soundManager.playLevelComplete()
      // Trigger the story system before showing results
      setLessonCompleted(true)
      setStoryFinished(false)
      setShowResults(true)
      // Fire confetti when lesson was completed successfully
      if (stats && isLessonComplete(stats, lesson.targetWpm, lesson.targetAccuracy)) {
        setShowConfetti(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentIndex, store.text.length])

  // Keyboard event listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!store.isActive || store.isPaused || showResults) return
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (e.key === 'Tab' || e.key === 'Escape') return

      // Allow space and printable characters
      if (e.key.length === 1 || e.key === ' ') {
        e.preventDefault()
        handleKeyPress(e.key, e.code)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [store.isActive, store.isPaused, showResults, handleKeyPress])

  const activeChar = store.isActive ? store.text[store.currentIndex] : undefined
  const activeKeyDef = activeChar ? CHAR_TO_KEY.get(activeChar) : undefined

  const stats = store.getStats()
  const realtimeWpm = store.getRealtimeWpm()
  const elapsed = store.startedAt ? performance.now() - store.startedAt : 0

  const handleRetry = () => {
    setCurrentLineIndex(0)
    setStreak(0)
    setShowResults(false)
    setLessonCompleted(false)
    setStoryFinished(false)
    setFinalStats(null)
    setDrillSuggestion(null)
    setIsShaking(false)
    setShowConfetti(false)
    store.startSession(content.lines[0], lesson.id)
  }

  const handleStoryComplete = useCallback(() => {
    setStoryFinished(true)
  }, [])

  const handleNextLesson = () => {
    const nextLevel = lesson.level + 1
    if (nextLevel <= 20) {
      router.push(`/lessons/lesson-${String(nextLevel).padStart(2, '0')}`)
    } else {
      router.push('/lessons')
    }
  }

  const getStars = (stats: ReturnType<typeof computeSessionStats>): number =>
    calculateStars(stats.wpm, stats.accuracy, lesson.targetWpm, lesson.targetAccuracy)

  return (
    <StoryTriggerWrapper
      event={storyEvent}
      onStoryComplete={handleStoryComplete}
    >
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg">
            {lesson.level}
          </Badge>
          <div>
            <h1 className="text-xl font-bold">{lesson.titleHe}</h1>
            <p className="text-sm text-muted-foreground">
              {lesson.descriptionHe}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>יעד: {lesson.targetWpm} מ/ד</span>
          <span>|</span>
          <span>{lesson.targetAccuracy}% דיוק</span>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-5 gap-2">
        <div className="game-card-border p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">{realtimeWpm || stats?.wpm || 0}</div>
          <div className="text-xs text-muted-foreground">מ/ד</div>
        </div>
        {/* Combo streak with escalating tiers */}
        <div
          className="game-card-border p-3 text-center"
          data-testid="lesson-streak"
          style={
            streak >= 50
              ? { borderColor: 'oklch(0.75 0.18 60 / 70%)', boxShadow: '0 0 14px oklch(0.75 0.18 60 / 35%)' }
              : streak >= 25
                ? { borderColor: 'oklch(0.55 0.2 292 / 70%)', boxShadow: '0 0 10px oklch(0.55 0.2 292 / 30%)' }
                : streak >= 10
                  ? { borderColor: 'oklch(0.672 0.148 168 / 60%)' }
                  : undefined
          }
        >
          <div
            key={streak >= 10 ? Math.floor(streak / 5) : 0}
            className={`text-2xl font-bold tabular-nums ${streak >= 10 ? 'animate-in zoom-in-95 duration-150' : ''}`}
            style={
              streak >= 50
                ? { color: '#fbbf24' }
                : streak >= 25
                  ? { color: 'var(--game-accent-purple)' }
                  : streak >= 10
                    ? { color: '#00B894' }
                    : undefined
            }
          >
            {streak >= 50 ? '🔥' : ''}{streak}
          </div>
          <div className="text-xs text-muted-foreground">רצף</div>
        </div>
        <div className="game-card-border p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">{stats?.accuracy ?? 100}%</div>
          <div className="text-xs text-muted-foreground">דיוק</div>
        </div>
        <div className="game-card-border p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">{stats?.totalKeystrokes ?? 0}</div>
          <div className="text-xs text-muted-foreground">הקשות</div>
        </div>
        <div className="game-card-border p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">
            {Math.floor(elapsed / 60000)}:{String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">זמן</div>
        </div>
      </div>

      {/* Progress bar for lines */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>שורה {currentLineIndex + 1} מתוך {content.lines.length}</span>
        <div className="h-2 flex-1 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-200"
            style={{
              width: `${((currentLineIndex + (store.currentIndex / Math.max(store.text.length, 1))) / content.lines.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Confetti on successful lesson completion */}
      <ConfettiBurst active={showConfetti} count={28} />

      {/* Typing Area */}
      <div
        className={`game-card-border min-h-[120px] p-6${isShaking ? ' typing-shake' : ''}`}
        onAnimationEnd={() => setIsShaking(false)}
      >
        <div className="text-2xl leading-relaxed" dir="rtl">
          {store.text.split('').map((char, i) => {
            let className = 'text-muted-foreground/40'
            if (i < store.currentIndex) {
              const keystroke = store.keystrokes[i]
              className = keystroke?.isCorrect
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            } else if (i === store.currentIndex) {
              className =
                'text-foreground bg-primary/20 border-b-2 border-primary'
            }
            return (
              <span key={i} className={className}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            )
          })}
        </div>
        {/* Shown until the first keystroke (startSession activates immediately on mount) */}
        {store.keystrokes.length === 0 && !showResults && (
          <div className="mt-4 space-y-3 text-center">
            {lesson.storyIntroHe && (
              <p
                data-testid="lesson-story-intro"
                className="mx-auto max-w-lg rounded-xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: 'oklch(0.495 0.205 292 / 12%)',
                  border: '1.5px solid oklch(0.495 0.205 292 / 30%)',
                  color: 'var(--game-accent-purple, #a78bfa)',
                }}
              >
                {lesson.storyIntroHe}
              </p>
            )}
            <p className="text-muted-foreground">
              לחצו על מקש כלשהו כדי להתחיל...
            </p>
          </div>
        )}
      </div>

      {/* Finger hint */}
      {activeKeyDef && (
        <div className="text-center text-sm text-muted-foreground">
          {activeKeyDef.hand === 'right' ? 'יד ימין' : 'יד שמאל'} -{' '}
          {activeKeyDef.finger === 'pinky'
            ? 'זרת'
            : activeKeyDef.finger === 'ring'
              ? 'קמיצה'
              : activeKeyDef.finger === 'middle'
                ? 'אמה'
                : 'אצבע מורה'}
        </div>
      )}

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && finalStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="game-card-border w-full max-w-md"
            >
              <CardHeader className="text-center">
                {/* Stars row */}
                <div className="mb-2 flex justify-center gap-1">
                  {Array.from({ length: 3 }, (_, i) => {
                    const earned = i < getStars(finalStats)
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.08 * i, duration: 0.15, ease: 'easeOut' }}
                      >
                        <Star
                          className={`size-9 ${
                            earned
                              ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </motion.div>
                    )
                  })}
                </div>
                <CardTitle className="text-xl">
                  {isLessonComplete(
                    finalStats,
                    lesson.targetWpm,
                    lesson.targetAccuracy,
                  )
                    ? 'כל הכבוד! עברתם את השיעור!'
                    : 'נסיון טוב! נסו שוב'}
                </CardTitle>
                {lesson.storyOutroHe &&
                  isLessonComplete(
                    finalStats,
                    lesson.targetWpm,
                    lesson.targetAccuracy,
                  ) && (
                    <motion.p
                      data-testid="lesson-story-outro"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.18, ease: 'easeOut' }}
                      className="mt-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      {lesson.storyOutroHe}
                    </motion.p>
                  )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main stats */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'oklch(0.15 0.02 292 / 40%)', border: '1.5px solid var(--game-border)' }}
                  >
                    <div className="text-3xl font-bold tabular-nums">{finalStats.wpm}</div>
                    <div className="text-sm text-muted-foreground">מילים לדקה</div>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'oklch(0.15 0.02 292 / 40%)', border: '1.5px solid var(--game-border)' }}
                  >
                    <div className="text-3xl font-bold tabular-nums">{finalStats.accuracy}%</div>
                    <div className="text-sm text-muted-foreground">דיוק</div>
                  </div>
                </div>

                {/* XP reward */}
                {isLessonComplete(
                  finalStats,
                  lesson.targetWpm,
                  lesson.targetAccuracy,
                ) && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.18, ease: 'easeOut' }}
                    className="flex items-center justify-center gap-2 rounded-xl py-2"
                    style={{ background: 'oklch(0.495 0.205 292 / 15%)', border: '1.5px solid oklch(0.495 0.205 292 / 35%)' }}
                  >
                    <Trophy className="size-5 text-primary" />
                    <span className="text-lg font-bold text-primary">
                      +
                      {
                        calculateXpReward(
                          finalStats,
                          lesson.targetWpm,
                          lesson.targetAccuracy,
                          xpStore.streak,
                        ).total
                      }{' '}
                      XP
                    </span>
                  </motion.div>
                )}

                {/* Weak-key drill auto-suggestion (encouraging, non-punishing) */}
                {drillSuggestion && (
                  <motion.div
                    data-testid="drill-suggestion"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.18, ease: 'easeOut' }}
                    className="space-y-2 rounded-xl p-3 text-center"
                    style={{
                      background: 'oklch(0.78 0.16 75 / 12%)',
                      border: '1.5px solid oklch(0.78 0.16 75 / 35%)',
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: 'oklch(0.82 0.15 75)' }}>
                      {drillSuggestion.titleHe}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {drillSuggestion.messageHe}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {drillSuggestion.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded px-2 py-0.5 font-mono text-sm font-bold"
                          style={{
                            background: 'var(--game-bg-input)',
                            border: '1px solid oklch(0.78 0.16 75 / 40%)',
                            color: 'oklch(0.82 0.15 75)',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                    <Link
                      href={drillHref(drillSuggestion.keys)}
                      className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #f5b301, #d99500)' }}
                    >
                      <Target className="size-4" />
                      בוא נתרגל יחד
                    </Link>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleRetry}
                  >
                    <RotateCcw className="me-2 size-4" />
                    נסו שוב
                  </Button>
                  <Button className="flex-1" onClick={handleNextLesson}>
                    השיעור הבא
                    <ArrowRight className="ms-2 size-4" />
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </StoryTriggerWrapper>
  )
}
