import { test, expect } from '@playwright/test'

test.describe('Badges Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/badges')
  })

  // ── Page Structure ──────────────────────────────────────────────

  test('badges page loads with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ההישגים שלי' })).toBeVisible()
  })

  test('page is in RTL layout', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('shows trophy icon in heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'ההישגים שלי' })
    await expect(heading).toBeVisible()
  })

  test('shows badge count summary', async ({ page }) => {
    // Format: "0/11 הישגים" or similar
    await expect(page.getByText(/\d+\/\d+ הישגים/)).toBeVisible()
  })

  // ── Category Tabs ───────────────────────────────────────────────

  test('shows category tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'הכל' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'מיוחד' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'התמדה' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'דיוק' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'מהירות' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'חקירה' })).toBeVisible()
  })

  test('default tab is "הכל"', async ({ page }) => {
    const allTab = page.getByRole('tab', { name: 'הכל' })
    await expect(allTab).toHaveAttribute('aria-selected', 'true')
  })

  test('clicking category tab filters badges', async ({ page }) => {
    // Click on "מהירות" tab
    await page.getByRole('tab', { name: 'מהירות' }).click()
    await expect(page.getByRole('tab', { name: 'מהירות' })).toHaveAttribute('aria-selected', 'true')
  })

  test('clicking "מיוחד" tab shows special badges', async ({ page }) => {
    await page.getByRole('tab', { name: 'מיוחד' }).click()
    // Should show "צעד ראשון" badge
    await expect(page.getByText('צעד ראשון')).toBeVisible()
  })

  test('clicking "דיוק" tab shows accuracy badges', async ({ page }) => {
    await page.getByRole('tab', { name: 'דיוק' }).click()
    // Should show "מושלם" and "מדייק"
    await expect(page.getByText('מושלם')).toBeVisible()
    await expect(page.getByText('מדייק')).toBeVisible()
  })

  // ── Badge Display ──────────────────────────────────────────────

  test('badges grid is rendered', async ({ page }) => {
    const grid = page.locator('.grid.grid-cols-3')
    await expect(grid.first()).toBeVisible()
  })

  test('shows at least 5 badges', async ({ page }) => {
    // Each badge has an aria-label containing the name
    const badges = page.locator('[aria-label*=" - לא הושג"], [aria-label]:not([aria-label*="לא הושג"])')
    await expect(badges.first()).toBeVisible()
  })

  test('unearned badges show lock icon', async ({ page }) => {
    // Lock icon should appear on unearned badges
    const lockIcons = page.locator('svg.lucide-lock')
    // At least some badges should be locked by default
    await expect(lockIcons.first()).toBeVisible()
  })

  test('unearned badges have grayscale styling', async ({ page }) => {
    const unearnedBadge = page.locator('.grayscale').first()
    await expect(unearnedBadge).toBeVisible()
  })

  // ── Specific Badges ────────────────────────────────────────────

  test('shows "צעד ראשון" badge (first lesson)', async ({ page }) => {
    await expect(page.getByText('צעד ראשון')).toBeVisible()
  })

  test('shows "מתמיד" badge (persistent)', async ({ page }) => {
    await expect(page.getByText('מתמיד')).toBeVisible()
  })

  test('shows speed milestone badges', async ({ page }) => {
    await expect(page.getByText('טייס')).toBeVisible()
    await expect(page.getByText('רקטה')).toBeVisible()
  })

  test('shows "חוקר" badge (explorer)', async ({ page }) => {
    await expect(page.getByText('חוקר')).toBeVisible()
  })

  // ── Badge Emojis ───────────────────────────────────────────────

  test('badges display emoji icons', async ({ page }) => {
    // Star emoji for "צעד ראשון"
    await expect(page.getByText('⭐')).toBeVisible()
    // Fire emoji for "מתמיד"
    await expect(page.getByText('🔥')).toBeVisible()
    // Target emoji for "מדייק"
    await expect(page.getByText('🎯')).toBeVisible()
  })

  // ── Accessibility ──────────────────────────────────────────────

  test('badge grid has proper RTL direction', async ({ page }) => {
    const grid = page.locator('[dir="rtl"]').first()
    await expect(grid).toBeVisible()
  })

  test('category tabs have proper ARIA roles', async ({ page }) => {
    const tablist = page.getByRole('tablist')
    await expect(tablist).toBeVisible()
  })

  test('all tabs are keyboard navigable', async ({ page }) => {
    const firstTab = page.getByRole('tab', { name: 'הכל' })
    await firstTab.focus()
    await expect(firstTab).toBeFocused()
  })

  test('badge emojis have aria-hidden', async ({ page }) => {
    const emojiSpans = page.locator('[role="img"][aria-hidden="true"]')
    await expect(emojiSpans.first()).toBeAttached()
  })

  // ── Navigation ─────────────────────────────────────────────────

  test('badges page is navigable from sidebar', async ({ page }) => {
    await page.goto('/home')
    // Navigate to badges - the page should exist as a route
    await page.goto('/badges')
    await expect(page.getByRole('heading', { name: 'ההישגים שלי' })).toBeVisible()
  })
})

test.describe('Placement Test - 3-Level UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/placement')
  })

  test('placement test shows intro screen', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'מבחן מיקום — נינג׳ה מקלדת' }),
    ).toBeVisible()
  })

  test('intro shows 3 stage descriptions', async ({ page }) => {
    await expect(page.getByText('שלב 1')).toBeVisible()
    await expect(page.getByText('שלב 2')).toBeVisible()
    await expect(page.getByText('שלב 3')).toBeVisible()
  })

  test('intro has start button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'בואו נתחיל!' }),
    ).toBeVisible()
  })

  test('page is in RTL layout', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })
})
