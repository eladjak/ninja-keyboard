import { test, expect } from '@playwright/test'

test.describe('Battle Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/battle')
  })

  // ── Difficulty Selection Phase ──────────────────────────────────

  test('shows difficulty selection screen with title', async ({ page }) => {
    await expect(page.getByText('זירת קרב')).toBeVisible()
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

  test('shows WPM for easy difficulty (15 מ/ד)', async ({ page }) => {
    await expect(page.getByTestId('difficulty-easy').getByText('15 מ/ד')).toBeVisible()
  })

  test('shows WPM for medium difficulty (30 מ/ד)', async ({ page }) => {
    await expect(page.getByTestId('difficulty-medium').getByText('30 מ/ד')).toBeVisible()
  })

  test('shows WPM for hard difficulty (50 מ/ד)', async ({ page }) => {
    await expect(page.getByTestId('difficulty-hard').getByText('50 מ/ד')).toBeVisible()
  })

  test('shows bot opponent description', async ({ page }) => {
    await expect(page.getByText(/נינג.*ה בוט/)).toBeVisible()
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
    await expect(page.getByTestId('player-progress')).toBeVisible()
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
    await expect(page.getByTestId('ai-wpm')).toBeVisible()
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
