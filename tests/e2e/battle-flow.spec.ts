import { test, expect } from '@playwright/test'

test.describe('Battle Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/battle')
  })

  // ── Difficulty Selection Phase ──────────────────────────────────

  test('shows difficulty selection screen with title', async ({ page }) => {
    // "זירת קרב" also appears in the sidebar nav link — scope to the page heading.
    await expect(
      page.getByRole('heading', { name: 'זירת קרב', level: 1 }),
    ).toBeVisible()
  })

  test('shows all three difficulty buttons', async ({ page }) => {
    await expect(page.getByTestId('difficulty-easy')).toBeVisible()
    await expect(page.getByTestId('difficulty-medium')).toBeVisible()
    await expect(page.getByTestId('difficulty-hard')).toBeVisible()
  })

  test('shows three difficulty labels in Hebrew', async ({ page }) => {
    await expect(page.getByTestId('difficulty-easy').getByText('קל')).toBeVisible()
    await expect(page.getByTestId('difficulty-medium').getByText('בינוני')).toBeVisible()
    await expect(page.getByTestId('difficulty-hard').getByText('קשה')).toBeVisible()
  })

  // The selection screen offers named rival opponents (each with a difficulty
  // rating) plus three "legacy" difficulty buttons. The per-difficulty WPM
  // labels were removed in the v4/v5 battle redesign, so these tests assert the
  // current rival-selection UI instead.

  test('shows the easy-tier rival option (באג)', async ({ page }) => {
    await expect(page.getByTestId('rival-bug')).toBeVisible()
    await expect(page.getByTestId('rival-bug').getByText('באג')).toBeVisible()
  })

  test('shows a mid-tier rival option (צל / סערה)', async ({ page }) => {
    await expect(page.getByTestId('rival-shadow')).toBeVisible()
    await expect(page.getByTestId('rival-storm')).toBeVisible()
  })

  test('shows the top-tier rival option (יוקי)', async ({ page }) => {
    await expect(page.getByTestId('rival-yuki')).toBeVisible()
    await expect(page.getByTestId('rival-yuki').getByText('יוקי')).toBeVisible()
  })

  test('shows rival opponent description', async ({ page }) => {
    // Each rival card shows a short descriptive tagline.
    await expect(page.getByText('כאוטי, הרבה טעויות')).toBeVisible()
  })

  // ── Countdown Phase ─────────────────────────────────────────────

  test('starts countdown after selecting easy difficulty', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await expect(page.getByTestId('countdown-display')).toBeVisible()
  })

  test('countdown displays numeric steps', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    const countdown = page.getByTestId('countdown-display')
    await expect(countdown).toBeVisible()
    // Countdown shows 3, 2, 1 or קדימה!
    const text = await countdown.textContent()
    expect(['3', '2', '1', 'קדימה!']).toContain(text?.trim())
  })

  // ── Battle Phase ────────────────────────────────────────────────

  test('shows battle text area after countdown completes', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    // Countdown: 3, 2, 1, קדימה! — 4 steps × 1s each
    await page.waitForTimeout(4500)
    await expect(page.getByTestId('battle-text-area')).toBeVisible()
  })

  test('shows player progress bar during battle', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    // The fill element starts at width:0% (player hasn't typed yet), so it has
    // zero rendered width — assert it's attached rather than visibly-painted.
    await expect(page.getByTestId('player-progress')).toBeAttached()
  })

  test('shows AI progress bar during battle', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    await expect(page.getByTestId('ai-progress')).toBeVisible()
  })

  test('shows player WPM display during battle', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    await expect(page.getByTestId('player-wpm')).toBeVisible()
  })

  test('shows AI WPM display during battle', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    // The AI WPM is rendered by the AIOpponent component under data-testid="ai-wpm-display".
    await expect(page.getByTestId('ai-wpm-display')).toBeVisible()
  })

  test('hidden battle input is accessible with correct aria-label', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    const input = page.getByTestId('battle-input')
    await expect(input).toHaveAttribute('aria-label', 'הקלדת טקסט')
  })

  test('battle input has autocomplete off', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    const input = page.getByTestId('battle-input')
    await expect(input).toHaveAttribute('autocomplete', 'off')
  })

  test('shows Hebrew text to type in battle area', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    const textArea = page.getByTestId('battle-text-area')
    await expect(textArea).toBeVisible()
    // Battle text is in Hebrew (dir=rtl, lang=he)
    const textParagraph = textArea.locator('p[dir="rtl"][lang="he"]')
    await expect(textParagraph).toBeVisible()
  })

  test('shows "אתה" label for player during battle', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    await expect(page.getByText('אתה').first()).toBeVisible()
  })

  test('shows click-to-focus hint during battle', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click()
    await page.waitForTimeout(4500)
    await expect(page.getByText('לחץ על הטקסט והתחל להקליד')).toBeVisible()
  })

  // ── Accessibility ───────────────────────────────────────────────

  test('difficulty buttons are keyboard focusable', async ({ page }) => {
    const easyBtn = page.getByTestId('difficulty-easy')
    await easyBtn.focus()
    await expect(easyBtn).toBeFocused()
  })

  test('difficulty buttons can be activated with Enter key', async ({ page }) => {
    const easyBtn = page.getByTestId('difficulty-easy')
    await easyBtn.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('countdown-display')).toBeVisible()
  })

  test('page has RTL container', async ({ page }) => {
    // The html element should have dir=rtl (set by root layout)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })
})
