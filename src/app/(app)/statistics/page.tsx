'use client'

import Image from 'next/image'
import Link from 'next/link'
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
  TrendingDown,
  Minus,
  Star,
  Flame,
  ChevronLeft,
  Keyboard,
  History,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProgressChart } from '@/components/statistics/progress-chart'
import { KeyboardHeatmap } from '@/components/statistics/keyboard-heatmap'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { useXpStore } from '@/stores/xp-store'
import { CharacterIdleWrapper } from '@/components/characters/character-idle-wrapper'
import { cn, formatNumber } from '@/lib/utils'
import { useHydrated } from '@/hooks/use-hydrated'

/** Format milliseconds to a compact Hebrew string */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1_000)
  if (totalSeconds < 60) return `${totalSeconds} שנ'`
  const totalMinutes = Math.floor(totalSeconds / 60)
  if (totalMinutes < 60) return `${totalMinutes} דק'`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours} שע'` : `${hours}:${String(minutes).padStart(2, '0')}`
}

/** Format milliseconds to full Hebrew string for the overview card */
function formatTotalTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000)
  if (totalMinutes < 60) return `${totalMinutes} דקות`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours} שעות`
  return `${hours}:${String(minutes).padStart(2, '0')} שע'`
}

/** Tailwind text color for accuracy value */
function accuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-emerald-400'
  if (accuracy >= 75) return 'text-yellow-400'
  return 'text-red-400'
}

/** Tailwind background for accuracy bar */
function accuracyBarColor(accuracy: number): string {
  if (accuracy >= 90) return 'bg-emerald-500'
  if (accuracy >= 75) return 'bg-yellow-500'
  return 'bg-red-500'
}

/** Readable label for a textId */
function textIdLabel(textId: string): string {
  if (textId === 'free') return 'חופשי'
  if (textId.startsWith('lesson-')) return `שיעור ${textId.replace('lesson-', '')}`
  if (textId.startsWith('drill-')) return `אימון ${textId.replace('drill-', '')}`
  // Truncate long IDs
  return textId.length > 14 ? `${textId.slice(0, 12)}…` : textId
}

/** XP level thresholds (mirrored from xp-store) */
const LEVEL_THRESHOLDS = [
  0, 50, 120, 210, 320, 450, 600, 780, 1000, 1250,
  1550, 1900, 2300, 2750, 3250, 3800, 4400, 5100, 5900, 6800,
] as const

/** Get XP required for a given level */
function xpForLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0
}

/** Framer Motion stagger container */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' as const } },
}

