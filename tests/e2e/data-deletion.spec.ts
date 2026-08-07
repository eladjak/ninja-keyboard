import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * The dialog promised to delete "ההתקדמות, XP, והסכמות", called only
 * `revokeAllConsents()`, and then reported "כל הנתונים נמחקו בהצלחה".
 *
 * These tests assert the CHILD'S DATA IS GONE, not that a success banner
 * appeared — the banner was exactly what was true before while nothing had
 * been deleted.
 */

const ALL_KEYS = [
  'ninja-keyboard-accessibility',
  'ninja-keyboard-badges',
  'ninja-keyboard-cert-celebrations',
  'ninja-keyboard-consent',
  'ninja-keyboard-daily-challenges',
  'ninja-keyboard-music',
  'ninja-keyboard-practice-history',
  'ninja-keyboard-settings',
  'ninja-keyboard-story',
  'ninja-keyboard-theme',
  'ninja-keyboard-xp',
  'ninja:offline:lessons',
  'ninja:offline:pending-results',
]

async function seedAChildWithRealProgress(page: Page) {
  await page.evaluate((keys) => {
    for (const k of keys) localStorage.setItem(k, '{"state":{"seeded":true},"version":0}')
    localStorage.setItem(
      'ninja-keyboard-xp',
      JSON.stringify({
        state: {
          totalXp: 680,
          level: 7,
          streak: 4,
          completedLessons: {
            'lesson-01': { lessonId: 'lesson-01', bestWpm: 22, bestAccuracy: 94, attempts: 3 },
          },
        },
        version: 0,
      }),
    )
  }, ALL_KEYS)
}

/**
 * `locator.count()` does not auto-retry, so calling it straight after goto()
 * races hydration and silently reports zero — which would turn this whole file
 * into a skip that looks like a pass. Wait for the control instead.
 */
const findPrivacyPage = async (page: Page) => {
  for (const path of ['/settings', '/profile', '/parent-report']) {
    await page.goto(path)
    try {
      await page
        .getByRole('button', { name: /מחק את כל הנתונים/ })
        .waitFor({ state: 'visible', timeout: 5000 })
      return path
    } catch {
      // not on this page; try the next
    }
  }
  return null
}

test('deleting a child\'s data actually erases it', async ({ page }) => {
  await page.goto('/settings')
  await seedAChildWithRealProgress(page)

  const path = await findPrivacyPage(page)
  test.skip(!path, 'deletion dialog is not mounted on any page yet')
  await page.goto(path!)
  await seedAChildWithRealProgress(page)
  await page.reload()

  // Precondition: the data really is there. Without this the assertion below
  // could pass on an origin that was empty all along.
  const before = await page.evaluate(
    (keys) => keys.filter((k) => localStorage.getItem(k) !== null).length,
    ALL_KEYS,
  )
  expect(before).toBe(ALL_KEYS.length)

  await page.getByRole('button', { name: /מחק את כל הנתונים/ }).click()
  await page.getByLabel(/כדי לאשר/).fill('מחק')
  await page.getByRole('button', { name: 'מחק לצמיתות' }).click()

  await expect(page.getByRole('status')).toBeVisible()

  const after = await page.evaluate(
    (keys) => keys.filter((k) => localStorage.getItem(k) !== null),
    ALL_KEYS,
  )
  expect(after).toEqual([])

  // And nothing of ours survives under the namespace at all.
  const leftovers = await page.evaluate(() =>
    Object.keys(localStorage).filter(
      (k) => k.startsWith('ninja-keyboard-') || k.startsWith('ninja:'),
    ),
  )
  expect(leftovers).toEqual([])
})

test('the XP a child earned is gone from the SCREEN too, not just from storage', async ({
  page,
}) => {
  // Clearing storage while the live zustand stores still hold the values would
  // leave "680 XP" on screen under a "deleted successfully" banner — the same
  // lie in a new costume.
  const path = await findPrivacyPage(page)
  test.skip(!path, 'deletion dialog is not mounted on any page yet')

  await page.goto(path!)
  await seedAChildWithRealProgress(page)
  await page.reload()
  await expect(page.getByText('680').first()).toBeVisible()

  await page.getByRole('button', { name: /מחק את כל הנתונים/ }).click()
  await page.getByLabel(/כדי לאשר/).fill('מחק')
  await page.getByRole('button', { name: 'מחק לצמיתות' }).click()

  await expect(page.getByText('680')).toHaveCount(0, { timeout: 10_000 })
  const xp = await page.evaluate(() => localStorage.getItem('ninja-keyboard-xp'))
  expect(xp).toBeNull()
})
