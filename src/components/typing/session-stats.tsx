'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Target, Keyboard, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SessionStatsProps {
  /** Current words per minute */
  wpm: number
  /** Current accuracy percentage (0-100) */
  accuracy: number
  /** Total keystrokes so far */
  keystrokes: number
  /** Elapsed time in milliseconds */
  elapsed: number
  /** Additional CSS classes */
  className?: string
}

/** Format milliseconds as MM:SS */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** Accuracy colour: green > 90, yellow > 75, red otherwise */
function accuracyColor(accuracy: number): string {
  if (accuracy > 90) return 'text-green-600 dark:text-green-400'
  if (accuracy > 75) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}

function StatCard({ icon, label, value, valueClassName }: StatCardProps) {
  return (
    <Card className="flex-1 min-w-0 py-3 gap-0">
      <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
        <div className="text-muted-foreground">{icon}</div>
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            className={cn(
              'text-xl font-bold tabular-nums leading-none sm:text-2xl',
              valueClassName,
            )}
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0.6 }}
            transition={{ duration: 0.12 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
}

/**
 * Real-time session statistics strip.
 * Displays WPM, accuracy, keystrokes, and elapsed time as a horizontal row
 * on desktop that collapses to a 2x2 grid on mobile.
 */
export function SessionStats({
  wpm,
  accuracy,
  keystrokes,
  elapsed,
  className,
}: SessionStatsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-4',
        className,
      )}
      role="status"
      aria-label="סטטיסטיקות הפעלה"
      aria-live="polite"
      aria-atomic="false"
    >
      <StatCard
        icon={<Zap className="size-4" />}
        label="מילים/דקה"
        value={wpm.toString()}
      />
      <StatCard
        icon={<Target className="size-4" />}
        label="דיוק"
        value={`${accuracy}%`}
        valueClassName={accuracyColor(accuracy)}
      />
      <StatCard
        icon={<Keyboard className="size-4" />}
        label="הקשות"
        value={keystrokes.toString()}
      />
      <StatCard
        icon={<Clock className="size-4" />}
        label="זמן"
        value={formatElapsed(elapsed)}
      />
    </div>
  )
}
