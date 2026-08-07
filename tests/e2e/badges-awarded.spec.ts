import { test, expect } from '@playwright/test'

/**
 * `checkAllBadges` / `getNewlyEarnedBadges` had zero callers anywhere in src/,
 * so the badges page advertised 13 achievements and the main curriculum could
 * earn none of them. Only the shortcut lesson path awarded anything, and only
 * `lesson_completed` badges.
 *
 * This asserts a child who completes a real lesson actually EARNS something,
 * and that the badges page shows it — not that a function was called.
 */

const LESSON_01_LINES = [
  'ייי חחח ללל ייי חחח ללל',
  'יח לי חל יל חי ליח',
  'יחל ליח חיל יחל ליח חיל',
  'חי לי יח לח יל חל',
  'ליל חיל יחל חלי ילח',
  'יחי ליל חלל יחי ליל',
]

test.describe('completing a lesson earns badges', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'needs CDP key events for Hebrew input',
  )

  test('a perfect first lesson awards badges and the page shows them', async ({
    page,
  }) => {
    await page.goto('/lessons/lesson-01')
    await expect(page.getByText('שורת הבית - יד ימין')).toBeVisible()
    await page.waitForTimeout(900)

    // Precondition: nothing earned yet. Without this the assertion below could
    // pass on a profile that already had badges.
    const before = await page.evaluate(() => {
      const raw = localStorage.getItem('ninja-keyboard-badges')
      return raw ? Object.keys(JSON.parse(raw).state?.earnedBadges ?? {}).length : 0
    })
    expect(before).toBe(0)

    const cdp = await page.context().newCDPSession(page)
    for (const line of LESSON_01_LINES) {
      for (const ch of line) {
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', text: ch, key: ch })
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch })
      }
    }
    await expect(page.getByText('כל הכבוד! עברתם את השיעור!')).toBeVisible()

    const earned = await page.evaluate(() => {
      const raw = localStorage.getItem('ninja-keyboard-badges')
      return raw ? Object.keys(JSON.parse(raw).state?.earnedBadges ?? {}) : []
    })
    expect(earned.length).toBeGreaterThan(0)
    // A perfect run is a first lesson and a perfect lesson at minimum.
    expect(earned).toContain('first-lesson')

    await page.goto('/badges')
    await expect(page.getByText(/[1-9]\d*\/13/)).toBeVisible()
  })

  test('the badge a child never qualified for is NOT awarded', async ({ page }) => {
    // Counter-control: awarding every badge unconditionally would satisfy the
    // test above. `lesson_no_backspace` is deliberately unreachable — the
    // lesson key handler never forwards Backspace, so counting it as earned
    // would be a badge for something the child did not do.
    await page.goto('/lessons/lesson-01')
    await expect(page.getByText('שורת הבית - יד ימין')).toBeVisible()
    await page.waitForTimeout(900)

    const cdp = await page.context().newCDPSession(page)
    for (const line of LESSON_01_LINES) {
      for (const ch of line) {
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', text: ch, key: ch })
        await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch })
      }
    }
    await expect(page.getByText('כל הכבוד! עברתם את השיעור!')).toBeVisible()

    const earned = await page.evaluate(() => {
      const raw = localStorage.getItem('ninja-keyboard-badges')
      return raw ? Object.keys(JSON.parse(raw).state?.earnedBadges ?? {}) : []
    })
    // 'patient' is the lesson_no_backspace badge — deliberately unreachable.
    // 'persistent' is a multi-day streak, which one session cannot satisfy.
    // (Both ids verified against badge-definitions.ts; asserting a
    // non-existent id would pass vacuously.)
    expect(earned).not.toContain('patient')
    expect(earned).not.toContain('persistent')
    expect(earned.length).toBeLessThan(13)
  })
})
