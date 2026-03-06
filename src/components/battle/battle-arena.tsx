'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BattleResults } from '@/components/battle/battle-results'
import { AIOpponent } from '@/components/battle/ai-opponent'
import { soundManager } from '@/lib/audio/sound-manager'
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
  const [phase, setPhase] = useState<Phase>('select')
  const [difficulty, setDifficulty] = useState<BattleDifficulty>('easy')
  const [selectedRival, setSelectedRival] = useState<RivalName>('bug')
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>(2)
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [countdownIndex, setCountdownIndex] = useState(0)
  const [winner, setWinner] = useState<BattleWinner>(null)
  const [xpEarned, setXpEarned] = useState(0)
  const [battleStarted, setBattleStarted] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const battleEndedRef = useRef(false)

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
      inputRef.current?.focus()
    }
  }, [phase])

  // ── Check if AI completed (AI won) ───────────────────────────

  const handleAIComplete = useCallback(
    (result: AIMatchResult) => {
      if (battleEndedRef.current) return

      setBattleState((prev) => {
        if (!prev || prev.status === 'finished') return prev

        // Only mark AI as winner if player hasn't already won
        if (prev.playerProgress < prev.text.length) {
          battleEndedRef.current = true
          return { ...prev, status: 'finished', winner: 'ai', aiProgress: prev.text.length }
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
    handleSelectRival(selectedRival, selectedLevel)
  }, [selectedRival, selectedLevel, handleSelectRival])

  const handleBack = useCallback(() => {
    setPhase('select')
    setBattleState(null)
    setWinner(null)
    setXpEarned(0)
    setBattleStarted(false)
    battleEndedRef.current = false
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
      <div className="relative mx-auto max-w-3xl space-y-6 overflow-hidden">
        <Image src="/images/backgrounds/battle-bg.jpg" alt="" fill className="object-cover opacity-20 pointer-events-none" />
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Swords className="size-7" />
              זירת קרב
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              בחר יריב להתמודדות
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RIVAL_OPTIONS.map((option) => {
                const display = RIVAL_DISPLAY[option.rival]
                return (
                  <button
                    key={option.rival}
                    onClick={() => handleSelectRival(option.rival, option.difficulty)}
                    className="group rounded-xl border-2 border-transparent bg-muted/50 p-5 text-center transition-all hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-testid={`rival-${option.rival}`}
                  >
                    <div className="mx-auto mb-3 overflow-hidden rounded-full border-2 border-muted-foreground/20 group-hover:border-primary/50 transition-colors"
                      style={{ width: 56, height: 56, boxShadow: `0 0 16px ${display.glowColor}` }}
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
                      <span>{option.label}</span>
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {option.description}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`size-2 rounded-full ${
                            i < option.difficulty
                              ? 'bg-primary'
                              : 'bg-muted-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Legacy difficulty buttons (smaller, below) */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-muted-foreground text-center text-xs mb-3">
                או בחר לפי רמת קושי:
              </p>
              <div className="flex justify-center gap-3">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <Button
                    key={d}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartBattle(d)}
                    data-testid={`difficulty-${d}`}
                  >
                    <Zap className="size-3.5 me-1" />
                    {d === 'easy' ? 'קל' : d === 'medium' ? 'בינוני' : 'קשה'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Render: Countdown ──────────────────────────────────────────

  if (phase === 'countdown') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
        {/* Show rival info during countdown */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-2xl">{rivalDisplay.emoji}</span>
          <span className="text-lg font-bold">{rivalDisplay.nameHe}</span>
          <span className="text-sm">({rivalDisplay.description})</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownIndex}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.1, 1], opacity: 1, rotate: [0, -3, 3, 0] }}
            exit={{ scale: 2, opacity: 0 }}
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
        <Card className="border-primary/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Image src="/images/characters/ki-mascot.jpg" alt="Ki" width={28} height={28} className="rounded-full border border-primary/50" />
              <span className="font-bold">אתה</span>
            </div>
            <div className="mt-2 text-2xl font-black text-primary tabular-nums" data-testid="player-wpm">
              {playerWpm} <span className="text-sm font-normal">מ/ד</span>
            </div>
            <div className="text-muted-foreground text-xs">
              דיוק: {playerAccuracy}%
            </div>
          </CardContent>
        </Card>

        {/* AI card - left side (RTL) */}
        <Card style={{ borderColor: `${rivalDisplay.glowColor}` }}>
          <CardContent className="p-4">
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
          <span className="text-muted-foreground w-10 text-end text-sm tabular-nums">
            {playerPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-12" style={{ color: rivalDisplay.themeColor }}>
            {rivalDisplay.nameHe}
          </span>
          <div className="flex-1">
            <Progress
              value={aiPercent}
              className="h-3 [&>[data-slot=progress-indicator]]:bg-red-500"
              data-testid="ai-progress"
            />
          </div>
          <span className="text-muted-foreground w-10 text-end text-sm tabular-nums">
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
            aiWpm: aiOpponentState.currentWPM,
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
