'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BattleResults } from '@/components/battle/battle-results'
import { AIOpponent } from '@/components/battle/ai-opponent'
import { soundManager } from '@/lib/audio/sound-manager'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import {
  type BattleConfig,
  type BattleDifficulty,
  type BattleState,
  type BattleWinner,
  createBattle,
  updatePlayerProgress,
  checkWinner,
  calculateBattleXp,
  calculatePlayerWpm,
  calculatePlayerAccuracy,
} from '@/lib/battle/battle-engine'
import { RIVAL_DISPLAY } from '@/lib/battle/ai-typing-engine'
import { useXpStore } from '@/stores/xp-store'
import { useAIOpponentStore } from '@/stores/ai-opponent-store'
import type { RivalName, DifficultyLevel, AIMatchResult } from '@/types/ai-opponent'

// ── Types (local) ──────────────────────────────────────────────────

interface FinalAIStats {
  wpm: number
  accuracy: number
}

// ── Constants ──────────────────────────────────────────────────────

const COUNTDOWN_STEPS = ['3', '2', '1', 'קדימה!'] as const
const COUNTDOWN_INTERVAL_MS = 1000
const DEFAULT_TEXT_LENGTH = 80

/** Map old difficulty to rival character and difficulty level */
const DIFFICULTY_TO_RIVAL: Record<BattleDifficulty, {
  rival: RivalName
  level: DifficultyLevel
}> = {
  easy: { rival: 'bug', level: 2 },
  medium: { rival: 'shadow', level: 3 },
  hard: { rival: 'storm', level: 4 },
}

/** Rival selection options for the new 6-rival picker */
const RIVAL_OPTIONS: Array<{
  rival: RivalName
  difficulty: DifficultyLevel
  label: string
  description: string
}> = [
  { rival: 'bug', difficulty: 2, label: 'באג', description: 'כאוטי, הרבה טעויות' },
  { rival: 'shadow', difficulty: 3, label: 'צל', description: 'יציב ומדויק' },
  { rival: 'storm', difficulty: 3, label: 'סערה', description: 'פרצים בלתי צפויים' },
  { rival: 'blaze', difficulty: 4, label: 'להבה', description: 'מתחיל חם, נשרף' },
  { rival: 'virus', difficulty: 4, label: 'וירוס', description: 'מתחיל לאט, מאיץ' },
  { rival: 'yuki', difficulty: 5, label: 'יוקי', description: 'שותפת אימונים קשוחה' },
]

// ── Types ──────────────────────────────────────────────────────────

type Phase = 'select' | 'countdown' | 'battle' | 'results'

// ── Component ──────────────────────────────────────────────────────

