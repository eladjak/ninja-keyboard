'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useXpStore } from '@/stores/xp-store'
import { cn } from '@/lib/utils'

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
    <Card className={cn('overflow-hidden', className)} dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">היסטוריית מהירות</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {wpmValues.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            אין נתונים עדיין. התחל לתרגל!
          </p>
        ) : (
          <>
            {/* Stats labels */}
            <div className="flex justify-between text-sm" role="list" aria-label="סיכום מהירות">
              <div role="listitem" className="text-center">
                <span className="text-muted-foreground">מינימום</span>
                <p className="font-bold">{minWpm} מ/ד</p>
              </div>
              <div role="listitem" className="text-center">
                <span className="text-muted-foreground">ממוצע</span>
                <p className="font-bold text-primary">{avgWpm} מ/ד</p>
              </div>
              <div role="listitem" className="text-center">
                <span className="text-muted-foreground">מקסימום</span>
                <p className="font-bold">{maxWpm} מ/ד</p>
              </div>
            </div>

            {/* Bar chart */}
            <div
              className="flex items-end gap-2"
              style={{ height: '160px' }}
              role="img"
              aria-label={`גרף מהירות: ממוצע ${avgWpm} מילים לדקה`}
            >
              {wpmValues.map((wpm, idx) => {
                const heightPercent =
                  maxWpm > 0 ? Math.max(4, (wpm / maxWpm) * 100) : 4
                return (
                  <div
                    key={idx}
                    className="relative flex flex-1 flex-col items-center"
                    style={{ height: '100%' }}
                  >
                    <div className="flex flex-1 w-full items-end">
                      <div
                        className={cn(
                          'w-full rounded-t-sm transition-all',
                          wpm === maxWpm
                            ? 'bg-primary'
                            : 'bg-primary/40',
                        )}
                        style={{ height: `${heightPercent}%` }}
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
      </CardContent>
    </Card>
  )
}
