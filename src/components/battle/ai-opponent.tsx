'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAIOpponentStore } from '@/stores/ai-opponent-store'
import {
  RIVAL_CONFIGS,
  RIVAL_DISPLAY,
  scaleToDifficulty,
  createAITypingRunner,
} from '@/lib/battle/ai-typing-engine'
import type {
  RivalName,
  DifficultyLevel,
  AIKeystrokeEvent,
  AIMatchResult,
  AIOpponentMood,
} from '@/types/ai-opponent'

// ── Types ───────────────────────────────────────────────────────────

interface AIOpponentProps {
  /** Which rival character to use */
  rivalId: RivalName
  /** The text the AI is typing */
  targetText: string
  /** Difficulty level 1-5 */
  difficulty: DifficultyLevel
  /** Whether rubber-banding is enabled (false for tournaments) */
  rubberBandEnabled?: boolean
  /** Called when the AI finishes typing the entire text */
  onComplete?: (result: AIMatchResult) => void
  /** Called on each AI keystroke (for real-time sync) */
  onKeystroke?: (event: AIKeystrokeEvent) => void
  /** Whether the battle has started (AI begins typing when true) */
  isStarted: boolean
  /** Player's current character position (for rubber-banding) */
  playerPosition?: number
}

// ── Mood Animations ─────────────────────────────────────────────────

const MOOD_VARIANTS = {
  neutral: { scale: 1, rotate: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  confident: { scale: 1.05, rotate: 2, transition: { duration: 0.4, ease: 'easeOut' as const } },
  struggling: { scale: 0.95, rotate: -2, transition: { duration: 0.3, ease: 'easeOut' as const } },
  surprised: { scale: 1.08, rotate: -3, transition: { duration: 0.2, ease: 'easeOut' as const } },
  defeated: { scale: 0.9, rotate: -5, transition: { duration: 0.5, ease: 'easeOut' as const } },
  victorious: { scale: 1.1, rotate: 3, transition: { duration: 0.4, ease: 'easeOut' as const } },
} satisfies Record<AIOpponentMood, { scale: number; rotate: number; transition: { duration: number; ease: 'easeOut' } }>

// ── WPM Display Colors ─────────────────────────────────────────────

function getWpmColor(wpm: number): string {
  if (wpm >= 60) return 'text-red-400'
  if (wpm >= 40) return 'text-orange-400'
  if (wpm >= 25) return 'text-yellow-400'
  return 'text-green-400'
}

// ── Component ───────────────────────────────────────────────────────

export function AIOpponent({
  rivalId,
  targetText,
  difficulty,
  rubberBandEnabled = true,
  onComplete,
  onKeystroke,
  isStarted,
  playerPosition = 0,
}: AIOpponentProps) {
  const runnerRef = useRef<ReturnType<typeof createAITypingRunner> | null>(null)
  const {
    opponentState,
    mood,
    processKeystroke,
    updatePlayerPosition,
    updateMood,
    startBattle,
    stopBattle,
    setMatchResult,
  } = useAIOpponentStore()

  const display = useMemo(() => RIVAL_DISPLAY[rivalId], [rivalId])
  const textLength = targetText.length

  // ── Keystroke handler ─────────────────────────────────────────────

  const handleKeystroke = useCallback(
    (event: AIKeystrokeEvent) => {
      processKeystroke(event)
      onKeystroke?.(event)
    },
    [processKeystroke, onKeystroke],
  )

  // ── Completion handler ────────────────────────────────────────────

  const handleComplete = useCallback(
    (result: AIMatchResult) => {
      setMatchResult(result)
      onComplete?.(result)
    },
    [setMatchResult, onComplete],
  )

  // ── Initialize and start the engine ───────────────────────────────

  useEffect(() => {
    if (!isStarted) return

    // Get the scaled config for the selected rival + difficulty
    const baseConfig = RIVAL_CONFIGS[rivalId]
    const scaledConfig = scaleToDifficulty(baseConfig, difficulty)

    // Initialize the store
    startBattle(rivalId, difficulty, rubberBandEnabled)

    // Create the typing runner
    const runner = createAITypingRunner(
      scaledConfig,
      targetText,
      rubberBandEnabled,
      handleKeystroke,
      handleComplete,
    )

    runnerRef.current = runner
    runner.start()

    return () => {
      runner.stop()
      runnerRef.current = null
      stopBattle()
    }
    // Only re-run when battle parameters change, not on every handler update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, rivalId, targetText, difficulty, rubberBandEnabled])

  // ── Sync player position for rubber-banding ───────────────────────

  useEffect(() => {
    updatePlayerPosition(playerPosition)
    runnerRef.current?.updatePlayerPosition(playerPosition)
  }, [playerPosition, updatePlayerPosition])

  // ── Update mood based on battle state ─────────────────────────────

  useEffect(() => {
    if (isStarted) {
      updateMood(textLength)
    }
  }, [
    isStarted,
    textLength,
    opponentState.currentPosition,
    playerPosition,
    updateMood,
  ])

  // ── Animation variant ─────────────────────────────────────────────

  const moodVariant = MOOD_VARIANTS[mood]

  // ── Render ────────────────────────────────────────────────────────

  const progress = textLength > 0
    ? Math.round((opponentState.currentPosition / textLength) * 100)
    : 0

  return (
    <div className="flex flex-col items-center gap-3" data-testid="ai-opponent">
      {/* Character portrait with mood-based animation */}
      <motion.div
        animate={{
          scale: moodVariant.scale,
          rotate: moodVariant.rotate,
        }}
        transition={moodVariant.transition}
        className="relative"
      >
        <div
          className="overflow-hidden rounded-full border-3"
          style={{
            width: 72,
            height: 72,
            boxShadow: `0 0 20px ${display.glowColor}`,
            borderColor: display.glowColor,
          }}
        >
          <Image
            src={display.image}
            alt={display.nameHe}
            width={72}
            height={72}
            className="object-cover"
          />
        </div>

        {/* Typing indicator */}
        {opponentState.isTyping && (
          <motion.div
            className="absolute -bottom-1 -end-1 size-4 rounded-full bg-green-500 border-2 border-background"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            aria-label="מקליד"
          />
        )}
      </motion.div>

      {/* Name and emoji */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{display.emoji}</span>
        <span className="text-sm font-bold" style={{ color: display.themeColor }}>
          {display.nameHe}
        </span>
      </div>

      {/* WPM display */}
      <div className="text-center">
        <div
          className={`text-2xl font-black tabular-nums ${getWpmColor(opponentState.currentWPM)}`}
          data-testid="ai-wpm-display"
        >
          {opponentState.currentWPM}
        </div>
        <div className="text-muted-foreground text-xs">מ/ד</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[120px]">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: display.themeColor }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: 'linear' }}
          />
        </div>
        <div className="text-muted-foreground mt-1 text-center text-xs tabular-nums">
          {progress}%
        </div>
      </div>

      {/* Error count (only visible after errors occur) */}
      {opponentState.errors > 0 && (
        <div className="text-xs text-red-400/70 tabular-nums">
          {opponentState.errors} שגיאות
        </div>
      )}
    </div>
  )
}
