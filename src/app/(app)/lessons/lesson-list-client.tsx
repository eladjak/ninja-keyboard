'use client'

import Link from 'next/link'
import {
  Lock,
  CheckCircle2,
  ChevronLeft,
  Keyboard,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useXpStore } from '@/stores/xp-store'
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
  'home-row': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'top-row': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'bottom-row': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'full-keyboard': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  words: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  sentences: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  speed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  master: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
}

interface LessonListClientProps {
  lessons: LessonDefinition[]
}

export function LessonListClient({ lessons }: LessonListClientProps) {
  const { completedLessons } = useXpStore()

  const isUnlocked = (level: number): boolean => {
    if (level <= 1) return true
    const prevId = `lesson-${String(level - 1).padStart(2, '0')}`
    return prevId in completedLessons
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const completed = lesson.id in completedLessons
        const unlocked = isUnlocked(lesson.level)
        const data = completedLessons[lesson.id]

        return (
          <Link
            key={lesson.id}
            href={unlocked ? `/lessons/${lesson.id}` : '#'}
            className={!unlocked ? 'pointer-events-none' : ''}
          >
            <Card
              className={`transition-all duration-150 ${
                unlocked
                  ? 'cursor-pointer hover:shadow-md hover:border-primary/50'
                  : 'opacity-50'
              } ${completed ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}`}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Level number */}
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                    completed
                      ? 'bg-green-500 text-white'
                      : unlocked
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="size-6" />
                  ) : unlocked ? (
                    lesson.level
                  ) : (
                    <Lock className="size-5" />
                  )}
                </div>

                {/* Lesson info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{lesson.titleHe}</h3>
                    <Badge
                      variant="secondary"
                      className={CATEGORY_COLORS[lesson.category] ?? ''}
                    >
                      {CATEGORY_LABELS[lesson.category] ?? lesson.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lesson.descriptionHe}
                  </p>
                  {lesson.newKeys.length > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      <Keyboard className="size-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        אותיות חדשות:{' '}
                        {lesson.newKeys.map((k) => (
                          <kbd
                            key={k}
                            className="mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
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
                    <div className="text-end text-sm">
                      <div className="font-medium">{data.bestWpm} מ/ד</div>
                      <div className="text-muted-foreground">
                        {data.bestAccuracy}%
                      </div>
                    </div>
                  )}
                  {unlocked && (
                    <ChevronLeft className="size-5 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
