import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ShortcutLessonPageClient } from '@/app/(app)/lessons/[id]/shortcut-lesson-page-client'
import { getLessonById } from '@/lib/content/lessons'
import { getShortcutLessonById } from '@/lib/content/shortcuts'
import { useBadgeStore } from '@/stores/badge-store'
import { useXpStore } from '@/stores/xp-store'

const navigation = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
}))

vi.mock('@/components/shortcuts/shortcut-practice', () => ({
  ShortcutPractice: ({
    onComplete,
  }: {
    onComplete: (
      score: number,
      total: number,
      result: {
        score: number
        total: number
        attempts: number
        accuracy: number
        shortcutsPerMinute: number
        durationMs: number
      },
    ) => void
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onComplete(8, 8, {
            score: 8,
            total: 8,
            attempts: 8,
            accuracy: 100,
            shortcutsPerMinute: 12,
            durationMs: 40_000,
          })
        }
      >
        סיום עובר
      </button>
      <button
        type="button"
        onClick={() =>
          onComplete(8, 8, {
            score: 8,
            total: 8,
            attempts: 16,
            accuracy: 50,
            shortcutsPerMinute: 4,
            durationMs: 120_000,
          })
        }
      >
        סיום נכשל
      </button>
    </div>
  ),
}))

const lesson = getLessonById('shortcut-lesson-basic')!
const shortcutLesson = getShortcutLessonById('shortcut-lesson-basic')!

describe('ShortcutLessonPageClient', () => {
  beforeEach(() => {
    navigation.push.mockReset()
    useXpStore.setState({
      totalXp: 0,
      level: 1,
      streak: 0,
      lastPracticeDate: null,
      completedLessons: {},
    })
    useBadgeStore.setState({ earnedBadges: {} })
  })

  it('records a passing shortcut lesson in the shared progression and awards XP/badge', async () => {
    render(
      <ShortcutLessonPageClient
        lesson={lesson}
        shortcutLesson={shortcutLesson}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'סיום עובר' }))

    await waitFor(() => {
      expect(
        useXpStore.getState().completedLessons['shortcut-lesson-basic'],
      ).toMatchObject({ bestWpm: 12, bestAccuracy: 100 })
    })
    expect(useXpStore.getState().totalXp).toBeGreaterThan(0)
    expect(useBadgeStore.getState().hasBadge('shortcut-apprentice')).toBe(true)
    expect(
      screen.getByText('כל הכבוד! עברתם את שיעור הקיצורים!'),
    ).toBeInTheDocument()
  })

  it('does not unlock progression or award XP when targets are missed', () => {
    render(
      <ShortcutLessonPageClient
        lesson={lesson}
        shortcutLesson={shortcutLesson}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'סיום נכשל' }))

    expect(
      useXpStore.getState().completedLessons['shortcut-lesson-basic'],
    ).toBeUndefined()
    expect(useXpStore.getState().totalXp).toBe(0)
    expect(useBadgeStore.getState().hasBadge('shortcut-apprentice')).toBe(false)
    expect(
      screen.getByText('כמעט שם — עוד תרגול קצר ותעברו!'),
    ).toBeInTheDocument()
  })
})