export function BattleArena() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('select')
  const [difficulty, setDifficulty] = useState<BattleDifficulty>('easy')
  const [selectedRival, setSelectedRival] = useState<RivalName>('bug')
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(2)
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [countdownIndex, setCountdownIndex] = useState(0)
  const [winner, setWinner] = useState<BattleWinner>(null)
  const [xpEarned, setXpEarned] = useState(0)
  const [battleStarted, setBattleStarted] = useState(false)
  // Final AI stats from the match result (set when AI finishes)
  const [finalAIStats, setFinalAIStats] = useState<FinalAIStats>({ wpm: 0, accuracy: 100 })

  const inputRef = useRef<HTMLInputElement>(null)
  const battleEndedRef = useRef(false)
  // Timer ref for tracking elapsed time during battle
  const battleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const battleStartTimeRef = useRef<number>(0)

  const addXp = useXpStore((s) => s.addXp)
  const aiOpponentState = useAIOpponentStore((s) => s.opponentState)

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

  // ── Countdown sounds ───────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdownIndex < COUNTDOWN_STEPS.length - 1) {
      soundManager.playCountdownBeep()
    } else if (countdownIndex === COUNTDOWN_STEPS.length - 1) {
      soundManager.playCountdownGo()
    }
  }, [countdownIndex, phase])

  // ── Battle start ─────────────────────────────────────────────

  useEffect(() => {
    if (phase === 'battle') {
      soundManager.playBattleStart()
      setBattleStarted(true)
      battleEndedRef.current = false
      battleStartTimeRef.current = Date.now()
      inputRef.current?.focus()

      // Start elapsed time tracker (updates every 100ms for accurate final time)
      battleTimerRef.current = setInterval(() => {
        if (battleEndedRef.current) return
        const elapsed = Date.now() - battleStartTimeRef.current
        setBattleState((prev) => {
          if (!prev || prev.status === 'finished') return prev
          return { ...prev, timeElapsed: elapsed }
        })
      }, 100)
    }

    return () => {
      if (battleTimerRef.current !== null) {
        clearInterval(battleTimerRef.current)
        battleTimerRef.current = null
      }
    }
  }, [phase])

  // ── Check if AI completed (AI won) ───────────────────────────

  const handleAIComplete = useCallback(
    (result: AIMatchResult) => {
      // Always capture the final AI stats for results display
      setFinalAIStats({ wpm: result.finalWPM, accuracy: result.accuracy })

      if (battleEndedRef.current) return

      setBattleState((prev) => {
        if (!prev || prev.status === 'finished') return prev

        // Only mark AI as winner if player hasn't already won
        if (prev.playerProgress < prev.text.length) {
          battleEndedRef.current = true
          const elapsed = Date.now() - battleStartTimeRef.current
          return {
            ...prev,
            status: 'finished',
            winner: 'ai',
            aiProgress: prev.text.length,
            timeElapsed: elapsed,
          }
        }
        return prev
      })
    },
    [],
  )

  // ── Check for battle end ───────────────────────────────────────

  useEffect(() => {
    if (!battleState) return
    if (phase !== 'battle' && battleState.status !== 'finished') return

    const w = battleState.winner
    if (w && !winner) {
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
      setBattleStarted(false)
      if (w === 'player') {
        soundManager.playVictoryCheers()
      }
    }
  }, [battleState, battleState?.winner, battleState?.status, phase, addXp, winner])

  // ── Sync AI position into battle state (for progress bar) ────

  useEffect(() => {
    if (phase !== 'battle' || !battleState) return

    setBattleState((prev) => {
      if (!prev || prev.status === 'finished') return prev
      return {
        ...prev,
        aiProgress: aiOpponentState.currentPosition,
        timeElapsed: prev.timeElapsed,
      }
    })
  }, [aiOpponentState.currentPosition, phase, battleState?.status])

  // ── Handlers ───────────────────────────────────────────────────

  const handleSelectRival = useCallback(
    (rival: RivalName, level: DifficultyLevel) => {
      setSelectedRival(rival)
      setSelectedLevel(level)

      // Map to old difficulty for backward compat with BattleResults
      const difficultyMap: Record<number, BattleDifficulty> = {
        1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard',
      }
      const mappedDifficulty = difficultyMap[level] ?? 'medium'
      setDifficulty(mappedDifficulty)

      const config: BattleConfig = {
        difficulty: mappedDifficulty,
        textLength: DEFAULT_TEXT_LENGTH,
      }
      const state = createBattle(config)
      setBattleState({ ...state, status: 'countdown' })
      setCountdownIndex(0)
      setPhase('countdown')
      setWinner(null)
      setXpEarned(0)
      setBattleStarted(false)
      setFinalAIStats({ wpm: 0, accuracy: 100 })
      battleEndedRef.current = false
    },
    [],
  )

  const handleStartBattle = useCallback(
    (selectedDifficulty: BattleDifficulty) => {
      const { rival, level } = DIFFICULTY_TO_RIVAL[selectedDifficulty]
      handleSelectRival(rival, level)
    },
    [handleSelectRival],
  )

  const handleKeyInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (phase !== 'battle' || !battleState || battleEndedRef.current) return

      const value = e.target.value
      if (value.length === 0) return

      const typed = value[value.length - 1]
      const expected = battleState.text[battleState.playerProgress]
      const isCorrect = typed === expected

      setBattleState((prev) => {
        if (!prev || prev.status === 'finished') return prev

        const updated = updatePlayerProgress(
          { ...prev, status: 'playing' },
          prev.playerProgress,
          isCorrect,
        )

        // Check if player won
        const battleWinner = checkWinner(updated, updated.text.length)
        if (battleWinner === 'player') {
          battleEndedRef.current = true
          const elapsed = Date.now() - battleStartTimeRef.current
          return { ...updated, status: 'finished', winner: 'player', timeElapsed: elapsed }
        }

        return updated
      })

      // Clear input for next character
      e.target.value = ''
    },
    [phase, battleState],
  )

  const handlePlayAgain = useCallback(() => {
    handleSelectRival(selectedRival, selectedLevel)
  }, [selectedRival, selectedLevel, handleSelectRival])

  const handleBack = useCallback(() => {
    setPhase('select')
    setBattleState(null)
    setWinner(null)
    setXpEarned(0)
    setBattleStarted(false)
    setFinalAIStats({ wpm: 0, accuracy: 100 })
    battleEndedRef.current = false
    if (battleTimerRef.current !== null) {
      clearInterval(battleTimerRef.current)
      battleTimerRef.current = null
    }
  }, [])

  // ── Derived Values ─────────────────────────────────────────────

  const playerPercent = battleState
    ? Math.round((battleState.playerProgress / battleState.text.length) * 100)
    : 0
  const aiPercent = battleState
    ? Math.round((battleState.aiProgress / battleState.text.length) * 100)
    : 0
  const playerWpm = battleState ? calculatePlayerWpm(battleState) : 0
  const playerAccuracy = battleState ? calculatePlayerAccuracy(battleState) : 100
  const rivalDisplay = RIVAL_DISPLAY[selectedRival]

  // ── Render: Rival Selection ──────────────────────────────────

  if (phase === 'select') {
    return (
      <div className="relative mx-auto max-w-3xl space-y-5 overflow-hidden p-4">
        <Image src="/images/backgrounds/battle-bg.jpg" alt="" fill className="object-cover opacity-20 pointer-events-none" />

        {/* Page header */}
        <div
          className="game-card-border flex items-center justify-center gap-3 p-4 text-center"
          style={{ borderColor: 'oklch(0.65 0.24 25 / 50%)' }}
        >
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: 'oklch(0.65 0.24 25 / 20%)', boxShadow: '0 0 12px oklch(0.65 0.24 25 / 30%)' }}
          >
            <Swords className="size-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black neon-text-purple">זירת קרב</h1>
            <p className="text-sm text-muted-foreground">בחר יריב להתמודדות</p>
          </div>
        </div>

        {/* Rival grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RIVAL_OPTIONS.map((option) => {
            const display = RIVAL_DISPLAY[option.rival]
            return (
              <motion.button
                key={option.rival}
                onClick={() => handleSelectRival(option.rival, option.difficulty)}
                className="game-card-border p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: `${display.glowColor}40` }}
                whileHover={reduceMotion ? {} : { scale: 1.03 }}
                whileTap={reduceMotion ? {} : { scale: 0.97 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20 }}
                data-testid={`rival-${option.rival}`}
              >
                <div
                  className="mx-auto mb-3 overflow-hidden rounded-full border-2 transition-colors"
                  style={{ width: 56, height: 56, borderColor: `${display.glowColor}60`, boxShadow: `0 0 20px ${display.glowColor}` }}
                >
                  <Image
                    src={display.image}
                    alt={display.nameHe}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-lg font-bold">
                  <span>{display.emoji}</span>
                  <span style={{ color: display.themeColor }}>{option.label}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {option.description}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className="size-2 rounded-full transition-colors"
                      style={{
                        background: i < option.difficulty ? display.themeColor : 'oklch(0.3 0.02 290)',
                        boxShadow: i < option.difficulty ? `0 0 6px ${display.glowColor}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Legacy difficulty buttons (smaller, below) */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--game-hover-bg)', border: '1px solid var(--game-border)' }}
        >
          <p className="mb-3 text-center text-xs text-muted-foreground">
            או בחר לפי רמת קושי:
          </p>
          <div className="flex justify-center gap-3">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Button
                key={d}
                variant="outline"
                size="sm"
                onClick={() => handleStartBattle(d)}
                className="border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                data-testid={`difficulty-${d}`}
              >
                <Zap className="size-3.5 me-1" />
                {d === 'easy' ? 'קל' : d === 'medium' ? 'בינוני' : 'קשה'}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Countdown ──────────────────────────────────────────

  if (phase === 'countdown') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-8">
        {/* Show rival info during countdown */}
        <div
          className="game-card-border flex items-center gap-3 px-6 py-3"
          style={{ borderColor: `${rivalDisplay.glowColor}50` }}
        >
          <span className="text-3xl">{rivalDisplay.emoji}</span>
          <div className="text-center">
            <span className="block text-lg font-bold" style={{ color: rivalDisplay.themeColor }}>{rivalDisplay.nameHe}</span>
            <span className="text-xs text-muted-foreground">{rivalDisplay.description}</span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownIndex}
            initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: [0.5, 1.1, 1], opacity: 1, rotate: [0, -3, 3, 0] }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 2, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
            className="text-center"
          >
            <span
              className="text-8xl font-black neon-text-purple"
              data-testid="countdown-display"
              aria-live="assertive"
              aria-atomic="true"
              role="timer"
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
    <div className="relative mx-auto max-w-3xl space-y-4 overflow-hidden">
      <Image src="/images/backgrounds/battle-bg.jpg" alt="" fill className="object-cover opacity-20 pointer-events-none" />
      {phase === 'battle' && (
        <div className="speed-lines pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      )}

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
        <div
          className="game-card-border p-4 text-center"
          style={{ borderColor: 'oklch(0.55 0.2 292 / 50%)' }}
        >
          <div className="flex items-center justify-center gap-2">
            <Image src="/images/characters/ki-mascot.jpg" alt="Ki" width={28} height={28} className="rounded-full" style={{ border: '1px solid var(--game-accent-purple)' }} />
            <span className="font-bold text-foreground">אתה</span>
          </div>
          <div
            className="mt-2 text-2xl font-black tabular-nums"
            style={{ color: 'var(--game-accent-purple)', textShadow: 'var(--game-text-glow)' }}
            data-testid="player-wpm"
            aria-live="polite"
            aria-atomic="true"
          >
            {playerWpm} <span className="text-sm font-normal text-muted-foreground">מ/ד</span>
          </div>
          <div className="text-muted-foreground text-xs" aria-live="polite" aria-atomic="true">
            דיוק: {playerAccuracy}%
          </div>
        </div>

        {/* AI card - left side (RTL) */}
        <div
          className="game-card-border p-4"
          style={{ borderColor: `${rivalDisplay.glowColor}`, boxShadow: `0 0 16px ${rivalDisplay.glowColor}` }}
        >
          {battleState && (
            <AIOpponent
              rivalId={selectedRival}
              targetText={battleState.text}
              difficulty={selectedLevel}
              rubberBandEnabled={true}
              isStarted={battleStarted}
              playerPosition={battleState.playerProgress}
              onComplete={handleAIComplete}
            />
          )}
        </div>
      </div>

      {/* Progress bars */}
      <div
        className="game-card-border space-y-3 p-4"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 20%)' }}
        role="status"
        aria-label="התקדמות במשחק"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm font-medium text-foreground">אתה</span>
          <div className="relative flex-1 h-3 overflow-hidden rounded-full" style={{ background: 'var(--game-bg-input)', border: '1px solid var(--game-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6C5CE7, #00B894)', boxShadow: '0 0 8px oklch(0.55 0.2 292 / 50%)' }}
              animate={{ width: `${playerPercent}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
              data-testid="player-progress"
            />
          </div>
          <span className="w-10 text-end text-sm tabular-nums text-muted-foreground">
            {playerPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-sm font-medium" style={{ color: rivalDisplay.themeColor }}>
            {rivalDisplay.nameHe}
          </span>
          <div className="relative flex-1 h-3 overflow-hidden rounded-full" style={{ background: 'var(--game-bg-input)', border: '1px solid var(--game-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: rivalDisplay.themeColor, boxShadow: `0 0 8px ${rivalDisplay.glowColor}` }}
              animate={{ width: `${aiPercent}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
              data-testid="ai-progress"
            />
          </div>
          <span className="w-10 text-end text-sm tabular-nums text-muted-foreground">
            {aiPercent}%
          </span>
        </div>
      </div>

      {/* Text display */}
      {battleState && (
        <div
          className="game-card-border cursor-text p-6"
          style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
          onClick={() => inputRef.current?.focus()}
          data-testid="battle-text-area"
        >
          <p
            className="text-xl leading-relaxed font-medium"
            dir="rtl"
            lang="he"
          >
            {battleState.text.split('').map((char, i) => {
              let style: React.CSSProperties = { color: 'oklch(0.65 0.02 290 / 50%)' }
              if (i < battleState.playerProgress) {
                style = { color: 'var(--game-accent-green)', textShadow: '0 0 6px oklch(0.672 0.148 168 / 40%)' }
              } else if (i === battleState.playerProgress) {
                style = {
                  background: 'oklch(0.55 0.2 292 / 25%)',
                  color: 'var(--foreground)',
                  textDecoration: 'underline',
                  textDecorationColor: 'var(--game-accent-purple)',
                  textUnderlineOffset: '4px',
                  borderRadius: '2px',
                }
              }
              return (
                <span key={i} style={style}>
                  {char}
                </span>
              )
            })}
          </p>
        </div>
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
            aiWpm: finalAIStats.wpm > 0 ? finalAIStats.wpm : aiOpponentState.currentWPM,
            playerAccuracy,
            aiAccuracy: finalAIStats.accuracy,
            timeSeconds: Math.round(battleState.timeElapsed / 1000),
          }}
          xpEarned={xpEarned}
          difficulty={difficulty}
          rivalDisplay={rivalDisplay}
          onPlayAgain={handlePlayAgain}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
