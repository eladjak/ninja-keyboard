'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, RotateCcw, Star, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ShortcutPractice,
  type ShortcutPracticeResult,
} from '@/components/shortcuts/shortcut-practice'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import { getLessonByLevel } from '@/lib/content/lessons'
import {
  calculateXpReward,
  isLessonComplete,
} from '@/lib/typing-engine/engine'
import { calculateStars } from '@/lib/typing-engine/stars'
import { useBadgeStore } from '@/stores/badge-store'
import { useXpStore } from '@/stores/xp-store'
import type { ShortcutLesson } from '@/lib/content/shortcuts'
import type {
  LessonDefinition,
  SessionStats,
  XpReward,
} from '@/lib/typing-engine/types'

interface ShortcutLessonPageClientProps {
  lesson: LessonDefinition
  shortcutLesson: ShortcutLesson
}

interface ShortcutLessonOutcome {
  result: ShortcutPracticeResult
  stats: SessionStats
  passed: boolean
  reward: XpReward | null
}

function toSessionStats(result: ShortcutPracticeResult): SessionStats {
  return {
    wpm: result.shortcutsPerMinute,
    accuracy: result.accuracy,
    totalKeystrokes: result.attempts,
    correctKeystrokes: result.score,
    errorKeystrokes: Math.max(0, result.attempts - result.score),
    durationMs: result.durationMs,
    keyAccuracy: {},
  }
}

export function ShortcutLessonPageClient({
  lesson,
  shortcutLesson,
}: ShortcutLessonPageClientProps) {
  const router = useRouter()
  const xpStore = useXpStore()
  const earnBadge = useBadgeStore((state) => state.earnBadge)
  const [practiceKey, setPracticeKey] = useState(0)
  const [outcome, setOutcome] = useState<ShortcutLessonOutcome | null>(null)

  useEffect(() => {
    xpStore.updateStreak()
    // Lesson identity is the intended session boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  const handleComplete = (
    _score: number,
    _total: number,
    result: ShortcutPracticeResult,
  ) => {
    const stats = toSessionStats(result)
    const passed = isLessonComplete(
      stats,
      lesson.targetWpm,
      lesson.targetAccuracy,
    )
    const reward = passed
      ? calculateXpReward(
          stats,
          lesson.targetWpm,
          lesson.targetAccuracy,
          xpStore.streak,
        )
      : null

    if (reward) {
      xpStore.addXp(reward.total)
      xpStore.completeLesson(lesson.id, stats.wpm, stats.accuracy)

      for (const badge of BADGE_DEFINITIONS) {
        if (
          badge.condition.type === 'lesson_completed' &&
          badge.condition.lessonId === lesson.id
        ) {
          earnBadge(badge.id, lesson.id)
        }
      }
    }

    setOutcome({ result, stats, passed, reward })
  }

  const handleRetry = () => {
    setOutcome(null)
    setPracticeKey((key) => key + 1)
  }

  const handleNext = () => {
    const nextLesson = getLessonByLevel(lesson.level + 1)
    router.push(nextLesson ? `/lessons/${nextLesson.id}` : '/lessons')
  }

  const stars = outcome
    ? calculateStars(
        outcome.stats.wpm,
        outcome.stats.accuracy,
        lesson.targetWpm,
        lesson.targetAccuracy,
      )
    : 0

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg">
            {lesson.level}
          </Badge>
          <div>
            <h1 className="text-xl font-bold">{lesson.titleHe}</h1>
            <p className="text-sm text-muted-foreground">
              {lesson.descriptionHe}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>יעד: {lesson.targetWpm} קיצורים בדקה</span>
          <span aria-hidden="true">|</span>
          <span>{lesson.targetAccuracy}% דיוק</span>
        </div>
      </div>

      {!outcome && lesson.storyIntroHe && (
        <p
          data-testid="lesson-story-intro"
          className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{
            background: 'oklch(0.495 0.205 292 / 12%)',
            border: '1.5px solid oklch(0.495 0.205 292 / 30%)',
            color: 'var(--game-accent-purple, #a78bfa)',
          }}
        >
          {lesson.storyIntroHe}
        </p>
      )}

      {!outcome ? (
        <ShortcutPractice
          key={practiceKey}
          shortcuts={shortcutLesson.shortcuts}
          onComplete={handleComplete}
          onBack={() => router.push('/lessons')}
          showXpReward={false}
        />
      ) : (
        <section className="game-card-border mx-auto w-full max-w-lg space-y-5 p-6 text-center">
          <div className="flex justify-center gap-1" aria-label={`${stars} מתוך 3 כוכבים`}>
            {Array.from({ length: 3 }, (_, index) => (
              <Star
                key={index}
                className={
                  index < stars
                    ? 'size-9 fill-yellow-400 text-yellow-400'
                    : 'size-9 text-muted-foreground/30'
                }
              />
            ))}
          </div>

          <div>
            <h2 className="text-xl font-bold">
              {outcome.passed
                ? 'כל הכבוד! עברתם את שיעור הקיצורים!'
                : 'כמעט שם — עוד תרגול קצר ותעברו!'}
            </h2>
            {outcome.passed && lesson.storyOutroHe && (
              <p
                data-testid="lesson-story-outro"
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
              >
                {lesson.storyOutroHe}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <div className="text-3xl font-bold tabular-nums">
                {outcome.stats.wpm}
              </div>
              <div className="text-sm text-muted-foreground">
                קיצורים בדקה
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="text-3xl font-bold tabular-nums">
                {outcome.stats.accuracy}%
              </div>
              <div className="text-sm text-muted-foreground">דיוק</div>
            </div>
          </div>

          {outcome.reward && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 py-2">
              <Trophy className="size-5 text-primary" />
              <span className="text-lg font-bold text-primary">
                +{outcome.reward.total} XP
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleRetry}>
              <RotateCcw className="me-2 size-4" />
              נסו שוב
            </Button>
            <Button
              className="flex-1"
              onClick={
                outcome.passed
                  ? handleNext
                  : () => router.push('/lessons')
              }
            >
              {outcome.passed ? 'השיעור הבא' : 'חזרה למסלול'}
              <ChevronLeft className="ms-2 size-4" />
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
