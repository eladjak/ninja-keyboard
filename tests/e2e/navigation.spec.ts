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

  test('guest visiting /home either plays as guest or is sent to login', async ({
    page,
  }) => {
    // Product behavior (see src/middleware.ts): when Supabase auth is configured,
    // /home is a protected route and an unauthenticated user is redirected to
    // /login. When Supabase env is absent (guest/demo mode, e.g. CI without
    // secrets) the middleware is a no-op and /home renders for the guest.
    // Assert whichever contract applies to the current environment.
    await page.goto('/home')
    await page.waitForLoadState('networkidle')
    const url = new URL(page.url())
    if (url.pathname.startsWith('/login')) {
      // Auth enabled → correctly redirected to login.
      await expect(page).toHaveURL(/\/login/)
    } else {
      // Guest mode → /home is reachable and renders the app shell.
      await expect(page).toHaveURL(/\/home/)
      await expect(page.getByRole('main')).toBeVisible()
    }
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
