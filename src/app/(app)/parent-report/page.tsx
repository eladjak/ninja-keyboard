'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { generateParentReport, TREND_LABELS } from '@/lib/reports/parent-report'
import { useXpStore } from '@/stores/xp-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { cn } from '@/lib/utils'

const TREND_ICONS = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
}

const TREND_COLORS = {
  improving: 'text-green-600 dark:text-green-400',
  stable: 'text-muted-foreground',
  declining: 'text-red-600 dark:text-red-400',
}

export default function ParentReportPage() {
  const { totalXp, level, streak, completedLessons } = useXpStore()
  const practiceHistory = usePracticeHistoryStore()

  const report = useMemo(() => {
    return generateParentReport({
      totalXp,
      level,
      streak,
      lessonsCompleted: Object.keys(completedLessons).length,
      totalLessons: 20,
      results: practiceHistory.results.map((r) => ({
        wpm: r.wpm,
        accuracy: r.accuracy,
        durationMs: r.durationMs,
        completedAt: r.completedAt,
      })),
    })
  }, [totalXp, level, streak, completedLessons, practiceHistory])

  const TrendIcon = TREND_ICONS[report.performance.wpmTrend]

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      {/* Header */}
      <div className="game-card-border flex items-center justify-between p-4" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}>
        <div>
          <h1 className="text-xl font-bold text-glow sm:text-2xl">דוח התקדמות להורים</h1>
          <p className="text-sm text-muted-foreground">
            נוצר ב-{new Date(report.generatedAt).toLocaleDateString('he-IL')}
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: 'oklch(0.495 0.205 292 / 20%)', boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)' }}>
          <FileText className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="game-card-border py-3 gap-0" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Star className="size-5 text-primary" />
            <span className="text-xl font-bold">{report.summary.currentLevel}</span>
            <span className="text-xs text-muted-foreground">רמה</span>
          </CardContent>
        </Card>
        <Card className="game-card-border py-3 gap-0" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Zap className="size-5 text-amber-500" />
            <span className="text-xl font-bold">{report.summary.totalXp}</span>
            <span className="text-xs text-muted-foreground">XP</span>
          </CardContent>
        </Card>
        <Card className="game-card-border py-3 gap-0" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Flame className="size-5 text-orange-500" />
            <span className="text-xl font-bold">{report.summary.streak}</span>
            <span className="text-xs text-muted-foreground">ימי רצף</span>
          </CardContent>
        </Card>
        <Card className="game-card-border py-3 gap-0" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Trophy className="size-5 text-green-500" />
            <span className="text-xl font-bold">
              {report.summary.lessonsCompleted}/{report.summary.totalLessons}
            </span>
            <span className="text-xs text-muted-foreground">שיעורים</span>
          </CardContent>
        </Card>
        <Card className="game-card-border py-3 gap-0" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <Clock className="size-5 text-blue-500" />
            <span className="text-xl font-bold">{report.summary.totalPracticeMinutes}</span>
            <span className="text-xs text-muted-foreground">דקות תרגול</span>
          </CardContent>
        </Card>
        <Card className="game-card-border py-3 gap-0" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardContent className="flex flex-col items-center gap-1 px-3 py-0">
            <FileText className="size-5 text-purple-500" />
            <span className="text-xl font-bold">{report.summary.totalSessions}</span>
            <span className="text-xs text-muted-foreground">תרגולים</span>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ביצועים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(0.15 0.02 292 / 40%)' }}>
              <p className="text-2xl font-bold tabular-nums">{report.performance.bestWpm}</p>
              <p className="text-xs text-muted-foreground">שיא מ/ד</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(0.15 0.02 292 / 40%)' }}>
              <p className="text-2xl font-bold tabular-nums">{report.performance.averageWpm}</p>
              <p className="text-xs text-muted-foreground">ממוצע מ/ד</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(0.15 0.02 292 / 40%)' }}>
              <p className="text-2xl font-bold tabular-nums">{report.performance.bestAccuracy}%</p>
              <p className="text-xs text-muted-foreground">שיא דיוק</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(0.15 0.02 292 / 40%)' }}>
              <p className="text-2xl font-bold tabular-nums">{report.performance.averageAccuracy}%</p>
              <p className="text-xs text-muted-foreground">ממוצע דיוק</p>
            </div>
          </div>

          <Separator />

          {/* Trend */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">מגמת מהירות</span>
            <Badge variant="outline" className={cn('gap-1', TREND_COLORS[report.performance.wpmTrend])}>
              <TrendIcon className="size-3" />
              {TREND_LABELS[report.performance.wpmTrend]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="size-4 text-green-500" />
            נקודות חוזק
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-green-500">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Areas to improve */}
      {report.areasToImprove.length > 0 && (
        <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" />
              תחומים לשיפור
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.areasToImprove.map((area, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-amber-500">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.1 }}
      >
        <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)', background: 'oklch(0.495 0.205 292 / 8%)' }}>
          <CardContent className="px-4 py-4">
            <p className="text-sm font-medium text-primary">המלצה</p>
            <p className="mt-1 text-sm">{report.recommendationHe}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
