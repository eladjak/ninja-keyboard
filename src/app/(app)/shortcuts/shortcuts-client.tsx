'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ShortcutCard } from '@/components/shortcuts/shortcut-card'
import { ShortcutPractice } from '@/components/shortcuts/shortcut-practice'
import { useXpStore } from '@/stores/xp-store'
import type {
  ShortcutDefinition,
  ShortcutLesson,
  ShortcutCategory,
} from '@/lib/content/shortcuts'

// ── Tab Config ────────────────────────────────────────────────────

const TAB_LABELS: Record<ShortcutCategory, string> = {
  basic: 'בסיסי',
  text: 'טקסט',
  browser: 'דפדפן',
  windows: 'חלונות',
  advanced: 'מתקדם',
}

const TAB_COLORS: Record<ShortcutCategory, string> = {
  basic: 'data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300',
  text: 'data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-300',
  browser: 'data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-300',
  windows: 'data-[state=active]:bg-green-100 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-900 dark:data-[state=active]:text-green-300',
  advanced: 'data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900 dark:data-[state=active]:text-red-300',
}

// ── Component ─────────────────────────────────────────────────────

interface ShortcutsClientProps {
  lessons: ShortcutLesson[]
}

export function ShortcutsClient({ lessons }: ShortcutsClientProps) {
  const [practiceShortcuts, setPracticeShortcuts] = useState<
    ShortcutDefinition[] | null
  >(null)
  const { completedLessons, addXp } = useXpStore()

  // Track mastered shortcuts via a simple Set derived from completedLessons
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set())

  const handlePractice = (shortcut: ShortcutDefinition) => {
    setPracticeShortcuts([shortcut])
  }

  const handlePracticeAll = (lesson: ShortcutLesson) => {
    setPracticeShortcuts(lesson.shortcuts)
  }

  const handleComplete = (score: number, total: number) => {
    // Award XP: 10 per correct answer
    const xp = score * 10
    if (xp > 0) {
      addXp(xp)
    }

    // Mark practiced shortcuts as mastered if all correct
    if (practiceShortcuts && score === total) {
      setMasteredIds((prev) => {
        const next = new Set(prev)
        for (const s of practiceShortcuts) {
          next.add(s.id)
        }
        return next
      })
    }

    setPracticeShortcuts(null)
  }

  const handleBack = () => {
    setPracticeShortcuts(null)
  }

  // ── Practice Mode ───────────────────────────────────────────

  if (practiceShortcuts) {
    return (
      <ShortcutPractice
        shortcuts={practiceShortcuts}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    )
  }

  // ── Browse Mode (Tabs) ──────────────────────────────────────

  return (
    <Tabs.Root defaultValue={lessons[0]?.category ?? 'basic'} dir="rtl">
      <Tabs.List
        className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
        aria-label="קטגוריות קיצורים"
      >
        {lessons.map((lesson) => (
          <Tabs.Trigger
            key={lesson.category}
            value={lesson.category}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all',
              'text-muted-foreground hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              TAB_COLORS[lesson.category],
            )}
          >
            {TAB_LABELS[lesson.category]}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {lessons.map((lesson) => {
        const masteredCount = lesson.shortcuts.filter((s) =>
          masteredIds.has(s.id),
        ).length

        return (
          <Tabs.Content
            key={lesson.category}
            value={lesson.category}
            className="mt-4 space-y-4"
          >
            {/* Lesson header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{lesson.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {lesson.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {masteredCount}/{lesson.shortcuts.length}
                </Badge>
                <button
                  type="button"
                  onClick={() => handlePracticeAll(lesson)}
                  className={cn(
                    'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                    'transition-colors hover:bg-primary/90',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  תרגול הכל
                </button>
              </div>
            </div>

            {/* Shortcut cards */}
            <div className="space-y-3">
              {lesson.shortcuts.map((shortcut) => (
                <ShortcutCard
                  key={shortcut.id}
                  shortcut={shortcut}
                  mastered={masteredIds.has(shortcut.id)}
                  onPractice={handlePractice}
                />
              ))}
            </div>
          </Tabs.Content>
        )
      })}
    </Tabs.Root>
  )
}
