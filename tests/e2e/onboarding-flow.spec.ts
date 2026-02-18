import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding')
  })

  test('onboarding page loads with step indicator', async ({ page }) => {
    // Step indicator shows "שלב 1 מתוך 5"
    await expect(page.getByText('שלב 1 מתוך 5')).toBeVisible()

    // The step indicator progressbar should be present
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('step 1: finger placement guide is shown', async ({ page }) => {
    // Step 1 heading
    await expect(
      page.getByRole('heading', { name: 'שים את האצבעות ככה' }),
    ).toBeVisible()

    // Instruction text
    await expect(
      page.getByText('הנח כל אצבע על המקש שלה בשורת הבית'),
    ).toBeVisible()

    // "Continue" button for step 1
    await expect(
      page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }),
    ).toBeVisible()
  })

  test('step 1: clicking continue advances to step 2', async ({ page }) => {
    const continueButton = page.getByRole('button', {
      name: 'הבנתי, בוא נתחיל!',
    })
    await continueButton.click()

    // Step 2 should show the typing prompt
    await expect(page.getByText('שלב 2 מתוך 5')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /הקלד: שלום/ }),
    ).toBeVisible()
  })

  test('step 2: type שלום typing interface is shown', async ({ page }) => {
    // Navigate to step 2
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()

    // Heading should ask to type שלום
    await expect(
      page.getByRole('heading', { name: /הקלד: שלום/ }),
    ).toBeVisible()

    // Helper text
    await expect(
      page.getByText('הקלד כל אות בזהירות — לא נחזיר אותך'),
    ).toBeVisible()

    // The letters שלום should be displayed individually
    await expect(page.getByText('ש')).toBeVisible()
    await expect(page.getByText('ל').first()).toBeVisible()
    await expect(page.getByText('ו').first()).toBeVisible()
    await expect(page.getByText('ם').first()).toBeVisible()
  })

  test('step 2: typing correct keys advances and shows green feedback', async ({
    page,
  }) => {
    // Navigate to step 2
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300) // Wait for animation

    // Type the Hebrew characters for שלום
    // On Hebrew keyboard layout: ש=a, ל=k, ו=u, ם=o (final mem)
    // We simulate typing the actual Hebrew characters
    await page.keyboard.type('ש')
    await page.waitForTimeout(200)

    // After typing first correct character, it should show green
    // The character ש should now have the green class
    const greenChar = page.locator('.text-green-500').first()
    await expect(greenChar).toBeVisible()
  })

  test('step 2: completing שלום advances to step 3 celebration', async ({
    page,
  }) => {
    // Navigate to step 2
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    // Type שלום character by character
    await page.keyboard.type('ש')
    await page.waitForTimeout(100)
    await page.keyboard.type('ל')
    await page.waitForTimeout(100)
    await page.keyboard.type('ו')
    await page.waitForTimeout(100)
    await page.keyboard.type('ם')

    // Wait for the 400ms delay + animation
    await page.waitForTimeout(800)

    // Step 3 celebration should appear
    await expect(page.getByText('שלב 3 מתוך 5')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /כל הכבוד/ }),
    ).toBeVisible()
  })

  test('step 3: celebration shows XP reward and badge', async ({ page }) => {
    // Navigate through to step 3
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום')
    await page.waitForTimeout(800)

    // XP reward badge
    await expect(page.getByText('+50 XP')).toBeVisible()

    // Achievement badge name
    await expect(page.getByText('צעד ראשון')).toBeVisible()

    // Congratulations message
    await expect(page.getByText('הקלדת את המילה הראשונה שלך!')).toBeVisible()

    // Continue button
    await expect(
      page.getByRole('button', { name: 'המשך' }),
    ).toBeVisible()
  })

  test('step 3: clicking continue advances to step 4', async ({ page }) => {
    // Navigate through to step 3
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום')
    await page.waitForTimeout(800)

    // Click continue
    await page.getByRole('button', { name: 'המשך' }).click()
    await page.waitForTimeout(300)

    // Step 4 should show
    await expect(page.getByText('שלב 4 מתוך 5')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /עכשיו: שלום עולם/ }),
    ).toBeVisible()
  })

  test('step 4: type שלום עולם interface is shown', async ({ page }) => {
    // Navigate through to step 4
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום')
    await page.waitForTimeout(800)

    await page.getByRole('button', { name: 'המשך' }).click()
    await page.waitForTimeout(300)

    // Step 4 text
    await expect(
      page.getByText('מצוין! עכשיו נוסיף עוד מילה. זוכר את רווח?'),
    ).toBeVisible()
  })

  test('step 4: completing שלום עולם advances to step 5', async ({ page }) => {
    // Navigate through to step 4
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום')
    await page.waitForTimeout(800)

    await page.getByRole('button', { name: 'המשך' }).click()
    await page.waitForTimeout(300)

    // Type שלום עולם (with space)
    await page.keyboard.type('שלום')
    await page.waitForTimeout(100)
    await page.keyboard.type(' ')
    await page.waitForTimeout(100)
    await page.keyboard.type('עולם')
    await page.waitForTimeout(800)

    // Step 5 should show
    await expect(page.getByText('שלב 5 מתוך 5')).toBeVisible()
    await expect(page.getByRole('heading', { name: /מעולה/ })).toBeVisible()
  })

  test('step 5: finish summary shows stats', async ({ page }) => {
    // Navigate through all steps to step 5
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום')
    await page.waitForTimeout(800)

    await page.getByRole('button', { name: 'המשך' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום עולם')
    await page.waitForTimeout(800)

    // Summary card should show
    await expect(page.getByText('סיכום האימון')).toBeVisible()
    await expect(page.getByText('מילים שהקלדת')).toBeVisible()
    await expect(page.getByText('2')).toBeVisible() // 2 words typed
    await expect(page.getByText('XP שנצברו')).toBeVisible()
    await expect(page.getByText('+50')).toBeVisible()

    // Next step tease
    await expect(
      page.getByText('שלב הבא: שורת הבית המלאה — תלמד עוד 10 מקשים!'),
    ).toBeVisible()
  })

  test('step 5: clicking finish button redirects to /lessons', async ({
    page,
  }) => {
    // Navigate through all steps
    await page.getByRole('button', { name: 'הבנתי, בוא נתחיל!' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום')
    await page.waitForTimeout(800)

    await page.getByRole('button', { name: 'המשך' }).click()
    await page.waitForTimeout(300)

    await page.keyboard.type('שלום עולם')
    await page.waitForTimeout(800)

    // Click the finish button
    await page.getByRole('button', { name: 'בוא נתחיל!' }).click()

    // Should navigate to lessons page
    await expect(page).toHaveURL('/lessons')
  })

  test('step indicator accessibility attributes', async ({ page }) => {
    const progressbar = page.getByRole('progressbar')
    await expect(progressbar).toHaveAttribute('aria-valuenow', '1')
    await expect(progressbar).toHaveAttribute('aria-valuemin', '1')
    await expect(progressbar).toHaveAttribute('aria-valuemax', '5')
    await expect(progressbar).toHaveAttribute(
      'aria-label',
      'שלב 1 מתוך 5',
    )
  })
})
