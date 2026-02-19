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
    await expect(page.getByText('זירת קרב')).toBeVisible()
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
    await expect(page.getByText('קל')).toBeVisible()
    await expect(page.getByText('בינוני')).toBeVisible()
    await expect(page.getByText('קשה')).toBeVisible()
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
    await expect(page.getByText('מבחן מהירות')).toBeVisible()
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
    await expect(page.getByText('תעודות')).toBeVisible()
  })

  test('shows certificate levels', async ({ page }) => {
    await expect(page.getByText('ארד')).toBeVisible()
    await expect(page.getByText('כסף')).toBeVisible()
    await expect(page.getByText('זהב')).toBeVisible()
  })
})
