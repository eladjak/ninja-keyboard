'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTypingSessionStore } from '@/stores/typing-session-store'
import { useXpStore } from '@/stores/xp-store'
import { getLessonById } from '@/lib/content/lessons'
import { getLessonContent } from '@/lib/content/sentences'
import { HebrewKeyboard } from './hebrew-keyboard'
import { TypingArea } from './typing-area'
import { FingerGuide } from './finger-guide'
import { SessionStats } from './session-stats'
import {
  computeSessionStats,
  isLessonComplete,
  calculateXpReward,
} from '@/lib/typing-engine'

interface LessonViewProps {
  lessonId: string
}

interface ResultState {
  wpm: number
  accuracy: number
  xpEarned: number
  stars: number
  passed: boolean
}

/** Determine star rating based on performance vs targets */
function calculateStars(
  wpm: number,
  accuracy: number,
  targetWpm: number,
  targetAccuracy: number,
): number {
  if (wpm >= targetWpm * 1.3 && accuracy >= 95) return 3
  if (wpm >= targetWpm && accuracy >= targetAccuracy) return 2
  if (accuracy >= targetAccuracy - 5) return 1
  return 0
}

/**
 * Complete lesson view combining SessionStats, TypingArea, HebrewKeyboard,
 * and FingerGuide with full lesson lifecycle management.
 */
