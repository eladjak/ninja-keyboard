'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, Target, Zap, RotateCcw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypingArea } from '@/components/typing/typing-area'
import { HebrewKeyboard } from '@/components/typing/hebrew-keyboard'
import { SessionStats } from '@/components/typing/session-stats'
import { PracticeTimer, TIMER_DURATIONS, TIMER_LABELS } from '@/components/practice/practice-timer'
import type { TimerDuration } from '@/components/practice/practice-timer'
import { useTypingSessionStore } from '@/stores/typing-session-store'
import { useSettingsStore } from '@/stores/settings-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { useXpStore } from '@/stores/xp-store'
import { soundManager } from '@/lib/audio/sound-manager'
import { computeSessionStats } from '@/lib/typing-engine/engine'
import { PRACTICE_TEXTS } from '@/lib/content/practice-texts'
import type { PracticeText } from '@/lib/content/practice-texts'
import { cn } from '@/lib/utils'

/** Difficulty badge colors */
const DIFFICULTY_COLORS: Record<PracticeText['difficulty'], string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const DIFFICULTY_LABELS: Record<PracticeText['difficulty'], string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'מאתגר',
}

interface PracticeResultState {
  wpm: number
  accuracy: number
  totalKeystrokes: number
  correctKeystrokes: number
  errorKeystrokes: number
  durationMs: number
  keyAccuracy: Record<string, { correct: number; total: number }>
  xpEarned: number
}

