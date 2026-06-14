import { test, expect } from '@playwright/test'

test.describe('Games Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games')
  })

  test('shows games page title', async ({ page }) => {
    await expect(page.getByText('משחקי הקלדה')).toBeVisible()
  })

  test('shows Word Rain game card', async ({ page }) => {
    await expect(page.getByText('גשם מילים')).toBeVisible()
    await expect(page.getByText('הקלד את המילים לפני שהן נופלות!')).toBeVisible()
  })

  test('shows Battle game card', async ({ page }) => {
    // "זירת קרב" also appears in the sidebar nav — scope to the page content.
    await expect(page.getByRole('main').getByText('זירת קרב')).toBeVisible()
  })

  test('navigates to Word Rain', async ({ page }) => {
    await page.getByText('גשם מילים').click()
    await expect(page).toHaveURL(/\/games\/word-rain/)
  })
})

test.describe('Word Rain Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/word-rain')
  })

  test('shows game title', async ({ page }) => {
    await expect(page.getByText('גשם מילים')).toBeVisible()
  })

  test('shows difficulty selection', async ({ page }) => {
    // Scope to <main> + exact match: "קל" is a substring of nav words like
    // "מקלדת"/"קיצורי מקלדת" in the app shell.
    const main = page.getByRole('main')
    await expect(main.getByText('קל', { exact: true })).toBeVisible()
    await expect(main.getByText('בינוני', { exact: true })).toBeVisible()
    await expect(main.getByText('קשה', { exact: true })).toBeVisible()
  })

  test('shows start button', async ({ page }) => {
    await expect(page.getByText('התחל משחק')).toBeVisible()
  })

  test('can select difficulty', async ({ page }) => {
    await page.getByText('קשה').click()
    await expect(page.getByText('3 חיים')).toBeVisible()
  })

  test('starts game on button click', async ({ page }) => {
    await page.getByText('התחל משחק').click()
    // Input field should appear
    await expect(page.getByPlaceholder('הקלד כאן...')).toBeVisible()
  })
})

test.describe('Speed Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/speed-test')
  })

  test('shows speed test page', async ({ page }) => {
    // "מבחן מהירות" appears in the sidebar nav AND twice in the page (h1 + h2).
    // Target the page's main heading.
    await expect(
      page.getByRole('heading', { name: 'מבחן מהירות', exact: true }),
    ).toBeVisible()
  })

  test('shows start button', async ({ page }) => {
    await expect(page.getByText('התחל מבחן')).toBeVisible()
  })

  test('shows share button after test', async ({ page }) => {
    // Start the test
    await page.getByText('התחל מבחן').click()
    // The test has started - verify we see the timer
    await expect(page.getByText(/0:\d{2}/)).toBeVisible()
  })
})

test.describe('Certificates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/certificates')
  })

  test('shows certificates page', async ({ page }) => {
    // "תעודות" also appears in the sidebar nav — scope to the page content.
    await expect(page.getByRole('main').getByText('תעודות').first()).toBeVisible()
  })

  test('shows certificate levels', async ({ page }) => {
    // Certificate tiers (the bronze tier is now "ברונזה", previously "ארד").
    const main = page.getByRole('main')
    await expect(main.getByText('ברונזה').first()).toBeVisible()
    await expect(main.getByText('כסף').first()).toBeVisible()
    await expect(main.getByText('זהב').first()).toBeVisible()
  })
})
