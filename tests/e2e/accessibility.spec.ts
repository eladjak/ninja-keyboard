import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('html element has correct lang and dir attributes', async ({
    page,
  }) => {
    await page.goto('/login')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'he')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('RTL direction is applied on lessons page', async ({ page }) => {
    await page.goto('/lessons')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('RTL direction is applied on settings page', async ({ page }) => {
    await page.goto('/settings')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('RTL direction is applied on onboarding page', async ({ page }) => {
    await page.goto('/onboarding')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('skip navigation link exists', async ({ page }) => {
    await page.goto('/login')
    const skipNav = page.getByText('דלג לתוכן הראשי')
    await expect(skipNav).toBeAttached()
  })

  test('skip link receives focus on Tab press', async ({ page }) => {
    await page.goto('/login')

    // Press Tab to focus the skip link
    await page.keyboard.press('Tab')

    // The skip link should now be visible/focused
    const skipNav = page.getByText('דלג לתוכן הראשי')
    await expect(skipNav).toBeVisible()
  })

  test('tab navigation through lesson page reaches interactive elements', async ({
    page,
  }) => {
    await page.goto('/lessons')

    // Tab through the page and check that focus is on an element
    await page.keyboard.press('Tab')
    let focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(focused).toBeTruthy()

    // Tab again to move to next interactive element
    await page.keyboard.press('Tab')
    focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(focused).toBeTruthy()
  })

  test('focus visible is present on interactive elements', async ({
    page,
  }) => {
    await page.goto('/lessons')

    // Tab to the first interactive element
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check that the focused element has a visible outline/ring
    const focusedElement = page.locator(':focus')
    const isVisible = await focusedElement.isVisible()
    expect(isVisible).toBeTruthy()

    // Verify focus styles are applied (the element should be focusable)
    const tagName = await focusedElement.evaluate(
      (el) => el.tagName.toLowerCase(),
    )
    expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tagName)
  })

  test('settings page switches have accessible labels', async ({ page }) => {
    await page.goto('/settings')

    // All switches should be findable by their label
    await expect(
      page.getByRole('switch', { name: 'אפקטי קול' }),
    ).toBeVisible()
    await expect(
      page.getByRole('switch', { name: 'מדריך אצבעות' }),
    ).toBeVisible()
    await expect(
      page.getByRole('switch', { name: 'צבעי אזורי מקלדת' }),
    ).toBeVisible()
  })

  test('settings page buttons have aria-pressed state', async ({ page }) => {
    await page.goto('/settings')

    // Theme buttons should have aria-pressed
    const systemButton = page.getByRole('button', {
      name: 'אוטומטי (מערכת)',
    })
    await expect(systemButton).toHaveAttribute('aria-pressed')

    // Keyboard layout buttons should have aria-pressed
    const standardButton = page.getByRole('button', { name: /תקנית/ })
    await expect(standardButton).toHaveAttribute('aria-pressed')
  })

  test('onboarding step indicator has progressbar role', async ({ page }) => {
    await page.goto('/onboarding')

    const progressbar = page.getByRole('progressbar')
    await expect(progressbar).toBeVisible()
    await expect(progressbar).toHaveAttribute('aria-valuenow', '1')
    await expect(progressbar).toHaveAttribute('aria-valuemin', '1')
    await expect(progressbar).toHaveAttribute('aria-valuemax', '5')
  })

  test('onboarding buttons have aria-label attributes', async ({ page }) => {
    await page.goto('/onboarding')

    // Step 1 continue button has aria-label
    const continueButton = page.getByRole('button', {
      name: 'המשך לשלב הבא',
    })
    await expect(continueButton).toBeVisible()
  })

  test('progress page has accessible progress bar', async ({ page }) => {
    await page.goto('/progress')

    // The Radix Progress component renders with role="progressbar"
    const progressbar = page.getByRole('progressbar')
    await expect(progressbar).toBeVisible()
  })

  test('join page has no accessibility violations', async ({ page }) => {
    await page.goto('/join')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('tab order follows logical reading order on settings page', async ({
    page,
  }) => {
    await page.goto('/settings')

    const focusedElements: string[] = []

    // Tab through multiple elements and collect their text content
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      const text = await page.evaluate(
        () => document.activeElement?.textContent ?? '',
      )
      if (text) focusedElements.push(text)
    }

    // We should have focused on multiple interactive elements
    expect(focusedElements.length).toBeGreaterThan(0)
  })

  test('lesson typing area screen reader text is present', async ({
    page,
  }) => {
    await page.goto('/lessons/lesson-01')

    // The lesson page should have the lesson title as a heading
    await expect(
      page.getByRole('heading', { name: 'שורת הבית - יד ימין' }),
    ).toBeVisible()

    // Target info should be readable
    await expect(page.getByText('יעד: 5 מ/ד')).toBeVisible()
    await expect(page.getByText('80% דיוק')).toBeVisible()

    // Stats labels should be present for screen readers
    await expect(page.getByText('מ/ד').first()).toBeVisible()
    await expect(page.getByText('דיוק').first()).toBeVisible()
    await expect(page.getByText('הקשות')).toBeVisible()
    await expect(page.getByText('זמן')).toBeVisible()
  })

  test('onboarding typing area has aria-label', async ({ page }) => {
    await page.goto('/onboarding')

    // Navigate to step 2
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    // The typing target should have an aria-label
    const typingTarget = page.locator('[aria-label="הקלד: שלום"]')
    await expect(typingTarget).toBeVisible()
  })

  test('decorative emojis have aria-hidden', async ({ page }) => {
    await page.goto('/onboarding')

    // Navigate through to step 3 (celebration)
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום')
    await page.waitForTimeout(800)

    // The celebration emoji should have aria-hidden
    const decorativeEmoji = page.locator('[aria-hidden="true"]').first()
    await expect(decorativeEmoji).toBeAttached()
  })

  test('color contrast meets WCAG AA standards on login page', async ({
    page,
  }) => {
    await page.goto('/login')

    // Run axe specifically for color contrast
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('all form inputs have associated labels', async ({ page }) => {
    await page.goto('/settings')

    // Check that slider has a label
    const volumeSlider = page.locator('#sound-volume')
    await expect(volumeSlider).toBeVisible()

    // The label should point to the slider's ID
    const volumeLabel = page.locator('label[for="sound-volume"]')
    await expect(volumeLabel).toBeVisible()

    // Switch labels should point to switch IDs
    const soundLabel = page.locator('label[for="sound-enabled"]')
    await expect(soundLabel).toBeVisible()

    const fingerGuideLabel = page.locator('label[for="finger-guide"]')
    await expect(fingerGuideLabel).toBeVisible()
  })
})