export default function PracticePage() {
  const session = useTypingSessionStore()
  const { soundEnabled, soundVolume } = useSettingsStore()
  const practiceHistory = usePracticeHistoryStore()
  const xpStore = useXpStore()

  // Keep sound in sync
  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
    soundManager.setVolume(soundVolume)
  }, [soundEnabled, soundVolume])

  const [selectedText, setSelectedText] = useState<PracticeText>(PRACTICE_TEXTS[0])
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [showTextSelector, setShowTextSelector] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<PracticeResultState | null>(null)
  const [elapsed, setElapsed] = useState(0)

  // Key press visual state
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const pressedKeyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCorrectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Start session ──────────────────────────────────────────────
  const startPractice = useCallback(() => {
    setHasStarted(true)
    setShowResults(false)
    setResult(null)
    setElapsed(0)
    session.startSession(selectedText.text, null)
    setTimerRunning(true)

    elapsedTimerRef.current = setInterval(() => {
      if (session.startedAt !== null) {
        setElapsed(performance.now() - session.startedAt)
      }
    }, 250)
  }, [selectedText, session])

  // ── End session (timer finish or text complete) ────────────────
  const endPractice = useCallback(() => {
    setTimerRunning(false)
    session.endSession()

    if (elapsedTimerRef.current !== null) {
      clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = null
    }

    const stats =
      session.startedAt !== null && session.keystrokes.length > 0
        ? computeSessionStats(session.keystrokes, session.startedAt, performance.now())
        : null

    if (stats) {
      // Calculate XP: base 5 + 1 per WPM above 10
      const xpEarned = Math.max(5, Math.round(5 + Math.max(0, stats.wpm - 10)))

      xpStore.addXp(xpEarned)
      xpStore.updateStreak()
      soundManager.playLevelComplete()

      practiceHistory.addResult({
        textId: selectedText.id,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationMs: stats.durationMs,
        totalKeystrokes: stats.totalKeystrokes,
        correctKeystrokes: stats.correctKeystrokes,
        keyAccuracy: stats.keyAccuracy,
        completedAt: Date.now(),
        timerDuration,
      })

      setResult({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        totalKeystrokes: stats.totalKeystrokes,
        correctKeystrokes: stats.correctKeystrokes,
        errorKeystrokes: stats.errorKeystrokes,
        durationMs: stats.durationMs,
        keyAccuracy: stats.keyAccuracy,
        xpEarned,
      })
    }

    setShowResults(true)
  }, [session, selectedText, timerDuration, practiceHistory, xpStore])

  // ── Watch for text completion ──────────────────────────────────
  useEffect(() => {
    if (!hasStarted || !session.isActive) return
    if (session.currentIndex >= session.text.length && session.text.length > 0) {
      endPractice()
    }
  }, [session.currentIndex, session.text.length, session.isActive, hasStarted, endPractice])

  // ── Elapsed timer sync ─────────────────────────────────────────
  useEffect(() => {
    if (!session.isActive || session.startedAt === null) return

    elapsedTimerRef.current = setInterval(() => {
      setElapsed(performance.now() - (session.startedAt ?? 0))
    }, 250)

    return () => {
      if (elapsedTimerRef.current !== null) clearInterval(elapsedTimerRef.current)
    }
  }, [session.isActive, session.startedAt])

  // ── Key press handler ──────────────────────────────────────────
  const handleKeyPress = useCallback(
    (key: string, code: string) => {
      if (!hasStarted || showResults) return

      const prevIndex = session.currentIndex
      session.typeKey(key, code)
      const wasCorrect = session.currentIndex > prevIndex

      soundManager.playKeyClick()
      if (wasCorrect) {
        soundManager.playCorrect()
      } else {
        soundManager.playError()
      }

      setPressedKey(key)
      if (pressedKeyTimerRef.current !== null) clearTimeout(pressedKeyTimerRef.current)
      pressedKeyTimerRef.current = setTimeout(() => setPressedKey(null), 100)

      setLastCorrect(wasCorrect)
      if (lastCorrectTimerRef.current !== null) clearTimeout(lastCorrectTimerRef.current)
      lastCorrectTimerRef.current = setTimeout(() => setLastCorrect(null), 200)
    },
    [hasStarted, showResults, session],
  )

  // ── Timer handlers ─────────────────────────────────────────────
  const handleTimerStart = useCallback(() => {
    if (!hasStarted) {
      startPractice()
    } else {
      setTimerRunning(true)
      session.resume()
    }
  }, [hasStarted, startPractice, session])

  const handleTimerPause = useCallback(() => {
    setTimerRunning(false)
    session.pause()
  }, [session])

  const handleTimerFinish = useCallback(() => {
    endPractice()
  }, [endPractice])

  const handleTimerReset = useCallback(() => {
    setTimerRunning(false)
    setHasStarted(false)
    setShowResults(false)
    setResult(null)
    setElapsed(0)
    session.endSession()
    if (elapsedTimerRef.current !== null) {
      clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = null
    }
  }, [session])

  // ── Retry ──────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    handleTimerReset()
    // Small delay for state to settle
    setTimeout(() => {
      startPractice()
    }, 50)
  }, [handleTimerReset, startPractice])

  // ── Computed values ────────────────────────────────────────────
  const realtimeWpm = session.getRealtimeWpm()
  const accuracy =
    session.keystrokes.length === 0
      ? 100
      : Math.round(
          (session.keystrokes.filter((k) => k.isCorrect).length /
            session.keystrokes.length) *
            100,
        )
  const activeChar = session.text[session.currentIndex] ?? undefined

  // ── Find top 5 error keys from result ──────────────────────────
  const errorKeys =
    result?.keyAccuracy
      ? Object.entries(result.keyAccuracy)
          .filter(([, data]) => data.total >= 2)
          .map(([char, data]) => ({
            char,
            accuracy: Math.round((data.correct / data.total) * 100),
            errors: data.total - data.correct,
          }))
          .filter((k) => k.accuracy < 100)
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 5)
      : []

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4" dir="rtl">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">תרגול חופשי</h1>
          <p className="text-sm text-muted-foreground">
            בחר טקסט וזמן, והתחל לתרגל
          </p>
        </div>
        <Keyboard className="size-8 text-primary" />
      </div>

      {/* ── Text selector ───────────────────────────────────────── */}
      {!hasStarted && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">בחר טקסט לתרגול</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowTextSelector((p) => !p)}
              aria-expanded={showTextSelector}
            >
              <span className="flex items-center gap-2">
                {selectedText.titleHe}
                <Badge
                  className={cn(
                    'text-xs',
                    DIFFICULTY_COLORS[selectedText.difficulty],
                  )}
                  variant="secondary"
                >
                  {DIFFICULTY_LABELS[selectedText.difficulty]}
                </Badge>
              </span>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  showTextSelector && 'rotate-180',
                )}
              />
            </Button>

            <AnimatePresence>
              {showTextSelector && (
                <motion.div
                  className="space-y-1"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {PRACTICE_TEXTS.map((text) => (
                    <button
                      key={text.id}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-start text-sm transition-colors',
                        'hover:bg-muted/80',
                        selectedText.id === text.id && 'bg-muted',
                      )}
                      onClick={() => {
                        setSelectedText(text)
                        setShowTextSelector(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{text.titleHe}</span>
                        <Badge
                          className={cn(
                            'text-xs',
                            DIFFICULTY_COLORS[text.difficulty],
                          )}
                          variant="secondary"
                        >
                          {DIFFICULTY_LABELS[text.difficulty]}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {text.text.slice(0, 60)}...
                      </p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* ── Timer ───────────────────────────────────────────────── */}
      <PracticeTimer
        duration={timerDuration}
        onDurationChange={setTimerDuration}
        isRunning={timerRunning}
        onStart={handleTimerStart}
        onPause={handleTimerPause}
        onFinish={handleTimerFinish}
        onReset={handleTimerReset}
      />

      {/* ── Stats bar (visible during practice) ─────────────────── */}
      {hasStarted && !showResults && (
        <SessionStats
          wpm={realtimeWpm}
          accuracy={accuracy}
          keystrokes={session.keystrokes.length}
          elapsed={elapsed}
        />
      )}

      {/* ── Typing area ─────────────────────────────────────────── */}
      {hasStarted && !showResults && (
        <TypingArea
          text={session.text}
          currentIndex={session.currentIndex}
          keystrokes={session.keystrokes}
          isActive={session.isActive && timerRunning}
          onKeyPress={handleKeyPress}
        />
      )}

      {/* ── Keyboard ────────────────────────────────────────────── */}
      {hasStarted && !showResults && (
        <HebrewKeyboard
          activeKey={activeChar}
          pressedKey={pressedKey ?? undefined}
          lastCorrect={lastCorrect}
        />
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showResults && result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">
                  סיכום תרגול
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Zap className="size-4" />
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{result.wpm}</p>
                    <p className="text-xs text-muted-foreground">מילים/דקה</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Target className="size-4" />
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{result.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">דיוק</p>
                  </div>
                  <div className="rounded-lg border p-3">
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

                {/* Detailed stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">הקשות</span>
                    <span className="font-medium">{result.totalKeystrokes}</span>
                  </div>
                  <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">נכונות</span>
                    <span className="font-medium text-green-600">{result.correctKeystrokes}</span>
                  </div>
                  <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">שגיאות</span>
                    <span className="font-medium text-red-600">{result.errorKeystrokes}</span>
                  </div>
                  <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">זמן</span>
                    <span className="font-medium">
                      {Math.floor(result.durationMs / 1000)}ש&apos;
                    </span>
                  </div>
                </div>

                {/* Error keys */}
                {errorKeys.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">מקשים בעייתיים</h3>
                    <div className="flex flex-wrap gap-2">
                      {errorKeys.map((k) => (
                        <div
                          key={k.char}
                          className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-sm dark:border-red-900 dark:bg-red-900/20"
                        >
                          <span className="font-mono font-bold">{k.char}</span>
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {k.accuracy}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleTimerReset}
                  >
                    <RotateCcw className="me-2 size-4" />
                    בחר טקסט
                  </Button>
                  <Button className="flex-1" onClick={handleRetry}>
                    נסה שוב
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
