import { test, expect } from '@playwright/test'

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard')
  })

  // ── Page Structure ──────────────────────────────────────────────

  test('shows leaderboard page with RTL layout', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('page content container has max-width constraint', async ({ page }) => {
    await expect(page.locator('.max-w-2xl').first()).toBeVisible()
  })

  // ── Podium Section ──────────────────────────────────────────────

  test('shows מובילים (leaders) section title', async ({ page }) => {
    await expect(page.getByText('מובילים')).toBeVisible()
  })

  test('shows podium with three positions', async ({ page }) => {
    await expect(page.getByTestId('podium-block-1')).toBeVisible()
    await expect(page.getByTestId('podium-block-2')).toBeVisible()
    await expect(page.getByTestId('podium-block-3')).toBeVisible()
  })

  test('shows podium player names for top 3', async ({ page }) => {
    await expect(page.getByTestId('podium-name-1')).toBeVisible()
    await expect(page.getByTestId('podium-name-2')).toBeVisible()
    await expect(page.getByTestId('podium-name-3')).toBeVisible()
  })

  test('shows WPM for each podium entry', async ({ page }) => {
    await expect(page.getByTestId('podium-wpm-1')).toBeVisible()
    await expect(page.getByTestId('podium-wpm-2')).toBeVisible()
    await expect(page.getByTestId('podium-wpm-3')).toBeVisible()
  })

  test('shows player avatars on podium', async ({ page }) => {
    await expect(page.getByTestId('podium-avatar-1')).toBeVisible()
    await expect(page.getByTestId('podium-avatar-2')).toBeVisible()
    await expect(page.getByTestId('podium-avatar-3')).toBeVisible()
  })

  test('podium has accessible list role', async ({ page }) => {
    const podiumList = page.getByRole('list', { name: 'פודיום' })
    await expect(podiumList).toBeVisible()
  })

  test('podium items have accessible aria-label with rank and name', async ({ page }) => {
    // Each podium item has aria-label="מקום N: playerName"
    await expect(page.getByRole('listitem', { name: /מקום 1/ })).toBeVisible()
    await expect(page.getByRole('listitem', { name: /מקום 2/ })).toBeVisible()
    await expect(page.getByRole('listitem', { name: /מקום 3/ })).toBeVisible()
  })

  // ── Full Rankings Table ─────────────────────────────────────────

  test('shows טבלת דירוג (rankings table) section title', async ({ page }) => {
    await expect(page.getByText('טבלת דירוג')).toBeVisible()
  })

  test('shows leaderboard table with rows', async ({ page }) => {
    // Table should have at least 20 rows (mock data generates 20 entries)
    const rows = page.getByTestId(/^row-/)
    expect(await rows.count()).toBeGreaterThanOrEqual(20)
  })

  test('shows table header columns in Hebrew', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'דירוג' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'שם' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'מהירות' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'דיוק' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'רמה' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'מגמה' })).toBeVisible()
  })

  test('shows medal for top 3 ranked entries', async ({ page }) => {
    // Top 3 entries should have medal emoji indicators
    const medals = page.getByTestId('medal')
    expect(await medals.count()).toBeGreaterThanOrEqual(3)
  })

  test('highlights current player row with badge', async ({ page }) => {
    // Current player (player-3) should be highlighted with "אתה" badge
    await expect(page.getByTestId('current-player-badge')).toBeVisible()
    await expect(page.getByTestId('current-player-badge')).toContainText('אתה')
  })

  // ── Category Tabs ───────────────────────────────────────────────

  test('shows all four category tabs', async ({ page }) => {
    await expect(page.getByTestId('category-wpm')).toBeVisible()
    await expect(page.getByTestId('category-accuracy')).toBeVisible()
    await expect(page.getByTestId('category-xp')).toBeVisible()
    await expect(page.getByTestId('category-streak')).toBeVisible()
  })

  test('category tab labels are in Hebrew', async ({ page }) => {
    await expect(page.getByTestId('category-wpm')).toContainText('מהירות')
    await expect(page.getByTestId('category-accuracy')).toContainText('דיוק')
    await expect(page.getByTestId('category-xp')).toContainText('ניקוד')
    await expect(page.getByTestId('category-streak')).toContainText('רצף')
  })

  test('switching to accuracy category shows leaderboard title', async ({ page }) => {
    await page.getByTestId('category-accuracy').click()
    await expect(page.getByTestId('leaderboard-title')).toBeVisible()
  })

  test('switching to XP category shows leaderboard title', async ({ page }) => {
    await page.getByTestId('category-xp').click()
    await expect(page.getByTestId('leaderboard-title')).toBeVisible()
  })

  // ── Time Range Selector ─────────────────────────────────────────

  test('shows time range selector group', async ({ page }) => {
    await expect(page.getByRole('group', { name: 'טווח זמן' })).toBeVisible()
  })

  test('shows daily time range button', async ({ page }) => {
    await expect(page.getByTestId('time-daily')).toBeVisible()
    await expect(page.getByTestId('time-daily')).toContainText('יומי')
  })

  test('shows weekly time range button', async ({ page }) => {
    await expect(page.getByTestId('time-weekly')).toBeVisible()
    await expect(page.getByTestId('time-weekly')).toContainText('שבועי')
  })

  test('shows all-time range button', async ({ page }) => {
    await expect(page.getByTestId('time-allTime')).toBeVisible()
    await expect(page.getByTestId('time-allTime')).toContainText('כל הזמנים')
  })

  test('can switch to daily time range', async ({ page }) => {
    await page.getByTestId('time-daily').click()
    // After clicking, the table should still be visible
    const rows = page.getByTestId(/^row-/)
    expect(await rows.count()).toBeGreaterThanOrEqual(20)
  })

  test('can switch to all-time range', async ({ page }) => {
    await page.getByTestId('time-allTime').click()
    const rows = page.getByTestId(/^row-/)
    expect(await rows.count()).toBeGreaterThanOrEqual(20)
  })

  // ── Accessibility ───────────────────────────────────────────────

  test('category tabs are keyboard focusable', async ({ page }) => {
    const firstTab = page.getByTestId('category-wpm')
    await firstTab.focus()
    await expect(firstTab).toBeFocused()
  })
})
