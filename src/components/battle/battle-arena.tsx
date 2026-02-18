'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Swords, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BattleResults } from '@/components/battle/battle-results'
import {
  type BattleConfig,
  type BattleDifficulty,
  type BattleState,
  type BattleWinner,
  createBattle,
  updatePlayerProgress,
  updateAiProgress,
  checkWinner,
  calculateBattleXp,
  calculatePlayerWpm,
  calculatePlayerAccuracy,
  calculateAiEffectiveWpm,
  getAiWpm,
} from '@/lib/battle/battle-engine'
import { useXpStore } from '@/stores/xp-store'

// ── Constants ──────────────────────────────────────────────────────

const COUNTDOWN_STEPS = ['3', '2', '1', 'קדימה!'] as const
const COUNTDOWN_INTERVAL_MS = 1000
const AI_UPDATE_INTERVAL_MS = 50
const DEFAULT_TEXT_LENGTH = 80

const DIFFICULTY_OPTIONS: Array<{
  value: BattleDifficulty
  label: string
  description: string
  wpm: number
}> = [
  { value: 'easy', label: 'קל', description: 'נינג\u05F3ה מתחיל', wpm: 15 },
  { value: 'medium', label: 'בינוני', description: 'נינג\u05F3ה מנוסה', wpm: 30 },
  { value: 'hard', label: 'קשה', description: 'מאסטר נינג\u05F3ה', wpm: 50 },
]

// ── Types ──────────────────────────────────────────────────────────

type Phase = 'select' | 'countdown' | 'battle' | 'results'

// ── Component ──────────────────────────────────────────────────────

