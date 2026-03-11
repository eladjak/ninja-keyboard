'use client'

import Link from 'next/link'
import Image from 'next/image'
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
import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DailyChallengeCard } from '@/components/challenges/daily-challenge-card'
import { DailyTip } from '@/components/tips/daily-tip'
import { ProgressChart } from '@/components/statistics/progress-chart'
import { useXpStore } from '@/stores/xp-store'
import { useBadgeStore } from '@/stores/badge-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { LESSONS } from '@/lib/content/lessons'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import { useSoundEffect, useNavigateSound } from '@/hooks/use-sound-effect'

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
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    accent: '#3b82f6',
  },
  {
    href: '/practice',
    icon: Keyboard,
    label: 'תרגול חופשי',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    accent: '#a855f7',
  },
  {
    href: '/games',
    icon: Gamepad2,
    label: 'משחקים',
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    accent: '#ec4899',
  },
  {
    href: '/battle',
    icon: Swords,
    label: 'זירת קרב',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    accent: '#ef4444',
  },
  {
    href: '/speed-test',
    icon: Timer,
    label: 'מבחן מהירות',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    accent: '#f59e0b',
  },
  {
    href: '/statistics',
    icon: BarChart3,
    label: 'סטטיסטיקות',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    accent: '#22c55e',
  },
] as const

const STAT_CARDS = [
  { key: 'level', icon: Star, color: 'text-purple-400', accent: '#6C5CE7', label: 'רמה' },
  { key: 'xp', icon: Zap, color: 'text-amber-400', accent: '#f59e0b', label: 'XP' },
  { key: 'streak', icon: Flame, color: 'text-orange-400', accent: '#f97316', label: 'ימי רצף' },
  { key: 'lessons', icon: Trophy, color: 'text-green-400', accent: '#00B894', label: 'שיעורים' },
] as const

export function HomeDashboard() {
  const { totalXp, level, streak, completedLessons, levelProgress } =
    useXpStore()
  const { getRecentBadges, hasBadge } = useBadgeStore()
  const practiceResults = usePracticeHistoryStore((s) => s.results)
  const playAchievement = useSoundEffect('achievement')
  const playNavigate = useNavigateSound()

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

  // Play achievement sound once on mount when there are recent badges
  const hasRecentBadges = recentBadges.length > 0
  useEffect(() => {
    if (hasRecentBadges) {
      // Small delay so the user sees the page first
      const timer = setTimeout(playAchievement, 600)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        className="relative overflow-hidden rounded-2xl hero-glow-border p-6 text-white shadow-lg"
        style={{ background: 'var(--game-bg-primary)' }}
      >
        {/* Background image */}
        <Image
          src="/images/backgrounds/hero-bg.jpg"
          alt=""
          fill
          className="object-cover opacity-40"
          priority
        />
        {/* Dark overlay gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--game-bg-primary)] via-[var(--game-bg-primary)]/60 to-transparent" />

        {/* Ki character image */}
        <div className="pointer-events-none absolute bottom-0 end-4 z-10">
          <Image
            src="/images/characters/ki-hero.jpg"
            alt="Ki - מדריך הנינג'ה"
            width={100}
            height={100}
            className="rounded-full border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
          />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-300" />
            <p className="text-sm font-medium text-purple-200">ברוכים הבאים!</p>
          </div>
          <h1 className="text-2xl font-bold text-glow sm:text-3xl">שלום, נינג&apos;ה!</h1>
          <p className="text-base text-glow-sm text-white/80">
            מוכנים לאימון הקלדה היום?
          </p>
        </div>

        {/* Level progress in hero */}
        <div className="relative z-10 mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>רמה {level}</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/10"
            role="progressbar"
            aria-label="התקדמות לרמה הבאה"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6C5CE7, #00B894)' }}
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
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="game-card-border p-3"
              style={{ borderColor: `${stat.accent}40` }}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex size-9 items-center justify-center rounded-full"
                  style={{ background: `${stat.accent}20` }}
                >
                  <Icon className={`size-4.5 ${stat.color}`} />
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: stat.accent, textShadow: `0 0 12px ${stat.accent}60` }}
                >
                  {value}
                </span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Continue Lesson CTA */}
      {nextLesson ? (
        <Link href={`/lessons/${nextLesson.id}`} onClick={playNavigate}>
          <Button size="lg" className="w-full text-lg gap-2 game-button" data-testid="continue-lesson-btn">
            <Target className="size-5" />
            המשך שיעור: {nextLesson.titleHe}
            <ChevronLeft className="size-5" />
          </Button>
        </Link>
      ) : (
        <Button size="lg" className="w-full text-lg game-button opacity-60" disabled data-testid="continue-lesson-btn">
          כל השיעורים הושלמו!
        </Button>
      )}

      {/* Placement Test Link */}
      {lessonsCompletedCount === 0 && (
        <Link href="/placement" data-testid="placement-test-link">
          <Button variant="outline" className="w-full gap-2 border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/60">
            <Target className="size-4 text-purple-400" />
            מבחן מיקום
          </Button>
        </Link>
      )}

      {/* Daily Challenge */}
      <DailyChallengeCard />

      {/* Quick Links */}
      <div>
        <h2 className="game-section-title mb-3">ניווט מהיר</h2>
        <div
          className="grid grid-cols-3 gap-2.5 sm:grid-cols-6"
          data-testid="quick-links"
        >
          {QUICK_LINKS.map((link, i) => (
            <Link key={link.href} href={link.href} onClick={playNavigate}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="game-card-border cursor-pointer"
                style={{ borderColor: `${link.accent}30` }}
              >
                <div className="flex flex-col items-center gap-1.5 p-2">
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${link.bg}`}
                  >
                    <link.icon className={`size-7 ${link.color}`} />
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight text-muted-foreground">{link.label}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentLessons.length > 0 && (
        <div className="game-card-border" data-testid="recent-activity">
          <div className="flex items-center gap-2 pb-3">
            <TrendingUp className="size-4 text-purple-400" />
            <h3 className="game-section-title">פעילות אחרונה</h3>
          </div>
          <div className="space-y-2">
            {recentLessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className="flex items-center justify-between rounded-lg p-3 transition-colors"
                style={{ background: 'var(--game-hover-bg)', border: '1px solid var(--game-border)' }}
              >
                <span className="text-sm font-medium text-foreground">{lesson.title}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="size-3 text-amber-400" />
                    {lesson.bestWpm} מ/ד
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="size-3 text-green-400" />
                    {lesson.bestAccuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
        <div
          className="game-card-border"
          style={{ borderColor: '#f59e0b40' }}
          data-testid="achievement-preview"
        >
          <div className="flex items-center gap-2 pb-3">
            <Trophy className="size-4 text-amber-400" />
            <h3 className="game-section-title" style={{ color: '#fbbf24' }}>הישגים אחרונים</h3>
          </div>
          <div className="flex items-center justify-center gap-6">
            {recentBadges.map((badge) => (
              <motion.div
                key={badge!.id}
                className="flex flex-col items-center gap-1.5"
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <div className="relative flex size-16 items-center justify-center rounded-2xl border-2 border-amber-500/30 bg-amber-500/10">
                  <Image
                    src="/images/badges/achievement-star.jpg"
                    alt=""
                    width={40}
                    height={40}
                    className="absolute opacity-30 rounded-lg"
                  />
                  <span className="relative text-3xl" role="img" aria-label={badge!.nameHe}>
                    {badge!.emoji}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-300">{badge!.nameHe}</Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Tip */}
      <DailyTip />
    </div>
  )
}
