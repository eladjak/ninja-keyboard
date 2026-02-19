'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Zap, Target, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/sharing/share-button'
import { generateSpeedTestShareText } from '@/lib/sharing/share-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypingArea } from '@/components/typing/typing-area'
import { HebrewKeyboard } from '@/components/typing/hebrew-keyboard'
import { useTypingSessionStore } from '@/stores/typing-session-store'
import { useSettingsStore } from '@/stores/settings-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { useXpStore } from '@/stores/xp-store'
import { soundManager } from '@/lib/audio/sound-manager'
import { computeSessionStats } from '@/lib/typing-engine/engine'
import {
  generateSpeedTestText,
  getSpeedRank,
  SPEED_RANK_LABELS,
} from '@/lib/challenges/speed-test'
import { cn } from '@/lib/utils'

const TEST_DURATION = 60 // 1 minute

export default function SpeedTestPage() {
  const session = useTypingSessionStore()
  const { soundEnabled, soundVolume } = useSettingsStore()
  const practiceHistory = usePracticeHistoryStore()
  const xpStore = useXpStore()

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
    soundManager.setVolume(soundVolume)
  }, [soundEnabled, soundVolume])

  const [phase, setPhase] = useState<'ready' | 'typing' | 'done'>('ready')
  const [remaining, setRemaining] = useState(TEST_DURATION)
  const [result, setResult] = useState<{
    wpm: number
    accuracy: number
    totalKeystrokes: number
    rank: ReturnType<typeof getSpeedRank>
    xpEarned: number
  } | null>(null)

  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pressedRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const correctRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const testText = useMemo(() => generateSpeedTestText(Date.now()), [])

  // ── Start test ──────────────────────────────────────────────
  const startTest = useCallback(() => {
    setPhase('typing')
    setRemaining(TEST_DURATION)
    setResult(null)
    session.startSession(testText, null)

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [testText, session])

  // ── End test ────────────────────────────────────────────────
  const endTest = useCallback(() => {
    setPhase('done')
    session.endSession()

    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const stats =
      session.startedAt !== null && session.keystrokes.length > 0
        ? computeSessionStats(session.keystrokes, session.startedAt, performance.now())
        : null

    if (stats) {
      const rank = getSpeedRank(stats.wpm)
      const xpEarned = Math.max(10, Math.round(10 + stats.wpm))

      xpStore.addXp(xpEarned)
      xpStore.updateStreak()
      soundManager.playLevelComplete()

      practiceHistory.addResult({
        textId: 'speed-test',
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationMs: stats.durationMs,
        totalKeystrokes: stats.totalKeystrokes,
        correctKeystrokes: stats.correctKeystrokes,
        keyAccuracy: stats.keyAccuracy,
        completedAt: Date.now(),
        timerDuration: TEST_DURATION,
      })

      setResult({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        totalKeystrokes: stats.totalKeystrokes,
        rank,
        xpEarned,
      })
    }
  }, [session, practiceHistory, xpStore])

  // ── Timer expiry ────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'typing' && remaining === 0) {
      endTest()
    }
  }, [remaining, phase, endTest])

  // ── Text completion ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'typing') return
    if (session.currentIndex >= session.text.length && session.text.length > 0) {
      endTest()
    }
  }, [session.currentIndex, session.text.length, phase, endTest])

  // ── Cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current)
    }
  }, [])

  // ── Key press ───────────────────────────────────────────────
  const handleKeyPress = useCallback(
    (key: string, code: string) => {
      if (phase !== 'typing') return

      const prevIndex = session.currentIndex
      session.typeKey(key, code)
      const wasCorrect = session.currentIndex > prevIndex

      soundManager.playKeyClick()
      if (wasCorrect) soundManager.playCorrect()
      else soundManager.playError()

      setPressedKey(key)
      if (pressedRef.current !== null) clearTimeout(pressedRef.current)
      pressedRef.current = setTimeout(() => setPressedKey(null), 100)

      setLastCorrect(wasCorrect)
      if (correctRef.current !== null) clearTimeout(correctRef.current)
      correctRef.current = setTimeout(() => setLastCorrect(null), 200)
    },
    [phase, session],
  )

  const handleRetry = useCallback(() => {
    setPhase('ready')
    setRemaining(TEST_DURATION)
    setResult(null)
    session.endSession()
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [session])

  const activeChar = session.text[session.currentIndex] ?? undefined

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">מבחן מהירות</h1>
          <p className="text-sm text-muted-foreground">דקה אחת. כמה מהר אתה?</p>
        </div>
        <Timer className="size-8 text-primary" />
      </div>

      {/* Timer display */}
      {phase === 'typing' && (
        <Card>
          <CardContent className="flex items-center justify-center gap-4 px-4 py-3">
            <Timer className={cn('size-6', remaining <= 10 ? 'text-red-500' : 'text-primary')} />
            <span
              className={cn(
                'text-3xl font-bold tabular-nums',
                remaining <= 10 && 'text-red-500',
              )}
            >
              0:{String(remaining).padStart(2, '0')}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Ready state */}
      {phase === 'ready' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="text-center space-y-2">
              <span className="text-5xl" role="img" aria-label="טיימר">
                ⏱️
              </span>
              <h2 className="text-lg font-bold">מבחן מהירות הקלדה - דקה אחת</h2>
              <p className="text-sm text-muted-foreground">
                הקלד כמה שיותר מהר ומדויק. התוצאה שלך תקבע את הדרגה!
              </p>
            </div>
            <Button size="lg" className="gap-2 text-lg" onClick={startTest}>
              <Zap className="size-5" />
              התחל מבחן
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Typing area */}
      {phase === 'typing' && (
        <>
          <TypingArea
            text={session.text}
            currentIndex={session.currentIndex}
            keystrokes={session.keystrokes}
            isActive={true}
            onKeyPress={handleKeyPress}
          />
          <HebrewKeyboard
            activeKey={activeChar}
            pressedKey={pressedKey ?? undefined}
            lastCorrect={lastCorrect}
          />
        </>
      )}

      {/* Results */}
      <AnimatePresence>
        {phase === 'done' && result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">תוצאות מבחן מהירות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rank badge */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl">{SPEED_RANK_LABELS[result.rank].emoji}</span>
                  <span className={cn('text-xl font-bold', SPEED_RANK_LABELS[result.rank].color)}>
                    {SPEED_RANK_LABELS[result.rank].he}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg border p-3">
                    <Zap className="mx-auto size-4 text-muted-foreground" />
                    <p className="text-2xl font-bold tabular-nums">{result.wpm}</p>
                    <p className="text-xs text-muted-foreground">מילים/דקה</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <Target className="mx-auto size-4 text-muted-foreground" />
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

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleRetry}>
                    <RotateCcw className="size-4" />
                    נסה שוב
                  </Button>
                  <ShareButton
                    text={generateSpeedTestShareText({
                      wpm: result.wpm,
                      accuracy: result.accuracy,
                      rank: result.rank,
                      rankLabel: SPEED_RANK_LABELS[result.rank].he,
                    })}
                    className="flex-1"
                  />
                  <Button className="flex-1 gap-2" onClick={handleRetry}>
                    <Zap className="size-4" />
                    מבחן חדש
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
