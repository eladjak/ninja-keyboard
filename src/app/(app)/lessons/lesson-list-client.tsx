'use client'

import Link from 'next/link'
import {
  Lock,
  CheckCircle2,
  ChevronLeft,
  Keyboard,
} from 'lucide-react'
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
            <div
              className={`game-card-border flex items-center gap-4 p-4 transition-all duration-150 ${
                !unlocked ? 'opacity-40' : ''
              }`}
              style={
                completed
                  ? { borderColor: 'oklch(0.672 0.148 168 / 50%)', background: 'linear-gradient(135deg, oklch(0.15 0.04 168 / 60%) 0%, oklch(0.12 0.01 280 / 80%) 100%)' }
                  : undefined
              }
            >
              {/* Level number */}
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                style={
                  completed
                    ? { background: 'linear-gradient(135deg, #00B894, #00A381)', color: '#fff', boxShadow: '0 0 12px oklch(0.672 0.148 168 / 40%)' }
                    : unlocked
                      ? { background: 'linear-gradient(135deg, #6C5CE7, #5A4BD1)', color: '#fff', boxShadow: '0 0 10px oklch(0.495 0.205 292 / 30%)' }
                      : { background: 'oklch(0.18 0.02 290)', color: 'oklch(0.65 0.02 290)' }
                }
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
                  <div className="text-end text-sm">
                    <div className="font-bold" style={{ color: 'var(--game-accent-purple)' }}>{data.bestWpm} מ/ד</div>
                    <div className="text-xs text-muted-foreground">
                      {data.bestAccuracy}%
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
