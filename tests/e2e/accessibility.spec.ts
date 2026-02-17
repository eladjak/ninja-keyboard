import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('html element has correct lang and dir attributes', async ({ page }) => {
    await page.goto('/login')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'he')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('skip navigation link exists', async ({ page }) => {
    await page.goto('/login')
    const skipNav = page.getByText('דלג לתוכן הראשי')
    await expect(skipNav).toBeAttached()
  })

  test('join page has no accessibility violations', async ({ page }) => {
    await page.goto('/join')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
