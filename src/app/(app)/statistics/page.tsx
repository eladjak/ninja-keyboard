'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Zap,
  Target,
  Clock,
  Trophy,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressChart } from '@/components/statistics/progress-chart'
import { KeyboardHeatmap } from '@/components/statistics/keyboard-heatmap'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { useXpStore } from '@/stores/xp-store'
import { cn } from '@/lib/utils'

/** Format milliseconds to a human-readable Hebrew string */
function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000)
  if (totalMinutes < 60) return `${totalMinutes} דקות`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours} שעות`
  return `${hours} שעות ו-${minutes} דקות`
}

/** Color for accuracy value */
function accuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-600 dark:text-green-400'
  if (accuracy >= 75) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export default function StatisticsPage() {
  const practiceHistory = usePracticeHistoryStore()
  const { totalXp, level, streak } = useXpStore()

  const bestWpm = practiceHistory.getBestWpm()
  const bestAccuracy = practiceHistory.getBestAccuracy()
  const totalTime = practiceHistory.getTotalPracticeTime()
  const problematicKeys = practiceHistory.getProblematicKeys()
  const wpmTrend = practiceHistory.getWpmTrend()
  const totalSessions = practiceHistory.results.length

  // Calculate averages
  const averages = useMemo(() => {
    const { results } = practiceHistory
    if (results.length === 0) return { avgWpm: 0, avgAccuracy: 0 }
    const avgWpm = Math.round(
      results.reduce((sum, r) => sum + r.wpm, 0) / results.length,
    )
    const avgAccuracy = Math.round(
      results.reduce((sum, r) => sum + r.accuracy, 0) / results.length,
    )
    return { avgWpm, avgAccuracy }
  }, [practiceHistory])

  // Recent improvement (last 5 vs previous 5)
  const improvement = useMemo(() => {
    const { results } = practiceHistory
    if (results.length < 6) return null
    const recent5 = results.slice(0, 5)
    const prev5 = results.slice(5, 10)
    if (prev5.length < 5) return null

    const recentAvg = Math.round(
      recent5.reduce((s, r) => s + r.wpm, 0) / 5,
    )
    const prevAvg = Math.round(prev5.reduce((s, r) => s + r.wpm, 0) / 5)
    return recentAvg - prevAvg
  }, [practiceHistory])

  const hasData = totalSessions > 0

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4" dir="rtl">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">סטטיסטיקות</h1>
          <p className="text-sm text-muted-foreground">
            {hasData
              ? `${totalSessions} תרגולים עד כה`
              : 'התחל לתרגל כדי לראות סטטיסטיקות'}
          </p>
        </div>
        <BarChart3 className="size-8 text-primary" />
      </div>

      {/* ── Overview cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="py-3 gap-0">
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Zap className="size-5 text-primary" />
            <span className="text-xl font-bold tabular-nums">
              {hasData ? bestWpm : '-'}
            </span>
            <span className="text-xs text-muted-foreground">שיא מ/ד</span>
          </CardContent>
        </Card>
        <Card className="py-3 gap-0">
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Target className="size-5 text-primary" />
            <span className={cn('text-xl font-bold tabular-nums', hasData && accuracyColor(bestAccuracy))}>
              {hasData ? `${bestAccuracy}%` : '-'}
            </span>
            <span className="text-xs text-muted-foreground">שיא דיוק</span>
          </CardContent>
        </Card>
        <Card className="py-3 gap-0">
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Clock className="size-5 text-primary" />
            <span className="text-xl font-bold tabular-nums">
              {hasData ? formatDuration(totalTime) : '-'}
            </span>
            <span className="text-xs text-muted-foreground">זמן תרגול</span>
          </CardContent>
        </Card>
        <Card className="py-3 gap-0">
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Trophy className="size-5 text-primary" />
            <span className="text-xl font-bold tabular-nums">{level}</span>
            <span className="text-xs text-muted-foreground">
              רמה ({totalXp} XP)
            </span>
          </CardContent>
        </Card>
      </div>

      {/* ── Averages + streak ───────────────────────────────────── */}
      {hasData && (
        <Card>
          <CardContent className="grid grid-cols-3 gap-4 px-4 py-4 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums">{averages.avgWpm}</p>
              <p className="text-xs text-muted-foreground">ממוצע מ/ד</p>
            </div>
            <div>
              <p className={cn('text-lg font-bold tabular-nums', accuracyColor(averages.avgAccuracy))}>
                {averages.avgAccuracy}%
              </p>
              <p className="text-xs text-muted-foreground">ממוצע דיוק</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{streak}</p>
              <p className="text-xs text-muted-foreground">ימים ברצף</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Improvement indicator ───────────────────────────────── */}
      {improvement !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Card className={cn(
            'border',
            improvement > 0
              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
              : 'border-muted',
          )}>
            <CardContent className="flex items-center gap-2 px-4 py-3">
              <TrendingUp
                className={cn(
                  'size-5',
                  improvement > 0 ? 'text-green-600' : 'text-muted-foreground',
                )}
              />
              <span className="text-sm">
                {improvement > 0
                  ? `שיפור של ${improvement} מ/ד ב-5 התרגולים האחרונים!`
                  : improvement < 0
                    ? `ירידה של ${Math.abs(improvement)} מ/ד ב-5 התרגולים האחרונים`
                    : 'ביצועים יציבים ב-5 התרגולים האחרונים'}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── WPM Progress Chart ──────────────────────────────────── */}
      <ProgressChart
        data={wpmTrend}
        title="מהירות הקלדה לאורך זמן"
        metric="wpm"
      />

      {/* ── Accuracy Progress Chart ─────────────────────────────── */}
      <ProgressChart
        data={wpmTrend}
        title="דיוק לאורך זמן"
        metric="accuracy"
      />

      {/* ── Keyboard Heatmap ──────────────────────────────────── */}
      <KeyboardHeatmap />

      {/* ── Problematic keys ────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-orange-500" />
            מקשים בעייתיים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData || problematicKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {hasData
                ? 'כל המקשים בסדר! המשך כך.'
                : 'עדיין אין נתונים. התחל לתרגל כדי לזהות מקשים בעייתיים.'}
            </p>
          ) : (
            <div className="space-y-2">
              {problematicKeys.slice(0, 10).map((key) => (
                <div
                  key={key.char}
                  className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2"
                >
                  <span className="flex size-8 items-center justify-center rounded-md border bg-background font-mono text-lg font-bold">
                    {key.char === ' ' ? '␣' : key.char}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className={accuracyColor(key.accuracy)}>
                        {key.accuracy}% דיוק
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {key.total} הקשות
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          key.accuracy >= 90
                            ? 'bg-green-500'
                            : key.accuracy >= 75
                              ? 'bg-yellow-500'
                              : 'bg-red-500',
                        )}
                        style={{ width: `${key.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Recent sessions ─────────────────────────────────────── */}
      {hasData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">תרגולים אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {practiceHistory.results.slice(0, 10).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(r.completedAt).toLocaleDateString('he-IL')}
                </span>
                <div className="flex gap-4">
                  <span className="font-medium">{r.wpm} מ/ד</span>
                  <span className={accuracyColor(r.accuracy)}>
                    {r.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
