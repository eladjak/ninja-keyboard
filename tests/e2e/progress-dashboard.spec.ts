import { test, expect } from '@playwright/test'

test.describe('Progress Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/progress')
  })

  test('progress page renders with heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'ההתקדמות שלי' }),
    ).toBeVisible()
  })

  test('shows empty state when no lessons completed', async ({ page }) => {
    // Clear any stored progress
    await page.evaluate(() => {
      localStorage.removeItem('ninja-keyboard-xp')
    })
    await page.reload()

    await expect(
      page.getByText('עדיין אין תוצאות. התחל שיעור כדי לראות את ההתקדמות שלך!'),
    ).toBeVisible()
  })

  test('displays XP total', async ({ page }) => {
    // Set up some XP in localStorage
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 150,
          level: 3,
          streak: 2,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {
            'lesson-01': {
              lessonId: 'lesson-01',
              bestWpm: 12,
              bestAccuracy: 92,
              completedAt: Date.now(),
              attempts: 2,
            },
            'lesson-02': {
              lessonId: 'lesson-02',
              bestWpm: 10,
              bestAccuracy: 88,
              completedAt: Date.now(),
              attempts: 1,
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // XP should be displayed (appears in two places: header and stats grid)
    await expect(page.getByText('150 XP').first()).toBeVisible()
    await expect(page.getByText('נקודות XP')).toBeVisible()
  })

  test('displays current level', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 150,
          level: 3,
          streak: 5,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {},
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    await expect(page.getByText('רמה 3')).toBeVisible()
  })

  test('displays streak counter', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 200,
          level: 3,
          streak: 7,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {},
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // Streak value
    await expect(page.getByText('7')).toBeVisible()
    // Streak label
    await expect(page.getByText('ימים ברצף')).toBeVisible()
  })

  test('displays completed lessons count', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 250,
          level: 4,
          streak: 3,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {
            'lesson-01': {
              lessonId: 'lesson-01',
              bestWpm: 12,
              bestAccuracy: 92,
              completedAt: Date.now(),
              attempts: 2,
            },
            'lesson-02': {
              lessonId: 'lesson-02',
              bestWpm: 10,
              bestAccuracy: 88,
              completedAt: Date.now(),
              attempts: 1,
            },
            'lesson-03': {
              lessonId: 'lesson-03',
              bestWpm: 15,
              bestAccuracy: 95,
              completedAt: Date.now(),
              attempts: 1,
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // Completed lessons count
    await expect(page.getByText('3').first()).toBeVisible()
    await expect(page.getByText('שיעורים הושלמו')).toBeVisible()
  })

  test('displays completed lessons list with stats', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 150,
          level: 3,
          streak: 2,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {
            'lesson-01': {
              lessonId: 'lesson-01',
              bestWpm: 12,
              bestAccuracy: 92,
              completedAt: Date.now(),
              attempts: 2,
            },
            'lesson-02': {
              lessonId: 'lesson-02',
              bestWpm: 10,
              bestAccuracy: 88,
              completedAt: Date.now(),
              attempts: 1,
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // Section heading
    await expect(page.getByText('שיעורים שהושלמו')).toBeVisible()

    // Lesson IDs in the list
    await expect(page.getByText('lesson-01')).toBeVisible()
    await expect(page.getByText('lesson-02')).toBeVisible()

    // Stats for lesson-01
    await expect(page.getByText('12 מ/ד')).toBeVisible()
    await expect(page.getByText('92%')).toBeVisible()

    // Stats for lesson-02
    await expect(page.getByText('10 מ/ד')).toBeVisible()
    await expect(page.getByText('88%')).toBeVisible()
  })

  test('level progress bar is visible', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 80,
          level: 2,
          streak: 1,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {},
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // The Progress component (Radix progress bar) should be visible
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('stats grid shows three stat cards', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 100,
          level: 2,
          streak: 4,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {
            'lesson-01': {
              lessonId: 'lesson-01',
              bestWpm: 8,
              bestAccuracy: 85,
              completedAt: Date.now(),
              attempts: 1,
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // Three stat labels
    await expect(page.getByText('שיעורים הושלמו')).toBeVisible()
    await expect(page.getByText('ימים ברצף')).toBeVisible()
    await expect(page.getByText('נקודות XP')).toBeVisible()
  })

  test('zero state stats are shown correctly', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 0,
          level: 1,
          streak: 0,
          lastPracticeDate: null,
          completedLessons: {},
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // Level 1, 0 XP
    await expect(page.getByText('רמה 1')).toBeVisible()
    await expect(page.getByText('0 XP')).toBeVisible()

    // 0 completed lessons, 0 streak, 0 XP in grid
    const zeroValues = page.locator('.text-2xl.font-bold', { hasText: '0' })
    expect(await zeroValues.count()).toBeGreaterThanOrEqual(3)
  })
})
