'use client'

import Link from 'next/link'
import {
  Lock,
  CheckCircle2,
  ChevronLeft,
  Keyboard,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useXpStore } from '@/stores/xp-store'
import { calculateStars } from '@/lib/typing-engine/stars'
import {
  lessonProgressionStatus,
  retryGuidance,
} from '@/lib/typing-engine/progression'
import type { LessonDefinition } from '@/lib/typing-engine/types'

const CATEGORY_LABELS: Record<string, string> = {
  'home-row': 'שורת הבית',
  'top-row': 'שורה עליונה',
  'bottom-row': 'שורה תחתונה',
  'full-keyboard': 'מקלדת מלאה',
  words: 'מילים',
  sentences: 'משפטים',
  speed: 'מהירות',
  master: 'מאסטר',
}

const CATEGORY_COLORS: Record<string, string> = {
  'home-row': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'top-row': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bottom-row': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'full-keyboard': 'bg-green-500/20 text-green-300 border-green-500/30',
  words: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  sentences: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  speed: 'bg-red-500/20 text-red-300 border-red-500/30',
  master: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

interface LessonListClientProps {
  lessons: LessonDefinition[]
}

export function LessonListClient({ lessons }: LessonListClientProps) {
  const { completedLessons } = useXpStore()

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const data = completedLessons[lesson.id]
        const status = lessonProgressionStatus(lesson, lessons, completedLessons)
        const unlocked = status !== 'locked'
        const needsPractice = status === 'needs-practice'
        const nudge = needsPractice ? retryGuidance(lesson, data) : null

        return (
          <Link
            key={lesson.id}
            href={unlocked ? `/lessons/${lesson.id}` : '#'}
            className={!unlocked ? 'pointer-events-none' : ''}
          >
            <div
              className={`game-card-border flex items-center gap-4 p-4 transition-all duration-150 ${
                !unlocked ? 'opacity-40' : ''
              }`}
              style={
                status === 'mastered'
                  ? { borderColor: 'oklch(0.672 0.148 168 / 50%)', background: 'linear-gradient(135deg, oklch(0.15 0.04 168 / 60%) 0%, oklch(0.12 0.01 280 / 80%) 100%)' }
                  : needsPractice
                    ? { borderColor: 'oklch(0.78 0.16 75 / 50%)', background: 'linear-gradient(135deg, oklch(0.16 0.04 75 / 50%) 0%, oklch(0.12 0.01 280 / 80%) 100%)' }
                    : undefined
              }
            >
              {/* Level number */}
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                style={
                  status === 'mastered'
                    ? { background: 'linear-gradient(135deg, #00B894, #00A381)', color: '#fff', boxShadow: '0 0 12px oklch(0.672 0.148 168 / 40%)' }
                    : needsPractice
                      ? { background: 'linear-gradient(135deg, #f5b301, #d99500)', color: '#fff', boxShadow: '0 0 10px oklch(0.78 0.16 75 / 35%)' }
                      : unlocked
                        ? { background: 'linear-gradient(135deg, #6C5CE7, #5A4BD1)', color: '#fff', boxShadow: '0 0 10px oklch(0.495 0.205 292 / 30%)' }
                        : { background: 'oklch(0.18 0.02 290)', color: 'oklch(0.65 0.02 290)' }
                }
              >
                {status === 'mastered' ? (
                  <CheckCircle2 className="size-6" />
                ) : unlocked ? (
                  lesson.level
                ) : (
                  <Lock className="size-5" />
                )}
              </div>

              {/* Lesson info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{lesson.titleHe}</h3>
                  <Badge
                    variant="secondary"
                    className={`border ${CATEGORY_COLORS[lesson.category] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {CATEGORY_LABELS[lesson.category] ?? lesson.category}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {lesson.descriptionHe}
                </p>
                {nudge && (
                  <p
                    className="mt-1 text-xs font-medium"
                    style={{ color: 'oklch(0.82 0.15 75)' }}
                    data-testid={`lesson-nudge-${lesson.id}`}
                  >
                    {nudge}
                  </p>
                )}
                {lesson.newKeys.length > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <Keyboard className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      אותיות חדשות:{' '}
                      {lesson.newKeys.map((k) => (
                        <kbd
                          key={k}
                          className="mx-0.5 rounded px-1.5 py-0.5 font-mono text-xs"
                          style={{ background: 'var(--game-bg-input)', border: '1px solid var(--game-border)', color: 'var(--game-accent-purple)' }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats / arrow */}
              <div className="flex shrink-0 items-center gap-3">
                {data && (
                  <div className="flex flex-col items-end gap-0.5 text-end text-sm">
                    {/* Mastery stars (1-3) */}
                    <div
                      className="flex gap-0.5"
                      data-testid={`lesson-stars-${lesson.id}`}
                      aria-label={`${calculateStars(data.bestWpm, data.bestAccuracy, lesson.targetWpm, lesson.targetAccuracy)} מתוך 3 כוכבים`}
                    >
                      {Array.from({ length: 3 }, (_, i) => {
                        const earned =
                          i <
                          calculateStars(
                            data.bestWpm,
                            data.bestAccuracy,
                            lesson.targetWpm,
                            lesson.targetAccuracy,
                          )
                        return (
                          <Star
                            key={i}
                            className={`size-4 ${
                              earned
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]'
                                : 'text-muted-foreground/25'
                            }`}
                          />
                        )
                      })}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--game-accent-purple)' }}>{`${data.bestWpm} מ/ד`}</div>
                    <div className="text-xs text-muted-foreground">
                      {`${data.bestAccuracy}%`}
                    </div>
                  </div>
                )}
                {unlocked && (
                  <ChevronLeft className="size-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
