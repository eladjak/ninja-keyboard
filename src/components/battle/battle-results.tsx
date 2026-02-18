'use client'

import { Button } from '@/components/ui/button'
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
  timeSeconds: number
}

interface BattleResultsProps {
  open: boolean
  winner: BattleWinner
  stats: BattleStats
  xpEarned: number
  difficulty: BattleDifficulty
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
  onPlayAgain,
  onBack,
}: BattleResultsProps) {
  const playerWon = winner === 'player'

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="text-center sm:max-w-md"
        aria-label={playerWon ? 'ניצחון' : 'הפסד'}
      >
        <DialogHeader className="items-center">
          <div
            className={`mx-auto flex size-16 items-center justify-center rounded-full ${
              playerWon
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            <Trophy className="size-8" />
          </div>
          <DialogTitle className="text-2xl">
            {playerWon ? 'ניצחון!' : 'הפסד...'}
          </DialogTitle>
          <DialogDescription>
            {playerWon
              ? 'כל הכבוד! ניצחת את הנינג\u05F3ה בוט!'
              : 'הנינג\u05F3ה בוט ניצח הפעם. נסה שוב!'}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          {/* Stats comparison table */}
          <div
            className="rounded-lg border p-4"
            role="table"
            aria-label="השוואת תוצאות"
          >
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
              <div className="font-bold text-red-500" role="columnheader">
                נינג&apos;ה בוט
              </div>
            </div>

            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-sm" role="row">
                <div className="text-muted-foreground" role="rowheader">
                  מהירות (מ/ד)
                </div>
                <div role="cell">{stats.playerWpm}</div>
                <div role="cell">{stats.aiWpm}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm" role="row">
                <div className="text-muted-foreground" role="rowheader">
                  דיוק
                </div>
                <div role="cell">{stats.playerAccuracy}%</div>
                <div role="cell">
                  {difficulty === 'easy'
                    ? '90%'
                    : difficulty === 'medium'
                      ? '95%'
                      : '98%'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm" role="row">
                <div className="text-muted-foreground" role="rowheader">
                  זמן
                </div>
                <div className="col-span-2" role="cell">
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
          <div className="rounded-lg bg-primary/10 p-3">
            <span className="text-lg font-bold text-primary">
              +{xpEarned} XP
            </span>
          </div>
        </div>

        <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
          <Button onClick={onPlayAgain} className="gap-2">
            <RotateCcw className="size-4" />
            שחק שוב
          </Button>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowRight className="size-4" />
            חזור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
