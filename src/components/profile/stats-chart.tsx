'use client'

import { useXpStore } from '@/stores/xp-store'
import { cn } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'

interface StatsChartProps {
  className?: string
}

/**
 * Simple WPM bar chart using pure CSS/divs.
 * Shows the last 10 session WPMs from completed lessons (sorted by date).
 */
export function StatsChart({ className }: StatsChartProps) {
  const { completedLessons } = useXpStore()

  const sessions = Object.values(completedLessons)
    .sort((a, b) => a.completedAt - b.completedAt)
    .slice(-10)

  const wpmValues = sessions.map((s) => s.bestWpm)
  const maxWpm = wpmValues.length > 0 ? Math.max(...wpmValues) : 0
  const minWpm = wpmValues.length > 0 ? Math.min(...wpmValues) : 0
  const avgWpm =
    wpmValues.length > 0
      ? Math.round(wpmValues.reduce((s, v) => s + v, 0) / wpmValues.length)
      : 0

  return (
    <div
      className={cn('game-card-border overflow-hidden', className)}
      dir="rtl"
      style={{ borderColor: 'oklch(0.55 0.2 292 / 30%)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 p-4 pb-3"
        style={{ borderBottom: '1px solid var(--game-border)' }}
      >
        <BarChart3 className="size-4" style={{ color: 'var(--game-accent-purple)' }} />
        <h3 className="game-section-title text-base">היסטוריית מהירות</h3>
      </div>

      <div className="space-y-4 p-4">
        {wpmValues.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            אין נתונים עדיין. התחל לתרגל!
          </p>
        ) : (
          <>
            {/* Stats labels */}
            <div className="flex justify-between text-sm" role="list" aria-label="סיכום מהירות">
              <div role="listitem" className="text-center">
                <span className="text-muted-foreground text-xs">מינימום</span>
                <p className="font-bold text-foreground">{minWpm} מ/ד</p>
              </div>
              <div role="listitem" className="text-center">
                <span className="text-muted-foreground text-xs">ממוצע</span>
                <p
                  className="font-black"
                  style={{ color: 'var(--game-accent-purple)', textShadow: 'var(--game-text-glow-sm)' }}
                >
                  {avgWpm} מ/ד
                </p>
              </div>
              <div role="listitem" className="text-center">
                <span className="text-muted-foreground text-xs">מקסימום</span>
                <p
                  className="font-black"
                  style={{ color: 'var(--game-accent-green)', textShadow: '0 0 8px oklch(0.672 0.148 168 / 40%)' }}
                >
                  {maxWpm} מ/ד
                </p>
              </div>
            </div>

            {/* Bar chart */}
            <div
              className="flex items-end gap-1.5"
              style={{ height: '160px' }}
              role="img"
              aria-label={`גרף מהירות: ממוצע ${avgWpm} מילים לדקה`}
            >
              {wpmValues.map((wpm, idx) => {
                const heightPercent =
                  maxWpm > 0 ? Math.max(4, (wpm / maxWpm) * 100) : 4
                const isMax = wpm === maxWpm
                return (
                  <div
                    key={idx}
                    className="relative flex flex-1 flex-col items-center"
                    style={{ height: '100%' }}
                  >
                    <div className="flex flex-1 w-full items-end">
                      <div
                        className={cn('w-full rounded-t-sm transition-all')}
                        style={{
                          height: `${heightPercent}%`,
                          background: isMax
                            ? 'linear-gradient(180deg, #00B894, #00a381)'
                            : 'linear-gradient(180deg, oklch(0.55 0.2 292 / 70%), oklch(0.55 0.2 292 / 30%))',
                          boxShadow: isMax
                            ? '0 0 8px oklch(0.672 0.148 168 / 50%)'
                            : '0 0 4px oklch(0.55 0.2 292 / 30%)',
                        }}
                        aria-hidden="true"
                        data-testid={`bar-${idx}`}
                      />
                    </div>
                    <span className="mt-1 text-[10px] text-muted-foreground">
                      {wpm}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              10 השיעורים האחרונים (מילים לדקה)
            </p>
          </>
        )}
      </div>
    </div>
  )
}
