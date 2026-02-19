import { test, expect } from '@playwright/test'

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shortcuts')
  })

  // ── Page Header ─────────────────────────────────────────────────

  test('shows page title in Hebrew', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'קיצורי מקלדת' })).toBeVisible()
  })

  test('shows page description mentioning shortcuts count', async ({ page }) => {
    await expect(page.getByText(/40\+.*קיצורים/)).toBeVisible()
  })

  // ── Category Tabs ───────────────────────────────────────────────

  test('shows all five category tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'בסיסי' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'טקסט' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'דפדפן' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'חלונות' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'מתקדם' })).toBeVisible()
  })

  test('tab list has correct Hebrew aria-label', async ({ page }) => {
    await expect(page.getByRole('tablist')).toHaveAttribute('aria-label', 'קטגוריות קיצורים')
  })

  test('first tab (בסיסי) is selected by default', async ({ page }) => {
    const basicTab = page.getByRole('tab', { name: 'בסיסי' })
    await expect(basicTab).toHaveAttribute('data-state', 'active')
  })

  test('switches to text tab when clicked', async ({ page }) => {
    await page.getByRole('tab', { name: 'טקסט' }).click()
    const textTab = page.getByRole('tab', { name: 'טקסט' })
    await expect(textTab).toHaveAttribute('data-state', 'active')
  })

  test('switches to browser tab when clicked', async ({ page }) => {
    await page.getByRole('tab', { name: 'דפדפן' }).click()
    const browserTab = page.getByRole('tab', { name: 'דפדפן' })
    await expect(browserTab).toHaveAttribute('data-state', 'active')
  })

  test('switches to windows tab when clicked', async ({ page }) => {
    await page.getByRole('tab', { name: 'חלונות' }).click()
    const windowsTab = page.getByRole('tab', { name: 'חלונות' })
    await expect(windowsTab).toHaveAttribute('data-state', 'active')
  })

  test('switches to advanced tab when clicked', async ({ page }) => {
    await page.getByRole('tab', { name: 'מתקדם' }).click()
    const advancedTab = page.getByRole('tab', { name: 'מתקדם' })
    await expect(advancedTab).toHaveAttribute('data-state', 'active')
  })

  // ── Shortcut Content ────────────────────────────────────────────

  test('shows shortcut cards with keyboard keys in default tab', async ({ page }) => {
    // Basic shortcuts contain Ctrl key combinations
    await expect(page.getByText(/Ctrl/i).first()).toBeVisible()
  })

  test('shows "תרגול הכל" practice button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'תרגול הכל' })).toBeVisible()
  })

  test('shows mastery counter badge in 0/N format', async ({ page }) => {
    // Badge shows "0/N תגים" format — check for 0/ prefix
    await expect(page.getByText(/^0\/\d+$/).first()).toBeVisible()
  })

  test('each category tab shows a practice all button', async ({ page }) => {
    for (const tab of ['בסיסי', 'טקסט', 'דפדפן', 'חלונות', 'מתקדם']) {
      await page.getByRole('tab', { name: tab }).click()
      await expect(page.getByRole('button', { name: 'תרגול הכל' })).toBeVisible()
    }
  })

  test('shows lesson title in active tab content', async ({ page }) => {
    // Each lesson has a title (h2) — basic tab should show a heading
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
  })

  // ── Practice Mode ───────────────────────────────────────────────

  test('clicking "תרגול הכל" enters practice mode', async ({ page }) => {
    await page.getByRole('button', { name: 'תרגול הכל' }).click()
    // Practice mode shows a different UI — the tabs disappear
    await expect(page.getByRole('tablist')).not.toBeVisible()
  })

  // ── Accessibility ───────────────────────────────────────────────

  test('tabs are keyboard focusable', async ({ page }) => {
    const firstTab = page.getByRole('tab').first()
    await firstTab.focus()
    await expect(firstTab).toBeFocused()
  })

  test('practice all button is keyboard focusable', async ({ page }) => {
    const practiceBtn = page.getByRole('button', { name: 'תרגול הכל' })
    await practiceBtn.focus()
    await expect(practiceBtn).toBeFocused()
  })

  test('page has RTL direction', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })
})
