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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DailyChallengeCard } from '@/components/challenges/daily-challenge-card'
import { DailyTip } from '@/components/tips/daily-tip'
import { useXpStore } from '@/stores/xp-store'
import { useBadgeStore } from '@/stores/badge-store'
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
    href: '/battle',
    icon: Swords,
    label: 'זירת קרב',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/40',
  },
  {
    href: '/statistics',
    icon: BarChart3,
    label: 'סטטיסטיקות',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/40',
  },
  {
    href: '/progress',
    icon: TrendingUp,
    label: 'התקדמות',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-900/40',
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'הגדרות',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800/40',
  },
] as const

export function HomeDashboard() {
  const { totalXp, level, streak, completedLessons, levelProgress } =
    useXpStore()
  const { getRecentBadges, hasBadge } = useBadgeStore()

  const lessonsCompletedCount = Object.keys(completedLessons).length
  const nextLesson = getNextLesson(completedLessons)
  const recentLessons = getRecentCompletedLessons(completedLessons, 3)
  const recentBadgeIds = getRecentBadges(3)
  const recentBadges = recentBadgeIds
    .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id))
    .filter(Boolean)
  const progress = levelProgress()

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      {/* Welcome Banner */}
      <div className="text-center space-y-2">
        <span className="text-6xl" role="img" aria-label="נינג'ה">
          🥷
        </span>
        <h1 className="text-3xl font-bold">שלום, נינג&apos;ה!</h1>
        <p className="text-muted-foreground text-lg">
          מוכנים לאימון הקלדה היום?
        </p>
      </div>

      {/* Stats Row */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        data-testid="stats-row"
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Star className="size-5 text-primary" />
            <span className="text-2xl font-bold">{level}</span>
            <span className="text-xs text-muted-foreground">רמה</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Zap className="size-5 text-amber-500" />
            <span className="text-2xl font-bold">{totalXp}</span>
            <span className="text-xs text-muted-foreground">XP</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Flame className="size-5 text-orange-500" />
            <span className="text-2xl font-bold">{streak}</span>
            <span className="text-xs text-muted-foreground">ימי רצף</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Trophy className="size-5 text-green-500" />
            <span className="text-2xl font-bold">{lessonsCompletedCount}</span>
            <span className="text-xs text-muted-foreground">שיעורים</span>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">רמה {level}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} aria-label="התקדמות לרמה הבאה" />
        </CardContent>
      </Card>

      {/* Continue Lesson CTA */}
      {nextLesson ? (
        <Link href={`/lessons/${nextLesson.id}`}>
          <Button size="lg" className="w-full text-lg gap-2" data-testid="continue-lesson-btn">
            המשך שיעור
            <ChevronLeft className="size-5" />
          </Button>
        </Link>
      ) : (
        <Button size="lg" className="w-full text-lg" disabled data-testid="continue-lesson-btn">
          כל השיעורים הושלמו!
        </Button>
      )}

      {/* Placement Test Link */}
      {lessonsCompletedCount === 0 && (
        <Link href="/placement" data-testid="placement-test-link">
          <Button variant="outline" className="w-full">
            מבחן מיקום
          </Button>
        </Link>
      )}

      {/* Daily Challenge */}
      <DailyChallengeCard />

      {/* Recent Activity */}
      {recentLessons.length > 0 && (
        <Card data-testid="recent-activity">
          <CardHeader>
            <CardTitle>פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{lesson.title}</span>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{lesson.bestWpm} מ/ד</span>
                  <span>{lesson.bestAccuracy}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Achievement Preview */}
      {recentBadges.length > 0 && (
        <Card data-testid="achievement-preview">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              הישגים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6">
              {recentBadges.map((badge) => (
                <div
                  key={badge!.id}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-3xl" role="img" aria-label={badge!.nameHe}>
                    {badge!.emoji}
                  </span>
                  <Badge variant="secondary">{badge!.nameHe}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Tip */}
      <DailyTip />

      {/* Quick Links */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        data-testid="quick-links"
      >
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="cursor-pointer transition-all duration-150 hover:shadow-md hover:border-primary/50">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${link.bg}`}
                >
                  <link.icon className={`size-5 ${link.color}`} />
                </div>
                <span className="text-sm font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
