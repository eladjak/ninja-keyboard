import { test, expect } from '@playwright/test'

test.describe('Settings Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted settings before each test
    await page.goto('/settings')
    await page.evaluate(() => {
      localStorage.removeItem('ninja-keyboard-settings')
    })
    await page.reload()
  })

  test('settings page renders with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'הגדרות' })).toBeVisible()
  })

  test('sound section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'צלילים' })).toBeVisible()
    await expect(page.getByText('אפקטי קול')).toBeVisible()
    await expect(page.getByText('עוצמת קול')).toBeVisible()
  })

  test('toggle sound on/off', async ({ page }) => {
    // Sound switch should be on by default
    const soundSwitch = page.getByRole('switch', { name: 'אפקטי קול' })
    await expect(soundSwitch).toBeVisible()
    await expect(soundSwitch).toBeChecked()

    // Toggle off
    await soundSwitch.click()
    await expect(soundSwitch).not.toBeChecked()

    // Toggle back on
    await soundSwitch.click()
    await expect(soundSwitch).toBeChecked()
  })

  test('volume slider changes value', async ({ page }) => {
    const volumeSlider = page.locator('#sound-volume')
    await expect(volumeSlider).toBeVisible()

    // Default volume is 70% (0.7)
    await expect(page.getByText('70%')).toBeVisible()

    // Change the slider value
    await volumeSlider.fill('0.5')
    await expect(page.getByText('50%')).toBeVisible()
  })

  test('volume slider is disabled when sound is off', async ({ page }) => {
    // Toggle sound off
    const soundSwitch = page.getByRole('switch', { name: 'אפקטי קול' })
    await soundSwitch.click()

    // Slider should be disabled
    const volumeSlider = page.locator('#sound-volume')
    await expect(volumeSlider).toBeDisabled()
  })

  test('theme preference buttons are visible', async ({ page }) => {
    await expect(page.getByText('מראה')).toBeVisible()

    // Three theme options
    await expect(page.getByText('אוטומטי (מערכת)')).toBeVisible()
    await expect(page.getByText('בהיר')).toBeVisible()
    await expect(page.getByText('כהה')).toBeVisible()
  })

  test('change theme preference to dark', async ({ page }) => {
    const darkButton = page.getByRole('button', { name: 'כהה' })
    await darkButton.click()

    // The dark button should now be pressed
    await expect(darkButton).toHaveAttribute('aria-pressed', 'true')

    // The system and light buttons should not be pressed
    const systemButton = page.getByRole('button', {
      name: 'אוטומטי (מערכת)',
    })
    const lightButton = page.getByRole('button', { name: 'בהיר' })
    await expect(systemButton).toHaveAttribute('aria-pressed', 'false')
    await expect(lightButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('change theme preference to light', async ({ page }) => {
    const lightButton = page.getByRole('button', { name: 'בהיר' })
    await lightButton.click()

    await expect(lightButton).toHaveAttribute('aria-pressed', 'true')
  })

  test('age theme selector shows all 5 themes', async ({ page }) => {
    await expect(page.getByText('ערכת נושא (גיל)')).toBeVisible()

    // Each theme has a name and age range
    await expect(page.getByText(/שתיל/)).toBeVisible()
    await expect(page.getByText(/נבט/)).toBeVisible()
    await expect(page.getByText(/גזע/)).toBeVisible()
    await expect(page.getByText(/ענף/)).toBeVisible()
    await expect(page.getByText(/צמרת/)).toBeVisible()
  })

  test('keyboard layout section is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'תצוגת שיעור' }),
    ).toBeVisible()
    await expect(page.getByText('פריסת מקלדת')).toBeVisible()

    // Two layout options
    await expect(page.getByText('תקנית')).toBeVisible()
    await expect(page.getByText('דבורק')).toBeVisible()
  })

  test('change keyboard layout to dvorak', async ({ page }) => {
    const dvorakButton = page.getByRole('button', { name: /דבורק/ })
    await dvorakButton.click()

    // Dvorak button should be pressed
    await expect(dvorakButton).toHaveAttribute('aria-pressed', 'true')

    // Standard should not be pressed
    const standardButton = page.getByRole('button', { name: /תקנית/ })
    await expect(standardButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('finger guide toggle works', async ({ page }) => {
    const fingerGuideSwitch = page.getByRole('switch', {
      name: 'מדריך אצבעות',
    })
    await expect(fingerGuideSwitch).toBeVisible()

    // Default is on
    await expect(fingerGuideSwitch).toBeChecked()

    // Toggle off
    await fingerGuideSwitch.click()
    await expect(fingerGuideSwitch).not.toBeChecked()
  })

  test('keyboard colors toggle works', async ({ page }) => {
    const keyboardColorsSwitch = page.getByRole('switch', {
      name: 'צבעי אזורי מקלדת',
    })
    await expect(keyboardColorsSwitch).toBeVisible()

    // Default is on
    await expect(keyboardColorsSwitch).toBeChecked()

    // Toggle off
    await keyboardColorsSwitch.click()
    await expect(keyboardColorsSwitch).not.toBeChecked()
  })

  test('settings persist after navigation away and back', async ({ page }) => {
    // Change sound to off
    const soundSwitch = page.getByRole('switch', { name: 'אפקטי קול' })
    await soundSwitch.click()
    await expect(soundSwitch).not.toBeChecked()

    // Change theme to dark
    const darkButton = page.getByRole('button', { name: 'כהה' })
    await darkButton.click()

    // Change keyboard layout to dvorak
    const dvorakButton = page.getByRole('button', { name: /דבורק/ })
    await dvorakButton.click()

    // Navigate away
    await page.goto('/lessons')
    await page.waitForTimeout(300)

    // Navigate back
    await page.goto('/settings')

    // Sound should still be off
    await expect(
      page.getByRole('switch', { name: 'אפקטי קול' }),
    ).not.toBeChecked()

    // Theme should still be dark
    await expect(
      page.getByRole('button', { name: 'כהה' }),
    ).toHaveAttribute('aria-pressed', 'true')

    // Keyboard layout should still be dvorak
    await expect(
      page.getByRole('button', { name: /דבורק/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('settings persist after page reload', async ({ page }) => {
    // Toggle finger guide off
    const fingerGuideSwitch = page.getByRole('switch', {
      name: 'מדריך אצבעות',
    })
    await fingerGuideSwitch.click()
    await expect(fingerGuideSwitch).not.toBeChecked()

    // Reload the page
    await page.reload()

    // Finger guide should still be off
    await expect(
      page.getByRole('switch', { name: 'מדריך אצבעות' }),
    ).not.toBeChecked()
  })

  test('volume slider displays correct percentage', async ({ page }) => {
    const volumeSlider = page.locator('#sound-volume')

    // Set to 0.25
    await volumeSlider.fill('0.25')
    await expect(page.getByText('25%')).toBeVisible()

    // Set to 1.0
    await volumeSlider.fill('1')
    await expect(page.getByText('100%')).toBeVisible()

    // Set to 0
    await volumeSlider.fill('0')
    await expect(page.getByText('0%')).toBeVisible()
  })
})