export function LessonView({ lessonId }: LessonViewProps) {
  const session = useTypingSessionStore()
  const xpStore = useXpStore()

  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [result, setResult] = useState<ResultState | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // Refs to avoid stale closures in effects
  const pressedKeyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCorrectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevIndexRef = useRef(0)

  const lesson = getLessonById(lessonId)
  const content = getLessonContent(lessonId)
  const lines = content?.lines ?? []

  // ── Mount: start the first line ──────────────────────────────────────────
  useEffect(() => {
    if (!lesson || lines.length === 0) return

    setCurrentLineIndex(0)
    setShowResults(false)
    setResult(null)
    setElapsed(0)
    prevIndexRef.current = 0

    session.startSession(lines[0], lessonId)

    // Elapsed timer
    elapsedTimerRef.current = setInterval(() => {
      if (session.startedAt !== null) {
        setElapsed(performance.now() - session.startedAt)
      }
    }, 250)

    return () => {
      if (elapsedTimerRef.current !== null) {
        clearInterval(elapsedTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  // ── Elapsed timer: keep ticking after re-renders ──────────────────────
  useEffect(() => {
    if (!session.isActive || session.startedAt === null) return

    elapsedTimerRef.current = setInterval(() => {
      setElapsed(performance.now() - (session.startedAt ?? 0))
    }, 250)

    return () => {
      if (elapsedTimerRef.current !== null) clearInterval(elapsedTimerRef.current)
    }
  }, [session.isActive, session.startedAt])

  // ── Watch currentIndex for line-complete logic ────────────────────────
  useEffect(() => {
    const { currentIndex, text, isActive, startedAt, keystrokes } = session

    if (!isActive || !lesson || text.length === 0) return
    if (currentIndex < text.length) return // not done yet

    // Line is complete
    const linesDone = currentLineIndex + 1

    if (linesDone < lines.length) {
      // Advance to the next line
      const next = currentLineIndex + 1
      setCurrentLineIndex(next)
      session.nextLine(lines[next])
      prevIndexRef.current = 0
    } else {
      // All lines done — compute final stats and show results
      session.endSession()

      if (elapsedTimerRef.current !== null) clearInterval(elapsedTimerRef.current)

      const finalStats = startedAt !== null
        ? computeSessionStats(keystrokes, startedAt, performance.now())
        : null

      if (finalStats && lesson) {
        const passed = isLessonComplete(
          finalStats,
          lesson.targetWpm,
          lesson.targetAccuracy,
        )
        const xpReward = calculateXpReward(
          finalStats,
          lesson.targetWpm,
          lesson.targetAccuracy,
          xpStore.streak,
        )
        const stars = calculateStars(
          finalStats.wpm,
          finalStats.accuracy,
          lesson.targetWpm,
          lesson.targetAccuracy,
        )

        if (passed) {
          xpStore.completeLesson(lessonId, finalStats.wpm, finalStats.accuracy)
          xpStore.addXp(xpReward.total)
        }
        xpStore.updateStreak()

        setResult({
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
          xpEarned: xpReward.total,
          stars,
          passed,
        })
      }

      setShowResults(true)
    }
  // Only re-run when currentIndex changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.currentIndex])

  // ── Key press handler ─────────────────────────────────────────────────
  const handleKeyPress = useCallback(
    (key: string, code: string) => {
      const prevIndex = session.currentIndex

      session.typeKey(key, code)

      // Determine correctness after the store updates
      // (index advances on correct key, stays on wrong key)
      const wasCorrect = session.currentIndex > prevIndex

      // Pressed key flash (100 ms)
      setPressedKey(key)
      if (pressedKeyTimerRef.current !== null) clearTimeout(pressedKeyTimerRef.current)
      pressedKeyTimerRef.current = setTimeout(() => setPressedKey(null), 100)

      // Correct/incorrect flash (200 ms)
      setLastCorrect(wasCorrect)
      if (lastCorrectTimerRef.current !== null) clearTimeout(lastCorrectTimerRef.current)
      lastCorrectTimerRef.current = setTimeout(() => setLastCorrect(null), 200)
    },
    [session],
  )

  // ── Retry ─────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (!lesson || lines.length === 0) return
    setCurrentLineIndex(0)
    setShowResults(false)
    setResult(null)
    setElapsed(0)
    session.startSession(lines[0], lessonId)
  }, [lesson, lines, lessonId, session])

  // ── Computed values ───────────────────────────────────────────────────
  const realtimeWpm = session.getRealtimeWpm()
  const accuracy = session.keystrokes.length === 0
    ? 100
    : Math.round(
        (session.keystrokes.filter((k) => k.isCorrect).length /
          session.keystrokes.length) *
          100,
      )
  const activeChar = session.text[session.currentIndex] ?? undefined

  if (!lesson || !content) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        שיעור לא נמצא
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6" dir="rtl">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold sm:text-2xl">{lesson.titleHe}</h1>
            <Badge variant="secondary">רמה {lesson.level}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{lesson.descriptionHe}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>יעד: {lesson.targetWpm} מ/ד</span>
          <span>דיוק: {lesson.targetAccuracy}%</span>
          <span className="text-xs opacity-60">
            שורה {currentLineIndex + 1} / {lines.length}
          </span>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <SessionStats
        wpm={realtimeWpm}
        accuracy={accuracy}
        keystrokes={session.keystrokes.length}
        elapsed={elapsed}
      />

      {/* ── Typing area ───────────────────────────────────────────── */}
      <TypingArea
        text={session.text}
        currentIndex={session.currentIndex}
        keystrokes={session.keystrokes}
        isActive={session.isActive && !showResults}
        onKeyPress={handleKeyPress}
      />

      {/* ── Keyboard ──────────────────────────────────────────────── */}
      <HebrewKeyboard
        activeKey={activeChar}
        pressedKey={pressedKey ?? undefined}
        lastCorrect={lastCorrect}
      />

      {/* ── Finger guide ──────────────────────────────────────────── */}
      <FingerGuide activeChar={activeChar} />

      {/* ── Results modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showResults && result !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm"
            >
              <Card className="gap-4 py-6">
                <CardHeader className="pb-0">
                  <CardTitle className="text-center text-lg">
                    {result.passed ? 'כל הכבוד! השיעור הושלם' : 'שיעור הסתיים'}
                  </CardTitle>
                  {/* Stars */}
                  <div
                    className="flex justify-center gap-1 text-3xl"
                    aria-label={`${result.stars} כוכבים`}
                  >
                    {Array.from({ length: 3 }, (_, i) => (
                      <span
                        key={i}
                        className={
                          i < result.stars
                            ? 'text-yellow-400'
                            : 'text-muted-foreground/30'
                        }
                        aria-hidden
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Stats summary */}
                  <div className="flex justify-around text-center">
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{result.wpm}</p>
                      <p className="text-xs text-muted-foreground">מילים/דקה</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{result.accuracy}%</p>
                      <p className="text-xs text-muted-foreground">דיוק</p>
                    </div>
                    <div>
                      <motion.p
                        className="text-2xl font-bold tabular-nums text-primary"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.18 }}
                      >
                        +{result.xpEarned}
                      </motion.p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleRetry}
                    >
                      נסה שוב
                    </Button>
                    {result.passed && (
                      <Button
                        className="flex-1"
                        onClick={() => {
                          // Navigate to next lesson — parent route handles this
                          const nextLevel = lesson.level + 1
                          if (nextLevel <= 20) {
                            window.location.href = `/lessons/lesson-${String(nextLevel).padStart(2, '0')}`
                          }
                        }}
                      >
                        שיעור הבא
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
