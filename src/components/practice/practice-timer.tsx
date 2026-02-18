'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Available timer durations in seconds */
export const TIMER_DURATIONS = [60, 120, 300] as const
export type TimerDuration = (typeof TIMER_DURATIONS)[number]

/** Labels for timer durations in Hebrew */
export const TIMER_LABELS: Record<TimerDuration, string> = {
  60: 'דקה',
  120: '2 דקות',
  300: '5 דקות',
}

interface PracticeTimerProps {
  /** Selected duration in seconds */
  duration: TimerDuration
  /** Called when the duration changes */
  onDurationChange: (duration: TimerDuration) => void
  /** Whether the timer is running */
  isRunning: boolean
  /** Called when the timer starts */
  onStart: () => void
  /** Called when the timer pauses */
  onPause: () => void
  /** Called when the timer finishes (reaches 0) */
  onFinish: () => void
  /** Called when the timer resets */
  onReset: () => void
  /** Additional CSS classes */
  className?: string
}

/** Format seconds as MM:SS */
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Countdown timer for practice mode.
 * Supports 1, 2, and 5 minute durations with play/pause/reset controls.
 */
export function PracticeTimer({
  duration,
  onDurationChange,
  isRunning,
  onStart,
  onPause,
  onFinish,
  onReset,
  className,
}: PracticeTimerProps) {
  const [remaining, setRemaining] = useState<number>(duration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasFinishedRef = useRef(false)

  // Reset remaining when duration changes
  useEffect(() => {
    setRemaining(duration)
    hasFinishedRef.current = false
  }, [duration])

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (!hasFinishedRef.current) {
            hasFinishedRef.current = true
            // Defer onFinish to avoid state update during render
            setTimeout(onFinish, 0)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, onFinish])

  const handleReset = useCallback(() => {
    setRemaining(duration)
    hasFinishedRef.current = false
    onReset()
  }, [duration, onReset])

  const progress = duration > 0 ? (remaining / duration) * 100 : 0
  const isLow = remaining <= 10 && remaining > 0

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="flex flex-col items-center gap-3 px-4 py-4">
        {/* Duration selector */}
        <div className="flex gap-2" role="radiogroup" aria-label="בחירת זמן תרגול">
          {TIMER_DURATIONS.map((d) => (
            <Button
              key={d}
              variant={duration === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (!isRunning) onDurationChange(d)
              }}
              disabled={isRunning}
              role="radio"
              aria-checked={duration === d}
            >
              {TIMER_LABELS[d]}
            </Button>
          ))}
        </div>

        {/* Timer display */}
        <div className="relative flex items-center justify-center">
          {/* Progress ring (SVG circle) */}
          <svg
            className="size-24"
            viewBox="0 0 96 96"
            aria-hidden="true"
          >
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="currentColor"
              className="text-muted/30"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="currentColor"
              className={cn(
                'transition-all duration-1000',
                isLow ? 'text-red-500' : 'text-primary',
              )}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              transform="rotate(-90 48 48)"
            />
          </svg>
          {/* Time text */}
          <AnimatePresence mode="wait">
            <motion.span
              key={remaining}
              className={cn(
                'absolute text-2xl font-bold tabular-nums',
                isLow && 'text-red-500',
              )}
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0.6 }}
              transition={{ duration: 0.1 }}
              aria-live="polite"
              aria-label={`נותרו ${formatTime(remaining)}`}
            >
              {formatTime(remaining)}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            aria-label="איפוס טיימר"
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            size="icon"
            onClick={isRunning ? onPause : onStart}
            aria-label={isRunning ? 'השהה' : 'התחל'}
            disabled={remaining === 0}
          >
            {isRunning ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{TIMER_LABELS[duration]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
