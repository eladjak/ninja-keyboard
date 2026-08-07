import { test, expect } from '@playwright/test'

/**
 * Two defects that only exist in a running browser — a passing unit suite and a
 * clean typecheck cannot see either of them.
 *
 *  1. The lessons map padlocks 24 of 25 lessons for a new player, but the
 *     results modal's primary button walked straight past every padlock: after
 *     FAILING lesson-01 it pushed the child into a fully playable lesson-02,
 *     and the same click chains the entire curriculum.
 *  2. The parent report's denominator was hardcoded to 20 while the curriculum
 *     ships 25 lessons, so a child who finished everything showed their parent
 *     "25/20 שיעורים".
 */

const LESSON_01_LINES = [
  'ייי חחח ללל ייי חחח ללל',
  'יח לי חל יל חי ליח',
  'יחל ליח חיל יחל ליח חיל',
  'חי לי יח לח יל חל',
  'ליל חיל יחל חלי ילח',
  'יחי ליל חלל יחי ליל',
]

/**
 * Playwright's `keyboard.type()` sends only an `input` event for characters
 * outside the US layout — every Hebrew letter — so the app's window `keydown`
 * listener never fires and the lesson silently records nothing. Dispatch real
 * key events over CDP instead. (Chromium only; the mobile-safari project is
 * skipped rather than left quietly green.)
 */
async function typeLesson(
  page: import('@playwright/test').Page,
  mode: 'pass' | 'fail',
) {
  // Keystrokes sent before the client has hydrated are dropped, which desyncs
  // the whole sequence and makes the lesson silently never finish. Wait for the
  // lesson to actually be interactive first.
  await expect(page.getByText('שורת הבית - יד ימין')).toBeVisible()
  await page.waitForTimeout(900)
  const cdp = await page.context().newCDPSession(page)
  const key = async (ch: string) => {
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', text: ch, key: ch })
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch })
  }
  let n = 0
  for (const line of LESSON_01_LINES) {
    for (const ch of line) {
      // Every other keystroke is a key that is never correct on lesson-01,
      // which lands accuracy well under the 80% target.
      if (mode === 'fail' && n % 2 === 0) await key(ch === 'ק' ? 'ז' : 'ק')
      await key(ch)
      n++
    }
  }
}

test.describe('the results card cannot promise more than the child earned', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'needs CDP key events for Hebrew input',
  )

  test('failing a lesson does NOT open the next one', async ({ page }) => {
    await page.goto('/lessons/lesson-01')
    await typeLesson(page, 'fail')

    await expect(page.getByText('נסיון טוב! נסו שוב')).toBeVisible()
    // The locked door must not be offered at all.
    await expect(page.getByRole('button', { name: 'השיעור הבא' })).toHaveCount(0)

    await page.getByRole('button', { name: /חזרה למסלול/ }).click()
    await expect(page).toHaveURL(/\/lessons$/)
    expect(page.url()).not.toContain('lesson-02')
  })

  // Counter-control: without this, simply deleting the button would pass the
  // test above while breaking the product for every child who succeeds.
  test('CONTROL: passing a lesson still opens the next one', async ({ page }) => {
    await page.goto('/lessons/lesson-01')
    await typeLesson(page, 'pass')

    await expect(page.getByText('כל הכבוד! עברתם את השיעור!')).toBeVisible()
    await page.getByRole('button', { name: 'השיעור הבא' }).click()
    await expect(page).toHaveURL(/lesson-02/)
  })
})

test('the parent report counts against the real curriculum size', async ({
  page,
}) => {
  await page.goto('/lessons')
  // Ask the app how many lessons it ships rather than hardcoding a number here
  // — that is the very mistake being guarded against.
  const lessonCount = await page.evaluate(
    () => document.querySelectorAll('a[href="#"], a[href^="/lessons/"]').length,
  )
  expect(lessonCount).toBeGreaterThan(20)

  await page.evaluate((n) => {
    const completedLessons: Record<string, unknown> = {}
    for (let i = 1; i <= n; i++) {
      const id = `lesson-${String(i).padStart(2, '0')}`
      completedLessons[id] = {
        lessonId: id,
        bestWpm: 40,
        bestAccuracy: 98,
        attempts: 1,
        completedAt: Date.now(),
      }
    }
    localStorage.setItem(
      'ninja-keyboard-xp',
      JSON.stringify({
        state: { totalXp: 5000, level: 12, streak: 9, completedLessons },
        version: 0,
      }),
    )
  }, lessonCount)

  await page.goto('/parent-report')
  const text = await page.locator('body').innerText()
  const m = text.match(/(\d+)\s*\/\s*(\d+)\s*שיעורים/)
  expect(m, 'parent report should show a lessons fraction').not.toBeNull()
  const [, done, total] = m!.map(Number)
  expect(total).toBe(lessonCount)
  // A parent must never be shown an impossible fraction like "25/20".
  expect(done).toBeLessThanOrEqual(total)
})
