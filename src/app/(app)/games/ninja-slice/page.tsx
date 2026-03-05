'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword, Heart, Trophy, RotateCcw, Play, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useXpStore } from '@/stores/xp-store'
import {
  createNinjaSliceState,
  spawnTarget,
  tick,
  processInput,
  calculateFinalScore,
  getXpReward,
  SLICE_DIFFICULTY_CONFIG,
} from '@/lib/games/ninja-slice'
import type { SliceDifficulty, NinjaSliceState } from '@/lib/games/ninja-slice'
import { soundManager } from '@/lib/audio/sound-manager'
import { useSettingsStore } from '@/stores/settings-store'
import { cn } from '@/lib/utils'

const TICK_INTERVAL = 50
const ELAPSED_INTERVAL = 1000

/** Map a direction to the CSS translate that animates the target entering the field */
function getEntryTranslate(direction: string): string {
  switch (direction) {
    case 'right':  return 'translateX(-40px)'
    case 'left':   return 'translateX(40px)'
    case 'top':    return 'translateY(-40px)'
    case 'bottom': return 'translateY(40px)'
    default:       return 'translateX(0)'
  }
}

export default function NinjaSlicePage() {
  const [state, setState] = useState<NinjaSliceState>(createNinjaSliceState('easy'))
  const [selectedDifficulty, setSelectedDifficulty] = useState<SliceDifficulty>('easy')
  const [sliceEffect, setSliceEffect] = useState<string | null>(null)
  const xpStore = useXpStore()
  const { soundEnabled, soundVolume } = useSettingsStore()

  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
    soundManager.setVolume(soundVolume)
  }, [soundEnabled, soundVolume])

  const inputRef = useRef<HTMLInputElement>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (tickRef.current !== null)   { clearInterval(tickRef.current);   tickRef.current   = null }
    if (spawnRef.current !== null)  { clearInterval(spawnRef.current);  spawnRef.current  = null }
    if (elapsedRef.current !== null){ clearInterval(elapsedRef.current); elapsedRef.current = null }
  }, [])

  // Cleanup on unmount
  useEffect(() => clearAllTimers, [clearAllTimers])

  const startGame = useCallback(() => {
    clearAllTimers()
    const initial: NinjaSliceState = { ...createNinjaSliceState(selectedDifficulty), phase: 'playing' }
    setState(initial)

    // Game tick — move targets
    tickRef.current = setInterval(() => {
      setState((prev) => tick(prev))
    }, TICK_INTERVAL)

    // Spawn targets
    const config = SLICE_DIFFICULTY_CONFIG[selectedDifficulty]
    spawnRef.current = setInterval(() => {
      setState((prev) => spawnTarget(prev))
    }, config.spawnIntervalMs)

    // Elapsed timer
    elapsedRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }))
    }, ELAPSED_INTERVAL)

    // Focus the input
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [selectedDifficulty, clearAllTimers])

  // Stop timers and award XP on gameover
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
      if (next.targetsSliced > prev.targetsSliced) {
        soundManager.playNinjaSlash()
        // Show a brief slice effect
        setSliceEffect(value)
        setTimeout(() => setSliceEffect(null), 400)
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

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">חיתוך נינג&apos;ה</h1>
          <p className="text-sm text-muted-foreground">חתכו אותיות ומילים לפני שהן בורחות!</p>
        </div>
        <Sword className="size-8 text-purple-500" />
      </div>

      {/* Ready screen */}
      {state.phase === 'ready' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <span className="text-5xl" role="img" aria-label="חרב">⚔️</span>
            <h2 className="text-lg font-bold">בחר רמת קושי</h2>

            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  onClick={() => setSelectedDifficulty(diff)}
                  aria-pressed={selectedDifficulty === diff}
                >
                  {SLICE_DIFFICULTY_CONFIG[diff].label}
                </Button>
              ))}
            </div>

            <div className="space-y-1 text-center text-sm text-muted-foreground">
              <p>❤️ {SLICE_DIFFICULTY_CONFIG[selectedDifficulty].lives} חיים</p>
              {selectedDifficulty === 'easy' && <p>אותיות בודדות — קצב איטי</p>}
              {selectedDifficulty === 'medium' && <p>צירופי אותיות — קצב בינוני</p>}
              {selectedDifficulty === 'hard' && <p>מילים שלמות — קצב מהיר</p>}
              <p className="pt-1">הקלד את הטקסט לפני שהוא יוצא מהמסך!</p>
            </div>

            <Button
              size="lg"
              className="gap-2 text-lg"
              onClick={startGame}
              aria-label="התחל משחק חיתוך נינג'ה"
            >
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
          <div
            className="flex items-center justify-between rounded-lg border px-4 py-2"
            aria-label="סטטוס משחק"
          >
            {/* Lives */}
            <div className="flex items-center gap-1" aria-label={`${state.lives} חיים נותרו`}>
              {Array.from({ length: state.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'size-5',
                    i < state.lives
                      ? 'fill-red-500 text-red-500'
                      : 'text-muted-foreground/30',
                  )}
                />
              ))}
            </div>

            {/* Score + combo + time */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground tabular-nums">{formatTime(state.elapsedSeconds)}</span>
              <span className="font-bold tabular-nums">{state.score} נק&apos;</span>
              {state.combo > 1 && (
                <motion.span
                  key={state.combo}
                  className="flex items-center gap-1 font-bold text-purple-500"
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <Zap className="size-3" />
                  x{state.combo}
                </motion.span>
              )}
            </div>
          </div>

          {/* Game field */}
          <div
            className="relative h-80 overflow-hidden rounded-lg border bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-900/30 sm:h-96"
            aria-label="שדה משחק"
            aria-live="polite"
          >
            <AnimatePresence>
              {state.targets.map((target) => (
                <motion.div
                  key={target.id}
                  className="absolute flex items-center justify-center rounded-lg border border-purple-300 bg-background px-3 py-1 text-base font-bold shadow-md"
                  style={{
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ opacity: 0, scale: 0.6, transform: `translate(-50%, -50%) ${getEntryTranslate(target.direction)}` }}
                  animate={{ opacity: 1, scale: 1, transform: 'translate(-50%, -50%) translateX(0) translateY(0)' }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.15 }}
                  aria-label={`מטרה: ${target.text}`}
                >
                  {target.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Slice flash effect */}
            <AnimatePresence>
              {sliceEffect && (
                <motion.div
                  key={sliceEffect + Date.now()}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="text-4xl font-black text-purple-500">⚡</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edge danger indicators */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute start-0 top-0 bottom-0 w-2 bg-red-500/20" aria-hidden="true" />
              <div className="absolute end-0 top-0 bottom-0 w-2 bg-red-500/20" aria-hidden="true" />
              <div className="absolute start-0 end-0 top-0 h-2 bg-red-500/20" aria-hidden="true" />
              <div className="absolute start-0 end-0 bottom-0 h-2 bg-red-500/20" aria-hidden="true" />
            </div>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={state.input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border-2 border-purple-500/50 bg-background px-4 py-3 text-center text-lg font-bold outline-none focus:border-purple-500"
            placeholder="הקלד כאן..."
            aria-label="הקלד את האות או המילה"
            autoComplete="off"
            dir="rtl"
          />

          {/* Stats bar */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>חתכו: <strong className="text-foreground">{state.targetsSliced}</strong></span>
            <span>פספסו: <strong className="text-foreground">{state.targetsMissed}</strong></span>
            <span>קומבו מקס: <strong className="text-foreground">{state.bestCombo}</strong></span>
          </div>
        </>
      )}

      {/* Game over */}
      {state.phase === 'gameover' && finalScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
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
                  <p className="text-xl font-bold tabular-nums">{state.targetsSliced}</p>
                  <p className="text-xs text-muted-foreground">חתכים</p>
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

              <div className="grid grid-cols-3 gap-2 text-center text-sm text-muted-foreground">
                <div>
                  <p className="font-bold text-foreground">{finalScore.baseScore}</p>
                  <p className="text-xs">בסיס</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">+{finalScore.comboBonus}</p>
                  <p className="text-xs">בונוס קומבו</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">+{finalScore.livesBonus}</p>
                  <p className="text-xs">בונוס חיים</p>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={startGame}
                aria-label="שחק שוב"
              >
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
