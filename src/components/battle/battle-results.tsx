'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { BattleWinner, BattleDifficulty } from '@/lib/battle/battle-engine'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trophy, RotateCcw, ArrowRight } from 'lucide-react'

interface BattleStats {
  playerWpm: number
  aiWpm: number
  playerAccuracy: number
  aiAccuracy: number
  timeSeconds: number
}

interface RivalDisplayInfo {
  nameHe: string
  emoji: string
  image: string
  themeColor: string
  glowColor: string
}

interface BattleResultsProps {
  open: boolean
  winner: BattleWinner
  stats: BattleStats
  xpEarned: number
  difficulty: BattleDifficulty
  rivalDisplay: RivalDisplayInfo
  onPlayAgain: () => void
  onBack: () => void
}

const DIFFICULTY_LABELS: Record<BattleDifficulty, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'קשה',
}

export function BattleResults({
  open,
  winner,
  stats,
  xpEarned,
  difficulty,
  rivalDisplay,
  onPlayAgain,
  onBack,
}: BattleResultsProps) {
  const reduceMotion = useReducedMotion()
  const playerWon = winner === 'player'

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="text-center sm:max-w-md"
        aria-label={playerWon ? 'ניצחון' : 'הפסד'}
      >
        <DialogHeader className="items-center">
          <motion.div
            initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }}
            className="mx-auto flex size-16 items-center justify-center rounded-full"
            style={playerWon
              ? { background: 'oklch(0.672 0.148 168 / 20%)', color: 'var(--game-accent-green)', boxShadow: '0 0 20px oklch(0.672 0.148 168 / 40%)' }
              : { background: 'oklch(0.65 0.24 25 / 20%)', color: 'oklch(0.75 0.2 25)', boxShadow: '0 0 20px oklch(0.65 0.24 25 / 40%)' }
            }
          >
            <Trophy className="size-8" />
          </motion.div>
          <DialogTitle
            className="text-2xl font-black"
            aria-live="assertive"
            style={playerWon
              ? { color: 'var(--game-accent-green)', textShadow: '0 0 12px oklch(0.672 0.148 168 / 50%)' }
              : { color: 'oklch(0.75 0.2 25)', textShadow: '0 0 12px oklch(0.65 0.24 25 / 40%)' }
            }
          >
            {playerWon ? 'ניצחון!' : 'הפסד...'}
          </DialogTitle>
          <DialogDescription>
            {playerWon
              ? `כל הכבוד! ניצחת את ${rivalDisplay.nameHe}!`
              : `${rivalDisplay.nameHe} ניצח הפעם. נסה שוב!`}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          {/* Stats comparison table */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--game-bg-elevated)', border: '1px solid var(--game-border)' }}
            role="table"
            aria-label="השוואת תוצאות"
          >
            {/* Column headers */}
            <div className="grid grid-cols-3 gap-2 text-sm" role="rowgroup">
              <div
                className="text-muted-foreground font-medium"
                role="columnheader"
              >
                &nbsp;
              </div>
              <div className="font-bold" role="columnheader">
                אתה
              </div>
              {/* Rival column header with portrait */}
              <div className="flex items-center justify-center gap-1.5 font-bold" role="columnheader">
                <div
                  className="overflow-hidden rounded-full border"
                  style={{
                    width: 24,
                    height: 24,
                    boxShadow: `0 0 8px ${rivalDisplay.glowColor}`,
                    borderColor: rivalDisplay.themeColor,
                  }}
                >
                  <Image
                    src={rivalDisplay.image}
                    alt={rivalDisplay.nameHe}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <span style={{ color: rivalDisplay.themeColor }}>
                  {rivalDisplay.nameHe}
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-sm" role="row">
                <div className="text-muted-foreground" role="rowheader">
                  מהירות (מ/ד)
                </div>
                <div className="tabular-nums" role="cell">{stats.playerWpm}</div>
                <div className="tabular-nums" role="cell">{stats.aiWpm}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm" role="row">
                <div className="text-muted-foreground" role="rowheader">
                  דיוק
                </div>
                <div className="tabular-nums" role="cell">{stats.playerAccuracy}%</div>
                <div className="tabular-nums" role="cell">{stats.aiAccuracy}%</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm" role="row">
                <div className="text-muted-foreground" role="rowheader">
                  זמן
                </div>
                <div className="col-span-2 tabular-nums" role="cell">
                  {stats.timeSeconds} שניות
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="text-muted-foreground text-sm">
            רמה: {DIFFICULTY_LABELS[difficulty]}
          </div>

          {/* XP earned */}
          <motion.div
            initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.1, duration: 0.15, ease: 'easeOut' }}
            className="rounded-xl p-3 text-center"
            style={{ background: 'oklch(0.55 0.2 292 / 15%)', border: '1px solid oklch(0.55 0.2 292 / 30%)' }}
          >
            <span
              className="text-lg font-black"
              style={{ color: 'var(--game-accent-purple)', textShadow: 'var(--game-text-glow)' }}
            >
              +{xpEarned} XP
            </span>
          </motion.div>
        </div>

        <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
          <Button onClick={onPlayAgain} className="game-button gap-2">
            <RotateCcw className="size-4" />
            שחק שוב
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2"
            style={{ borderColor: 'var(--game-border)' }}
          >
            <ArrowRight className="size-4" />
            חזור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
