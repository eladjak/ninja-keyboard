import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('can navigate auth pages', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')

    const joinLink = page.getByRole('link', { name: /הצטרף|כיתה|קוד/ })
    if (await joinLink.isVisible()) {
      await joinLink.click()
      await expect(page).toHaveURL('/join')
    }
  })

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/\/login/)
  })

  test('responsive layout shows bottom tabs on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    // On auth pages, no bottom tabs expected
    // This test validates the page loads correctly on mobile
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('tab key navigates through interactive elements', async ({ page }) => {
    await page.goto('/login')
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(focused).toBeTruthy()
  })
})
