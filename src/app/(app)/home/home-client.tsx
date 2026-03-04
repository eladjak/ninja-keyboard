'use client'

import Link from 'next/link'
import {
  BookOpen,
  Keyboard,
  Swords,
  TrendingUp,
  BarChart3,
  Settings,
  Star,
  Flame,
  Trophy,
  Zap,
  Target,
  ChevronLeft,
  Gamepad2,
  Timer,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GameCard } from '@/components/ui/game-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { DailyChallengeCard } from '@/components/challenges/daily-challenge-card'
import { DailyTip } from '@/components/tips/daily-tip'
import { ProgressChart } from '@/components/statistics/progress-chart'
import { useXpStore } from '@/stores/xp-store'
import { useBadgeStore } from '@/stores/badge-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { LESSONS } from '@/lib/content/lessons'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'

function getNextLesson(
  completedLessons: Record<string, unknown>,
): (typeof LESSONS)[number] | null {
  for (const lesson of LESSONS) {
    if (!(lesson.id in completedLessons)) return lesson
  }
  return null
}

function getRecentCompletedLessons(
  completedLessons: Record<
    string,
    { bestWpm: number; bestAccuracy: number; completedAt: number }
  >,
  count: number,
) {
  return Object.entries(completedLessons)
    .sort(([, a], [, b]) => b.completedAt - a.completedAt)
    .slice(0, count)
    .map(([lessonId, data]) => {
      const lesson = LESSONS.find((l) => l.id === lessonId)
      return {
        lessonId,
        title: lesson?.titleHe ?? lessonId,
        bestWpm: data.bestWpm,
        bestAccuracy: data.bestAccuracy,
      }
    })
}

