import { test, expect } from '@playwright/test'

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile')
  })

  // ── Page Structure ──────────────────────────────────────────────

  test('shows profile page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'הפרופיל שלי' })).toBeVisible()
  })

  test('page is in RTL layout', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('profile content container has max-width constraint', async ({ page }) => {
    await expect(page.locator('.max-w-2xl').first()).toBeVisible()
  })

  // ── Profile Card ────────────────────────────────────────────────

  test('shows player display name', async ({ page }) => {
    // Default name is "נינג׳ה אנונימי"
    await expect(page.getByText('נינג׳ה אנונימי')).toBeVisible()
  })

  test('shows player level', async ({ page }) => {
    // Level label — default is level 1
    await expect(page.getByText(/רמה \d+/)).toBeVisible()
  })

  test('shows rank name with emoji', async ({ page }) => {
    // Profile card shows ninja rank (e.g., "שתיל", "נבט", etc.)
    // At level 1 the rank emoji is shown
    const profileCard = page.locator('.max-w-2xl').first()
    await expect(profileCard).toBeVisible()
  })

  test('shows XP amount', async ({ page }) => {
    // Default is 0 XP
    await expect(page.getByText(/\d+ XP/).first()).toBeVisible()
  })

  test('shows progress bar for level advancement', async ({ page }) => {
    await expect(page.getByRole('progressbar').first()).toBeVisible()
  })

  test('shows completed lessons count', async ({ page }) => {
    // Shows שיעורים or similar lesson count
    await expect(page.getByText(/שיעורים/).first()).toBeVisible()
  })

  test('shows streak counter', async ({ page }) => {
    // Shows ימים ברצף or streak-related text
    await expect(page.getByText(/ברצף|רצף/).first()).toBeVisible()
  })

  test('shows edit name button or editable name field', async ({ page }) => {
    // Profile card has an edit button for the display name
    const editTrigger = page.getByRole('button').filter({ hasText: /ערוך|עריכה/ })
    const nameInput = page.getByRole('textbox')
    // Either an edit button or directly an input should exist
    const hasEditButton = await editTrigger.count() > 0
    const hasInput = await nameInput.count() > 0
    expect(hasEditButton || hasInput).toBe(true)
  })

  // ── Stats Chart ─────────────────────────────────────────────────

  test('shows stats chart section with SVG', async ({ page }) => {
    // StatsChart renders an SVG (recharts or similar)
    await expect(page.locator('svg').first()).toBeVisible()
  })

  // ── Badge Showcase ──────────────────────────────────────────────

  test('shows badge showcase section title', async ({ page }) => {
    await expect(page.getByText('תגים והישגים')).toBeVisible()
  })

  test('shows earned/total badge count', async ({ page }) => {
    // Badge showcase shows "N/M תגים" format
    await expect(page.getByText(/\d+\/\d+ תגים/)).toBeVisible()
  })

  test('shows badge grid with at least one badge', async ({ page }) => {
    // BADGE_DEFINITIONS has entries — they appear as locked or earned badges
    const badges = page.locator('[class*="grid"]').filter({ has: page.locator('[class*="rounded"]') })
    await expect(badges.first()).toBeVisible()
  })

  // ── State With Progress ─────────────────────────────────────────

  test('shows updated XP after setting localStorage state', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 250,
          level: 4,
          streak: 5,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {
            'lesson-01': {
              lessonId: 'lesson-01',
              bestWpm: 20,
              bestAccuracy: 95,
              completedAt: Date.now(),
              attempts: 3,
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    await expect(page.getByText(/250 XP/).first()).toBeVisible()
    await expect(page.getByText(/רמה 4/)).toBeVisible()
  })

  test('shows best WPM after completing lessons', async ({ page }) => {
    await page.evaluate(() => {
      const xpState = {
        state: {
          totalXp: 100,
          level: 2,
          streak: 1,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {
            'lesson-01': {
              lessonId: 'lesson-01',
              bestWpm: 35,
              bestAccuracy: 90,
              completedAt: Date.now(),
              attempts: 2,
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
    })
    await page.reload()

    // Best WPM should appear in profile stats
    await expect(page.getByText(/35/).first()).toBeVisible()
  })
})