export default function StatisticsPage() {
  // Persisted stores rehydrate from localStorage only on the client. Until then
  // render the server's empty/default state (no sessions, 0 XP, level 1) so the
  // first client render matches; real values flow in after mount.
  const hydrated = useHydrated()
  const practiceHistory = usePracticeHistoryStore()
  const xp = useXpStore()
  const totalXp = hydrated ? xp.totalXp : 0
  const level = hydrated ? xp.level : 1
  const streak = hydrated ? xp.streak : 0
  const xpToNextLevel = xp.xpToNextLevel
  const levelProgress = xp.levelProgress

  const bestWpm = hydrated ? practiceHistory.getBestWpm() : 0
  const bestAccuracy = hydrated ? practiceHistory.getBestAccuracy() : 0
  const totalTime = hydrated ? practiceHistory.getTotalPracticeTime() : 0
  const problematicKeys = hydrated ? practiceHistory.getProblematicKeys() : []
  const wpmTrend = hydrated ? practiceHistory.getWpmTrend() : []
  const totalSessions = hydrated ? practiceHistory.results.length : 0
  const hasData = totalSessions > 0

  // Averages across all sessions
  const averages = useMemo(() => {
    const { results } = practiceHistory
    if (results.length === 0) return { avgWpm: 0, avgAccuracy: 0 }
    const avgWpm = Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length)
    const avgAccuracy = Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length)
    return { avgWpm, avgAccuracy }
  }, [practiceHistory])

  // Recent improvement: last 5 vs previous 5 sessions
  const improvement = useMemo(() => {
    const { results } = practiceHistory
    if (results.length < 6) return null
    const recent5 = results.slice(0, 5)
    const prev5 = results.slice(5, 10)
    if (prev5.length < 5) return null
    const recentAvg = Math.round(recent5.reduce((s, r) => s + r.wpm, 0) / 5)
    const prevAvg = Math.round(prev5.reduce((s, r) => s + r.wpm, 0) / 5)
    return recentAvg - prevAvg
  }, [practiceHistory])

  // XP progress bar values (pinned to level-1 defaults pre-hydration)
  const xpNeeded = hydrated ? xpToNextLevel() : 50
  const levelPct = hydrated ? levelProgress() : 0
  const xpCurrentLevel = xpForLevel(level)
  const xpNextLevel = xpForLevel(level + 1)
  const isMaxLevel = level >= 20

  // Top 5 weakest keys only
  const weakestKeys = problematicKeys.slice(0, 5)

  // Last 10 sessions for the history table
  const recentSessions = practiceHistory.results.slice(0, 10)

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4" dir="rtl">

      {/* ── Page header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="game-card-border flex items-center justify-between rounded-2xl p-4"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}
      >
        <div>
          <h1 className="text-glow text-xl font-bold sm:text-2xl">סטטיסטיקות</h1>
          <p className="text-sm text-muted-foreground">
            {hasData
              ? `${totalSessions} תרגולים הושלמו`
              : 'התחל לתרגל כדי לראות סטטיסטיקות'}
          </p>
        </div>
        <div
          className="flex size-11 items-center justify-center rounded-xl"
          style={{
            background: 'oklch(0.495 0.205 292 / 20%)',
            boxShadow: '0 0 14px oklch(0.495 0.205 292 / 30%)',
          }}
        >
          <BarChart3 className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
        </div>
      </motion.div>

      {/* ── Pixel mascot ─────────────────────────────────────────── */}
      <div className="flex justify-center">
        <CharacterIdleWrapper character="pixel" intensity="normal" entryAnimation>
          <Image
            src="/images/characters/heroes/pixel-hero.jpg"
            alt="פיקסל — מומחה הסטטיסטיקות"
            width={200}
            height={200}
            className="rounded-2xl object-cover"
            style={{ boxShadow: '0 0 32px rgba(0,206,201,0.45)' }}
            priority
          />
        </CharacterIdleWrapper>
      </div>

      {/* ── Overview cards (4 stats) ─────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {/* Best WPM */}
        <motion.div variants={itemVariants}>
          <Card
            className="game-card-border py-4 gap-0"
            style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
          >
            <CardContent className="flex flex-col items-center gap-1.5 px-3 py-0">
              <Zap className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
              <span className="text-2xl font-bold tabular-nums">
                {hasData ? bestWpm : '—'}
              </span>
              <span className="text-center text-xs text-muted-foreground">שיא מ/ד</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Best accuracy */}
        <motion.div variants={itemVariants}>
          <Card
            className="game-card-border py-4 gap-0"
            style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
          >
            <CardContent className="flex flex-col items-center gap-1.5 px-3 py-0">
              <Target className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
              <span
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  hasData && accuracyColor(bestAccuracy),
                )}
              >
                {hasData ? `${bestAccuracy}%` : '—'}
              </span>
              <span className="text-center text-xs text-muted-foreground">שיא דיוק</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total practice time */}
        <motion.div variants={itemVariants}>
          <Card
            className="game-card-border py-4 gap-0"
            style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
          >
            <CardContent className="flex flex-col items-center gap-1.5 px-3 py-0">
              <Clock className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
              <span className="text-2xl font-bold tabular-nums">
                {hasData ? formatTotalTime(totalTime) : '—'}
              </span>
              <span className="text-center text-xs text-muted-foreground">זמן תרגול</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak */}
        <motion.div variants={itemVariants}>
          <Card
            className="game-card-border py-4 gap-0"
            style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
          >
            <CardContent className="flex flex-col items-center gap-1.5 px-3 py-0">
              <Flame className="size-5 text-orange-400" />
              <span className="text-2xl font-bold tabular-nums">{streak}</span>
              <span className="text-center text-xs text-muted-foreground">
                {streak === 1 ? 'יום רצף' : 'ימי רצף'}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Averages row ─────────────────────────────────────────── */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.1 }}
        >
          <Card
            className="game-card-border"
            style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
          >
            <CardContent className="grid grid-cols-3 gap-4 px-4 py-4 text-center">
              <div>
                <p className="text-lg font-bold tabular-nums">{averages.avgWpm}</p>
                <p className="text-xs text-muted-foreground">ממוצע מ/ד</p>
              </div>
              <div>
                <p
                  className={cn(
                    'text-lg font-bold tabular-nums',
                    accuracyColor(averages.avgAccuracy),
                  )}
                >
                  {averages.avgAccuracy}%
                </p>
                <p className="text-xs text-muted-foreground">ממוצע דיוק</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">{totalSessions}</p>
                <p className="text-xs text-muted-foreground">תרגולים</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Trend indicator ──────────────────────────────────────── */}
      {improvement !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Card
            className={cn(
              'border',
              improvement > 0
                ? 'border-emerald-800/60 bg-emerald-900/20'
                : improvement < 0
                  ? 'border-red-800/60 bg-red-900/20'
                  : 'border-muted',
            )}
          >
            <CardContent className="flex items-center gap-2 px-4 py-3">
              {improvement > 0 ? (
                <TrendingUp className="size-5 shrink-0 text-emerald-400" />
              ) : improvement < 0 ? (
                <TrendingDown className="size-5 shrink-0 text-red-400" />
              ) : (
                <Minus className="size-5 shrink-0 text-muted-foreground" />
              )}
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

      {/* ── XP & Level progress ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.15 }}
      >
        <Card
          className="game-card-border"
          style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="size-4 text-yellow-400" />
              רמה ו-XP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            {/* Level display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-xl text-xl font-bold"
                  style={{
                    background: 'oklch(0.495 0.205 292 / 25%)',
                    boxShadow: '0 0 12px oklch(0.495 0.205 292 / 35%)',
                    color: 'var(--game-accent-purple)',
                  }}
                >
                  {level}
                </div>
                <div>
                  <p className="font-semibold">רמה {level}</p>
                  <p className="text-xs text-muted-foreground">
                    {isMaxLevel ? 'רמה מקסימלית!' : `${xpNeeded} XP לרמה ${level + 1}`}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="tabular-nums">
                {formatNumber(totalXp)} XP
              </Badge>
            </div>

            {/* Progress bar */}
            {!isMaxLevel && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatNumber(xpCurrentLevel)}</span>
                  <span>{formatNumber(xpNextLevel)}</span>
                </div>
                <Progress
                  value={levelPct}
                  className="h-3"
                  style={
                    {
                      '--progress-color': 'var(--game-accent-purple)',
                    } as React.CSSProperties
                  }
                />
                <p className="text-end text-xs text-muted-foreground">{levelPct}% הושלם</p>
              </div>
            )}

            {/* Milestone badges */}
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20].map((milestone) => (
                <Badge
                  key={milestone}
                  variant={level >= milestone ? 'default' : 'outline'}
                  className={cn(
                    'text-xs',
                    level >= milestone
                      ? 'opacity-100'
                      : 'opacity-40',
                  )}
                >
                  <Trophy className="size-3" />
                  רמה {milestone}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── WPM trend chart ──────────────────────────────────────── */}
      <ProgressChart
        data={wpmTrend}
        title="מהירות הקלדה לאורך זמן"
        metric="wpm"
      />

      {/* ── Accuracy trend chart ─────────────────────────────────── */}
      <ProgressChart
        data={wpmTrend}
        title="דיוק לאורך זמן"
        metric="accuracy"
      />

      {/* ── Keyboard heatmap ─────────────────────────────────────── */}
      <KeyboardHeatmap />

      {/* ── Problematic keys ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.2 }}
      >
        <Card
          className="game-card-border"
          style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-orange-400" />
                מקשים בעייתיים
              </CardTitle>
              {hasData && weakestKeys.length > 0 && (
                <Link
                  href="/drill"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
                  style={{ color: 'var(--game-accent-purple)' }}
                >
                  <Keyboard className="size-3.5" />
                  תרגל עכשיו
                  <ChevronLeft className="size-3" />
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!hasData || weakestKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {hasData
                  ? 'כל המקשים בסדר! המשך כך.'
                  : 'עדיין אין נתונים. התחל לתרגל כדי לזהות מקשים בעייתיים.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {weakestKeys.map((key) => (
                  <div
                    key={key.char}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{
                      border: '1.5px solid var(--game-border)',
                      background: 'oklch(0.15 0.02 292 / 40%)',
                    }}
                  >
                    {/* Key cap */}
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background font-mono text-base font-bold">
                      {key.char === ' ' ? '␣' : key.char}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                        <span className={cn('font-medium tabular-nums', accuracyColor(key.accuracy))}>
                          {key.accuracy}% דיוק
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {key.total} הקשות
                        </span>
                      </div>
                      {/* Accuracy bar */}
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn('h-full rounded-full transition-all duration-300', accuracyBarColor(key.accuracy))}
                          style={{ width: `${key.accuracy}%` }}
                        />
                      </div>
                    </div>

                    {/* Color badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 text-xs',
                        key.accuracy >= 80
                          ? 'border-yellow-600/50 text-yellow-400'
                          : 'border-red-600/50 text-red-400',
                      )}
                    >
                      {key.accuracy >= 80 ? 'בינוני' : 'חלש'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Session history table ────────────────────────────────── */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.25 }}
        >
          <Card
            className="game-card-border"
            style={{ borderColor: 'oklch(0.495 0.205 292 / 25%)' }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4" style={{ color: 'var(--game-accent-purple)' }} />
                תרגולים אחרונים
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {/* Header row */}
              <div className="mb-1.5 grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 text-xs text-muted-foreground">
                <span>תוכן</span>
                <span className="text-center">מ/ד</span>
                <span className="text-center">דיוק</span>
                <span className="text-center">משך</span>
              </div>

              <div className="space-y-1">
                {recentSessions.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12, delay: idx * 0.04 }}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm"
                    style={{
                      border: '1.5px solid var(--game-border)',
                      background: 'oklch(0.15 0.02 292 / 40%)',
                    }}
                  >
                    {/* Text ID + date */}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{textIdLabel(r.textId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.completedAt).toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>

                    {/* WPM */}
                    <span className="tabular-nums font-semibold">{r.wpm}</span>

                    {/* Accuracy */}
                    <span className={cn('tabular-nums font-medium', accuracyColor(r.accuracy))}>
                      {r.accuracy}%
                    </span>

                    {/* Duration */}
                    <span className="tabular-nums text-muted-foreground">
                      {formatDuration(r.durationMs)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col items-center gap-4 rounded-2xl py-12 text-center"
          style={{
            border: '1.5px dashed oklch(0.495 0.205 292 / 30%)',
          }}
        >
          <BarChart3 className="size-12 text-muted-foreground/50" />
          <div>
            <p className="font-semibold text-muted-foreground">עדיין אין נתונים</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              השלם תרגול ראשון כדי לראות את הסטטיסטיקות שלך
            </p>
          </div>
          <Link
            href="/lessons"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--game-accent-purple)' }}
          >
            התחל לתרגל
          </Link>
        </motion.div>
      )}
    </div>
  )
}
