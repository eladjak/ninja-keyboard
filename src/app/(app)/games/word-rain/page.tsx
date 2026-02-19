'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Heart, Zap, Trophy, RotateCcw, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useXpStore } from '@/stores/xp-store'
import { soundManager } from '@/lib/audio/sound-manager'
import { useSettingsStore } from '@/stores/settings-store'
import {
  createWordRainState,
  spawnWord,
  tick,
  processInput,
  calculateFinalScore,
  getXpReward,
  DIFFICULTY_CONFIG,
} from '@/lib/games/word-rain'
import type { Difficulty, WordRainState } from '@/lib/games/word-rain'
import { cn } from '@/lib/utils'

const TICK_INTERVAL = 50
const ELAPSED_INTERVAL = 1000

export default function WordRainPage() {
  const [state, setState] = useState<WordRainState>(createWordRainState('easy'))
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const { soundEnabled, soundVolume } = useSettingsStore()
  const xpStore = useXpStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
    soundManager.setVolume(soundVolume)
  }, [soundEnabled, soundVolume])

  const clearAllTimers = useCallback(() => {
    if (tickRef.current !== null) { clearInterval(tickRef.current); tickRef.current = null }
    if (spawnRef.current !== null) { clearInterval(spawnRef.current); spawnRef.current = null }
    if (elapsedRef.current !== null) { clearInterval(elapsedRef.current); elapsedRef.current = null }
  }, [])

  // Cleanup on unmount
  useEffect(() => clearAllTimers, [clearAllTimers])

  const startGame = useCallback(() => {
    clearAllTimers()
    const initial = { ...createWordRainState(selectedDifficulty), phase: 'playing' as const }
    setState(initial)

    // Game tick
    tickRef.current = setInterval(() => {
      setState((prev) => tick(prev))
    }, TICK_INTERVAL)

    // Spawn words
    const config = DIFFICULTY_CONFIG[selectedDifficulty]
    spawnRef.current = setInterval(() => {
      setState((prev) => spawnWord(prev))
    }, config.spawnIntervalMs)

    // Elapsed timer
    elapsedRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }))
    }, ELAPSED_INTERVAL)

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [selectedDifficulty, clearAllTimers])

  // Stop timers on gameover
  useEffect(() => {
    if (state.phase === 'gameover') {
      clearAllTimers()
      const finalScore = calculateFinalScore(state)
      const xp = getXpReward(finalScore.totalScore)
      xpStore.addXp(xp)
      xpStore.updateStreak()
      soundManager.playLevelComplete()
    }
  }, [state.phase, clearAllTimers, xpStore]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setState((prev) => {
      const next = processInput(prev, value)
      if (next.wordsTyped > prev.wordsTyped) {
        soundManager.playCorrect()
      }
      return next
    })
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setState((prev) => ({ ...prev, input: '' }))
    }
  }, [])

  const finalScore = state.phase === 'gameover' ? calculateFinalScore(state) : null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">גשם מילים</h1>
          <p className="text-sm text-muted-foreground">הקלד את המילים לפני שהן מגיעות למטה!</p>
        </div>
        <CloudRain className="size-8 text-blue-500" />
      </div>

      {/* Ready screen */}
      {state.phase === 'ready' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <span className="text-5xl" role="img" aria-label="גשם">🌧️</span>
            <h2 className="text-lg font-bold">בחר רמת קושי</h2>

            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {DIFFICULTY_CONFIG[diff].label}
                </Button>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>❤️ {DIFFICULTY_CONFIG[selectedDifficulty].lives} חיים</p>
              <p>מילים נופלות מלמעלה - הקלד אותן בזמן!</p>
            </div>

            <Button size="lg" className="gap-2 text-lg" onClick={startGame}>
              <Play className="size-5" />
              התחל משחק
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Playing screen */}
      {state.phase === 'playing' && (
        <>
          {/* HUD */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: state.maxLives }).map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      'size-5',
                      i < state.lives ? 'fill-red-500 text-red-500' : 'text-muted-foreground/30',
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold tabular-nums">{state.score} נק&apos;</span>
              {state.combo > 1 && (
                <span className="font-bold text-primary">x{state.combo}</span>
              )}
            </div>
          </div>

          {/* Game area */}
          <div
            className="relative h-80 overflow-hidden rounded-lg border bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-950/30 dark:to-sky-900/30 sm:h-96"
            aria-label="אזור משחק"
          >
            <AnimatePresence>
              {state.words.map((word) => (
                <motion.div
                  key={word.id}
                  className={cn(
                    'absolute flex items-center justify-center rounded-lg px-3 py-1 text-sm font-bold shadow-sm',
                    word.active
                      ? 'border-2 border-primary bg-primary/10 text-primary'
                      : 'border bg-background text-foreground',
                  )}
                  style={{
                    right: `${word.x}%`,
                    top: `${word.y}%`,
                    transform: 'translateX(50%)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  {word.word}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bottom danger zone */}
            <div className="absolute bottom-0 start-0 end-0 h-2 bg-red-500/20" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={state.input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border-2 border-primary/50 bg-background px-4 py-3 text-center text-lg font-bold outline-none focus:border-primary"
            placeholder="הקלד כאן..."
            aria-label="הקלד את המילה"
            autoComplete="off"
            dir="rtl"
          />
        </>
      )}

      {/* Game over */}
      {state.phase === 'gameover' && finalScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">המשחק נגמר!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Trophy className="size-12 text-amber-500" />
                <span className="text-3xl font-bold text-primary">{finalScore.totalScore}</span>
                <span className="text-sm text-muted-foreground">ניקוד סופי</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border p-3">
                  <p className="text-xl font-bold tabular-nums">{state.wordsTyped}</p>
                  <p className="text-xs text-muted-foreground">מילים</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xl font-bold tabular-nums">{state.bestCombo}</p>
                  <p className="text-xs text-muted-foreground">קומבו מקסימלי</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xl font-bold tabular-nums">{finalScore.baseScore}</p>
                  <p className="text-xs text-muted-foreground">ניקוד בסיס</p>
                </div>
                <div className="rounded-lg border p-3">
                  <motion.p
                    className="text-xl font-bold tabular-nums text-primary"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.18 }}
                  >
                    +{getXpReward(finalScore.totalScore)}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={startGame}>
                <RotateCcw className="size-4" />
                שחק שוב
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