export function BattleArena() {
  const [phase, setPhase] = useState<Phase>('select')
  const [difficulty, setDifficulty] = useState<BattleDifficulty>('easy')
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [countdownIndex, setCountdownIndex] = useState(0)
  const [winner, setWinner] = useState<BattleWinner>(null)
  const [xpEarned, setXpEarned] = useState(0)

  const aiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastAiUpdateRef = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const addXp = useXpStore((s) => s.addXp)

  // ── Countdown Logic ────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'countdown') return

    const timer = setInterval(() => {
      setCountdownIndex((prev) => {
        const next = prev + 1
        if (next >= COUNTDOWN_STEPS.length) {
          clearInterval(timer)
          setPhase('battle')
          return prev
        }
        return next
      })
    }, COUNTDOWN_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [phase])

  // ── Focus input on battle start ────────────────────────────────

  useEffect(() => {
    if (phase === 'battle') {
      inputRef.current?.focus()
    }
  }, [phase])

  // ── AI Progress Loop ───────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'battle' || !battleState) return

    lastAiUpdateRef.current = performance.now()

    aiIntervalRef.current = setInterval(() => {
      const now = performance.now()
      const delta = now - lastAiUpdateRef.current
      lastAiUpdateRef.current = now

      setBattleState((prev) => {
        if (!prev || prev.status === 'finished') return prev

        const updated = updateAiProgress(
          { ...prev, status: 'playing' },
          delta,
        )

        // Check if AI won
        const battleWinner = checkWinner(updated, updated.text.length)
        if (battleWinner === 'ai') {
          return { ...updated, status: 'finished', winner: 'ai' }
        }

        return updated
      })
    }, AI_UPDATE_INTERVAL_MS)

    return () => {
      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current)
        aiIntervalRef.current = null
      }
    }
  }, [phase, battleState?.text.length])

  // ── Check for battle end ───────────────────────────────────────

  useEffect(() => {
    if (!battleState) return
    if (battleState.status !== 'finished' && phase !== 'battle') return

    const w = battleState.winner
    if (w) {
      setWinner(w)
      const playerWpm = calculatePlayerWpm(battleState)
      const xp = calculateBattleXp(
        w === 'player',
        battleState.config.difficulty,
        playerWpm,
      )
      setXpEarned(xp)
      addXp(xp)
      setPhase('results')

      if (aiIntervalRef.current) {
        clearInterval(aiIntervalRef.current)
        aiIntervalRef.current = null
      }
    }
  }, [battleState?.winner, battleState?.status, phase, addXp, battleState])

  // ── Handlers ───────────────────────────────────────────────────

  const handleStartBattle = useCallback(
    (selectedDifficulty: BattleDifficulty) => {
      setDifficulty(selectedDifficulty)
      const config: BattleConfig = {
        difficulty: selectedDifficulty,
        textLength: DEFAULT_TEXT_LENGTH,
      }
      const state = createBattle(config)
      setBattleState({ ...state, status: 'countdown' })
      setCountdownIndex(0)
      setPhase('countdown')
      setWinner(null)
      setXpEarned(0)
    },
    [],
  )

  const handleKeyInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (phase !== 'battle' || !battleState) return

      const value = e.target.value
      if (value.length === 0) return

      const typed = value[value.length - 1]
      const expected = battleState.text[battleState.playerProgress]
      const isCorrect = typed === expected

      setBattleState((prev) => {
        if (!prev) return prev

        const updated = updatePlayerProgress(
          { ...prev, status: 'playing' },
          prev.playerProgress,
          isCorrect,
        )

        // Check if player won
        const battleWinner = checkWinner(updated, updated.text.length)
        if (battleWinner === 'player') {
          return { ...updated, status: 'finished', winner: 'player' }
        }

        return updated
      })

      // Clear input for next character
      e.target.value = ''
    },
    [phase, battleState],
  )

  const handlePlayAgain = useCallback(() => {
    handleStartBattle(difficulty)
  }, [difficulty, handleStartBattle])

  const handleBack = useCallback(() => {
    setPhase('select')
    setBattleState(null)
    setWinner(null)
    setXpEarned(0)
  }, [])

  // ── Derived Values ─────────────────────────────────────────────

  const playerPercent = battleState
    ? Math.round((battleState.playerProgress / battleState.text.length) * 100)
    : 0
  const aiPercent = battleState
    ? Math.round((battleState.aiProgress / battleState.text.length) * 100)
    : 0
  const playerWpm = battleState ? calculatePlayerWpm(battleState) : 0
  const aiWpm = battleState ? calculateAiEffectiveWpm(battleState) : 0
  const playerAccuracy = battleState ? calculatePlayerAccuracy(battleState) : 100

  // ── Render: Difficulty Selection ───────────────────────────────

  if (phase === 'select') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Swords className="size-7" />
              זירת קרב
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              בחר רמת קושי להתמודדות מול הנינג&apos;ה בוט
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStartBattle(option.value)}
                  className="rounded-xl border-2 border-transparent bg-muted/50 p-6 text-center transition-all hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid={`difficulty-${option.value}`}
                >
                  <div className="text-3xl font-bold">{option.label}</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    {option.description}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-primary">
                    <Zap className="size-3.5" />
                    {option.wpm} מ/ד
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Render: Countdown ──────────────────────────────────────────

  if (phase === 'countdown') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownIndex}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <span
              className="text-8xl font-black text-primary"
              data-testid="countdown-display"
            >
              {COUNTDOWN_STEPS[countdownIndex]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ── Render: Battle / Results ───────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Hidden input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        className="sr-only"
        onChange={handleKeyInput}
        aria-label="הקלדת טקסט"
        autoComplete="off"
        data-testid="battle-input"
        tabIndex={0}
      />

      {/* Player vs AI header */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player card - right side (RTL) */}
        <Card className="border-primary/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <User className="size-5 text-primary" />
              <span className="font-bold">אתה</span>
            </div>
            <div className="mt-2 text-2xl font-black text-primary" data-testid="player-wpm">
              {playerWpm} <span className="text-sm font-normal">מ/ד</span>
            </div>
            <div className="text-muted-foreground text-xs">
              דיוק: {playerAccuracy}%
            </div>
          </CardContent>
        </Card>

        {/* AI card - left side (RTL) */}
        <Card className="border-red-500/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Bot className="size-5 text-red-500" />
              <span className="font-bold text-red-500">נינג&apos;ה בוט</span>
            </div>
            <div className="mt-2 text-2xl font-black text-red-500" data-testid="ai-wpm">
              {aiWpm} <span className="text-sm font-normal">מ/ד</span>
            </div>
            <div className="text-muted-foreground text-xs">
              {getAiWpm(difficulty)} מ/ד מטרה
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bars */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-12">אתה</span>
          <div className="flex-1">
            <Progress value={playerPercent} className="h-3" data-testid="player-progress" />
          </div>
          <span className="text-muted-foreground w-10 text-end text-sm">
            {playerPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-12 text-red-500">בוט</span>
          <div className="flex-1">
            <Progress
              value={aiPercent}
              className="h-3 [&>[data-slot=progress-indicator]]:bg-red-500"
              data-testid="ai-progress"
            />
          </div>
          <span className="text-muted-foreground w-10 text-end text-sm">
            {aiPercent}%
          </span>
        </div>
      </div>

      {/* Text display */}
      {battleState && (
        <Card
          className="cursor-text"
          onClick={() => inputRef.current?.focus()}
          data-testid="battle-text-area"
        >
          <CardContent className="p-6">
            <p
              className="text-xl leading-relaxed font-medium"
              dir="rtl"
              lang="he"
            >
              {battleState.text.split('').map((char, i) => {
                let className = 'text-muted-foreground/40'
                if (i < battleState.playerProgress) {
                  className = 'text-green-600 dark:text-green-400'
                } else if (i === battleState.playerProgress) {
                  className =
                    'bg-primary/20 text-foreground underline underline-offset-4'
                }
                return (
                  <span key={i} className={className}>
                    {char}
                  </span>
                )
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Click to focus hint */}
      {phase === 'battle' && (
        <p className="text-muted-foreground text-center text-sm">
          לחץ על הטקסט והתחל להקליד
        </p>
      )}

      {/* Results modal */}
      {phase === 'results' && battleState && (
        <BattleResults
          open={true}
          winner={winner}
          stats={{
            playerWpm,
            aiWpm,
            playerAccuracy,
            timeSeconds: Math.round(battleState.timeElapsed / 1000),
          }}
          xpEarned={xpEarned}
          difficulty={difficulty}
          onPlayAgain={handlePlayAgain}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
