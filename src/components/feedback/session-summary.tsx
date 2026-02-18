'use client'

import { motion } from 'framer-motion'
import { Zap, Target, Clock, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface SessionSummaryStats {
  /** Words per minute */
  wpm: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Total keystrokes during the session */
  totalKeystrokes: number
  /** Session duration in milliseconds */
  duration: number
  /** Longest correct streak */
  correctStreak: number
}

export interface SessionSummaryProps {
  /** Stats for the completed session */
  stats: SessionSummaryStats
  /** Previous session stats for comparison (optional) */
  previousStats?: {
    wpm: number
    accuracy: number
  }
  /** XP earned this session */
  xpEarned: number
  /** Badge names earned this session */
  badgesEarned: string[]
  /** Display name of the completed lesson */
  lessonTitle: string
  /** Called when user clicks "שיעור הבא" */
  onContinue: () => void
  /** Called when user clicks "נסה שוב" */
  onRetry: () => void
}

/** Format milliseconds as M:SS */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** Comparison direction */
type Direction = 'up' | 'down' | 'neutral'

function getDirection(current: number, previous: number): Direction {
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'neutral'
}

/** Arrow character + color for comparison direction */
const directionArrow: Record<Direction, { symbol: string; className: string }> = {
  up:      { symbol: '↑', className: 'text-green-600 dark:text-green-400' },
  down:    { symbol: '↓', className: 'text-red-600 dark:text-red-400' },
  neutral: { symbol: '→', className: 'text-zinc-500 dark:text-zinc-400' },
}

interface StatCircleProps {
  icon: React.ReactNode
  label: string
  value: string
  comparison?: Direction
}

function StatCircle({ icon, label, value, comparison }: StatCircleProps) {
  const arrow = comparison ? directionArrow[comparison] : null

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
        {arrow && (
          <span
            className={cn('text-sm font-semibold leading-none', arrow.className)}
            aria-hidden="true"
          >
            {arrow.symbol}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

/** Build contextual improvement or encouragement message based on comparison */
function buildComparisonMessage(
  stats: SessionSummaryStats,
  previous: { wpm: number; accuracy: number } | undefined,
): string | null {
  if (!previous) return null

  const accuracyDrop = previous.accuracy - stats.accuracy
  const accuracyGain = stats.accuracy - previous.accuracy

  if (accuracyDrop > 5) {
    return 'לפעמים יש ימים יותר קשים. זה בסדר גמור.'
  }
  if (accuracyGain >= 5) {
    return `שיפור של ${accuracyGain}%! כל הכבוד!`
  }

  const wpmGain = stats.wpm - previous.wpm
  if (wpmGain > 0) {
    return `שיפור של ${wpmGain} מילים/דקה! מצוין!`
  }

  return null
}

/**
 * End-of-session summary card with stats, comparison arrows, XP counter,
 * badge display, and action buttons. All text is in Hebrew (RTL).
 */
export function SessionSummary({
  stats,
  previousStats,
  xpEarned,
  badgesEarned,
  lessonTitle,
  onContinue,
  onRetry,
}: SessionSummaryProps) {
  const wpmDir = previousStats ? getDirection(stats.wpm, previousStats.wpm) : undefined
  const accuracyDir = previousStats ? getDirection(stats.accuracy, previousStats.accuracy) : undefined

  const comparisonMessage = buildComparisonMessage(stats, previousStats)

  return (
    <Card dir="rtl" className="w-full max-w-md gap-4 py-6">
      <CardHeader className="pb-0">
        <CardTitle className="text-center text-lg">{lessonTitle}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Stats circles */}
        <div className="grid grid-cols-4 gap-2">
          <StatCircle
            icon={<Zap className="size-5" />}
            label="מ/ד"
            value={stats.wpm.toString()}
            comparison={wpmDir}
          />
          <StatCircle
            icon={<Target className="size-5" />}
            label="דיוק"
            value={`${stats.accuracy}%`}
            comparison={accuracyDir}
          />
          <StatCircle
            icon={<Clock className="size-5" />}
            label="זמן"
            value={formatDuration(stats.duration)}
          />
          <StatCircle
            icon={<Flame className="size-5" />}
            label="רצף"
            value={stats.correctStreak.toString()}
          />
        </div>

        {/* Comparison message */}
        {comparisonMessage && (
          <p className="text-center text-sm text-muted-foreground">
            {comparisonMessage}
          </p>
        )}

        {/* XP earned */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">XP שנצבר:</span>
          <motion.span
            className="text-2xl font-bold tabular-nums text-primary"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.18 }}
          >
            +{xpEarned}
          </motion.span>
        </div>

        {/* Badges earned */}
        {badgesEarned.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {badgesEarned.map((badge) => (
              <motion.div
                key={badge}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                <Badge variant="secondary" className="gap-1 py-1 text-sm">
                  <span aria-hidden="true">🏅</span>
                  {badge}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onRetry}>
            נסה שוב
          </Button>
          <Button className="flex-1" onClick={onContinue}>
            שיעור הבא
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
