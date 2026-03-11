'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Trophy, RotateCcw, Play, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useXpStore } from '@/stores/xp-store'
import {
  createLetterMemoryState,
  revealCard,
  checkMatch,
  processInput,
  calculateFinalScore,
  getXpReward,
  MEMORY_DIFFICULTY_CONFIG,
} from '@/lib/games/letter-memory'
import type { MemoryDifficulty, LetterMemoryState } from '@/lib/games/letter-memory'
import { cn } from '@/lib/utils'

const ELAPSED_INTERVAL = 1000
/** Delay before auto-checking a match (ms) – lets player see the second card */
const CHECK_DELAY = 800

export default function LetterMemoryPage() {
  const [state, setState] = useState<LetterMemoryState>(createLetterMemoryState('easy'))
  const [selectedDifficulty, setSelectedDifficulty] = useState<MemoryDifficulty>('easy')
  const xpStore = useXpStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (elapsedRef.current !== null) {
      clearInterval(elapsedRef.current)
      elapsedRef.current = null
    }
    if (checkTimeoutRef.current !== null) {
      clearTimeout(checkTimeoutRef.current)
      checkTimeoutRef.current = null
    }
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const startGame = useCallback(() => {
    clearTimers()
    const initial: LetterMemoryState = {
      ...createLetterMemoryState(selectedDifficulty),
      phase: 'playing',
    }
    setState(initial)

    elapsedRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }))
    }, ELAPSED_INTERVAL)

    setTimeout(() => inputRef.current?.focus(), 100)
  }, [selectedDifficulty, clearTimers])

  // When phase transitions to 'checking', auto-run checkMatch after a short delay
  useEffect(() => {
    if (state.phase === 'checking') {
      checkTimeoutRef.current = setTimeout(() => {
        setState((prev) => checkMatch(prev))
      }, CHECK_DELAY)
    }
  }, [state.phase])

  // When game completes, stop timers and award XP
  useEffect(() => {
    if (state.phase === 'complete') {
      clearTimers()
      const final = calculateFinalScore(state)
      const xp = getXpReward(final.totalScore)
      xpStore.addXp(xp)
      xpStore.updateStreak()
    }
  }, [state.phase, clearTimers, xpStore]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setState((prev) => processInput(prev, value))
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setState((prev) => ({ ...prev, input: '' }))
    }
  }, [])

  /** Reveal a card by clicking it (alternative to typing) */
  const handleCardClick = useCallback((position: number) => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev
      return revealCard(prev, position)
    })
  }, [])

  const finalScore = state.phase === 'complete' ? calculateFinalScore(state) : null
  const config = MEMORY_DIFFICULTY_CONFIG[state.difficulty]

  /** Stars based on move efficiency */
  const getStars = (moves: number, pairs: number): number => {
    const ratio = moves / pairs
    if (ratio <= 1.5) return 3
    if (ratio <= 2.5) return 2
    return 1
  }

  const stars = finalScore ? getStars(state.moves, state.totalPairs) : 0

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4" dir="rtl">
      {/* Header */}
      <div className="game-card-border flex items-center justify-between p-4" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}>
        <div>
          <h1 className="text-xl font-bold text-glow sm:text-2xl">זיכרון אותיות</h1>
          <p className="text-sm text-muted-foreground">הקלד אות כדי לגלות קלף – מצא את הזוגות!</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: 'oklch(0.495 0.205 292 / 20%)', boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)' }}>
          <Brain className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
        </div>
      </div>

      {/* Ready screen */}
      {state.phase === 'ready' && (
        <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <span className="text-5xl" role="img" aria-label="זיכרון">🃏</span>
            <h2 className="text-lg font-bold">בחר רמת קושי</h2>

            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {MEMORY_DIFFICULTY_CONFIG[diff].label}
                </Button>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">{MEMORY_DIFFICULTY_CONFIG[selectedDifficulty].description}</p>
              <p className="mt-1">הקלד אות כדי לגלות קלף, מצא את הזוג!</p>
            </div>

            <Button size="lg" className="gap-2 text-lg" onClick={startGame}>
              <Play className="size-5" />
              התחל משחק
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Playing / Checking screen */}
      {(state.phase === 'playing' || state.phase === 'checking') && (
        <>
          {/* HUD */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-2 text-sm" style={{ borderColor: 'var(--game-border)', background: 'oklch(0.13 0.02 290 / 60%)' }}>
            <div className="flex items-center gap-3">
              <span className="tabular-nums">
                <span className="font-bold">{state.matches}</span>
                <span className="text-muted-foreground">/{state.totalPairs} זוגות</span>
              </span>
              <span className="tabular-nums text-muted-foreground">
                {String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0')}:
                {String(state.elapsedSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular-nums text-muted-foreground">{state.moves} ניסיונות</span>
              {state.combo > 1 && (
                <motion.span
                  key={state.combo}
                  className="font-bold text-primary"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  x{state.combo}
                </motion.span>
              )}
              <span className="font-bold tabular-nums">{state.score} נק&apos;</span>
            </div>
          </div>

          {/* Card Grid */}
          <div
            className={cn(
              'grid gap-2',
              config.gridCols === 4 && config.gridRows === 2 && 'grid-cols-4',
              config.gridCols === 4 && config.gridRows === 3 && 'grid-cols-4',
              config.gridCols === 4 && config.gridRows === 4 && 'grid-cols-4',
            )}
            role="grid"
            aria-label="לוח זיכרון אותיות"
          >
            <AnimatePresence>
              {state.cards.map((card) => {
                const isRevealed = card.revealed || card.matched
                return (
                  <motion.button
                    key={card.id}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-lg border-2 text-2xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-3xl',
                      card.matched
                        ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                        : isRevealed
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/50',
                    )}
                    style={{ perspective: '600px' }}
                    onClick={() => handleCardClick(card.position)}
                    disabled={card.matched || state.phase === 'checking'}
                    aria-label={isRevealed ? `אות ${card.letter}` : 'קלף פוך'}
                    aria-pressed={isRevealed}
                    role="gridcell"
                    initial={false}
                    animate={{
                      rotateY: isRevealed ? 0 : 180,
                      opacity: 1,
                    }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                  >
                    {isRevealed ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1, delay: 0.08 }}
                      >
                        {card.letter}
                      </motion.span>
                    ) : (
                      <span aria-hidden="true">❓</span>
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={state.input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border-2 bg-background px-4 py-3 text-center text-lg font-bold outline-none"
            style={{ borderColor: 'oklch(0.495 0.205 292 / 50%)', background: 'var(--game-bg-input)' }}
            placeholder="הקלד אות..."
            aria-label="הקלד אות כדי לגלות קלף"
            autoComplete="off"
            dir="rtl"
            disabled={state.phase === 'checking'}
          />
          <p className="text-center text-xs text-muted-foreground">
            הקלד אות עברית כדי לגלות קלף, או לחץ על קלף ישירות
          </p>
        </>
      )}

      {/* Complete screen */}
      {state.phase === 'complete' && finalScore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
            <CardHeader>
              <CardTitle className="text-center text-lg">כל הכבוד! השלמת את הזיכרון!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stars */}
              <div className="flex justify-center gap-1">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: s * 0.12, duration: 0.15 }}
                  >
                    <Star
                      className={cn(
                        'size-10',
                        s <= stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                      )}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Score */}
              <div className="flex flex-col items-center gap-2">
                <Trophy className="size-12 text-amber-500" />
                <motion.span
                  className="text-3xl font-bold text-primary"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.18 }}
                >
                  {finalScore.totalScore}
                </motion.span>
                <span className="text-sm text-muted-foreground">ניקוד סופי</span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border p-3" style={{ border: '1.5px solid var(--game-border)', background: 'oklch(0.15 0.02 292 / 40%)' }}>
                  <p className="text-xl font-bold tabular-nums">{state.moves}</p>
                  <p className="text-xs text-muted-foreground">ניסיונות</p>
                </div>
                <div className="rounded-lg border p-3" style={{ border: '1.5px solid var(--game-border)', background: 'oklch(0.15 0.02 292 / 40%)' }}>
                  <p className="text-xl font-bold tabular-nums">{state.bestCombo}</p>
                  <p className="text-xs text-muted-foreground">קומבו מקסימלי</p>
                </div>
                <div className="rounded-lg border p-3" style={{ border: '1.5px solid var(--game-border)', background: 'oklch(0.15 0.02 292 / 40%)' }}>
                  <p className="text-xl font-bold tabular-nums">
                    {String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0')}:
                    {String(state.elapsedSeconds % 60).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground">זמן</p>
                </div>
                <div className="rounded-lg border p-3" style={{ border: '1.5px solid var(--game-border)', background: 'oklch(0.15 0.02 292 / 40%)' }}>
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

              {/* Score breakdown */}
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">יעילות</span>
                  <span className="font-medium tabular-nums">{finalScore.efficiencyScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">בונוס קומבו</span>
                  <span className="font-medium tabular-nums">+{finalScore.comboBonus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">בונוס זמן</span>
                  <span className="font-medium tabular-nums">+{finalScore.timeBonus}</span>
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