const QUICK_LINKS = [
  {
    href: '/lessons',
    icon: BookOpen,
    label: 'שיעורים',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    href: '/practice',
    icon: Keyboard,
    label: 'תרגול חופשי',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
  },
  {
    href: '/games',
    icon: Gamepad2,
    label: 'משחקים',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-100 dark:bg-pink-900/40',
  },
  {
    href: '/battle',
    icon: Swords,
    label: 'זירת קרב',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/40',
  },
  {
    href: '/speed-test',
    icon: Timer,
    label: 'מבחן מהירות',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  {
    href: '/statistics',
    icon: BarChart3,
    label: 'סטטיסטיקות',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/40',
  },
] as const

const STAT_CARDS = [
  { key: 'level', icon: Star, color: 'text-primary', label: 'רמה' },
  { key: 'xp', icon: Zap, color: 'text-amber-500', label: 'XP' },
  { key: 'streak', icon: Flame, color: 'text-orange-500', label: 'ימי רצף' },
  { key: 'lessons', icon: Trophy, color: 'text-green-500', label: 'שיעורים' },
] as const

export function HomeDashboard() {
  const { totalXp, level, streak, completedLessons, levelProgress } =
    useXpStore()
  const { getRecentBadges, hasBadge } = useBadgeStore()
  const practiceResults = usePracticeHistoryStore((s) => s.results)

  // Derive WPM trend from practice results (memoized to avoid re-render loops)
  const wpmTrend = useMemo(() => {
    const recent = practiceResults.slice(0, 20).reverse()
    return recent.map((r, i) => ({
      sessionIndex: i + 1,
      wpm: r.wpm,
      accuracy: r.accuracy,
      date: new Date(r.completedAt).toLocaleDateString('he-IL'),
    }))
  }, [practiceResults])

  const lessonsCompletedCount = Object.keys(completedLessons).length
  const nextLesson = getNextLesson(completedLessons)
  const recentLessons = getRecentCompletedLessons(completedLessons, 3)
  const recentBadgeIds = getRecentBadges(3)
  const recentBadges = recentBadgeIds
    .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id))
    .filter(Boolean)
  const progress = levelProgress()

  const statValues = {
    level,
    xp: totalXp,
    streak,
    lessons: lessonsCompletedCount,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl ninja-gradient p-6 text-white shadow-lg"
      >
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -top-6 -end-6 text-8xl opacity-15 ninja-shimmer" role="img" aria-label="נינג'ה">🥷</div>
        <div className="pointer-events-none absolute bottom-2 start-4 text-4xl opacity-10">⌨️</div>

        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-white/80" />
            <p className="text-sm font-medium text-white/80">ברוכים הבאים!</p>
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">שלום, נינג&apos;ה! 🥷</h1>
          <p className="text-base text-white/80">
            מוכנים לאימון הקלדה היום?
          </p>
        </div>

        {/* Level progress in hero */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>רמה {level}</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-2 rounded-full bg-white/20 overflow-hidden"
            role="progressbar"
            aria-label="התקדמות לרמה הבאה"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full bg-white/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        data-testid="stats-row"
      >
        {STAT_CARDS.map((stat, i) => {
          const Icon = stat.icon
          const value = statValues[stat.key]
          return (
            <GameCard key={stat.key} delay={i * 0.06}>
              <div className="flex flex-col items-center gap-1">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <Icon className={`size-4.5 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            </GameCard>
          )
        })}
      </div>

      {/* Continue Lesson CTA */}
      {nextLesson ? (
        <Link href={`/lessons/${nextLesson.id}`}>
          <Button size="lg" className="w-full text-lg gap-2 ninja-gradient border-0 text-white shadow-md hover:opacity-90 transition-opacity" data-testid="continue-lesson-btn">
            <Target className="size-5" />
            המשך שיעור: {nextLesson.titleHe}
            <ChevronLeft className="size-5" />
          </Button>
        </Link>
      ) : (
        <Button size="lg" className="w-full text-lg" disabled data-testid="continue-lesson-btn">
          כל השיעורים הושלמו! 🎉
        </Button>
      )}

      {/* Placement Test Link */}
      {lessonsCompletedCount === 0 && (
        <Link href="/placement" data-testid="placement-test-link">
          <Button variant="outline" className="w-full gap-2 border-primary/30 hover:bg-primary/5">
            <Target className="size-4 text-primary" />
            מבחן מיקום
          </Button>
        </Link>
      )}

      {/* Daily Challenge */}
      <DailyChallengeCard />

      {/* Quick Links */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">ניווט מהיר</h2>
        <div
          className="grid grid-cols-3 gap-2.5 sm:grid-cols-6"
          data-testid="quick-links"
        >
          {QUICK_LINKS.map((link, i) => (
            <Link key={link.href} href={link.href}>
              <GameCard delay={i * 0.04}>
                <div className="flex flex-col items-center gap-1.5 p-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${link.bg}`}
                  >
                    <link.icon className={`size-5 ${link.color}`} />
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">{link.label}</span>
                </div>
              </GameCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentLessons.length > 0 && (
        <Card className="card-glow" data-testid="recent-activity">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" />
              פעילות אחרונה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentLessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <span className="text-sm font-medium">{lesson.title}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="size-3 text-amber-500" />
                    {lesson.bestWpm} מ/ד
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="size-3 text-green-500" />
                    {lesson.bestAccuracy}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* WPM Progress Chart */}
      {wpmTrend.length >= 2 && (
        <ProgressChart
          data={wpmTrend}
          title="מהירות הקלדה לאורך זמן"
          metric="wpm"
        />
      )}

      {/* Achievement Preview */}
      {recentBadges.length > 0 && (
        <Card className="card-glow" data-testid="achievement-preview">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-amber-500" />
              הישגים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6">
              {recentBadges.map((badge) => (
                <motion.div
                  key={badge!.id}
                  className="flex flex-col items-center gap-1.5"
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                    <span className="text-3xl" role="img" aria-label={badge!.nameHe}>
                      {badge!.emoji}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{badge!.nameHe}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Tip */}
      <DailyTip />
    </div>
  )
}
