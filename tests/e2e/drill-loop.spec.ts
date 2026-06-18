import { test, expect, type Page } from '@playwright/test'

/**
 * Interactive E2E for the core DRILL → LESSON loop.
 *
 * This exercises the full practice loop end-to-end, not just unit pieces:
 *   1. A kid lands on the weak-key drill (either deep-linked from a lesson that
 *      triggered it, or bootstrapped from their own practice history).
 *   2. They pick weak keys, start the drill, and TYPE the real drill text.
 *   3. On completion the results panel appears, and — when the drill was
 *      reached from a lesson (`?from=lesson-XX`) — a "חזרה לשיעור" CTA closes
 *      the loop back to that lesson.
 *
 * Stability notes (no arbitrary sleeps):
 *  - We seed the persisted practice-history store via addInitScript so weak keys
 *    are present BEFORE the drill page's store rehydrates (same pattern as
 *    lessons-flow.spec.ts — avoids the rehydrate-clobber race).
 *  - We type the drill by repeatedly reading the CURRENT character (the span
 *    carrying the cursor) and dispatching a real `keydown` for exactly that
 *    char. The engine compares `event.key === expected` (engine.ts
 *    processKeystroke) and the TypingArea listens for `keydown` on `window`, so
 *    a dispatched KeyboardEvent is precisely what the app consumes — and it is
 *    layout-independent (no reliance on a physical Hebrew keymap; Playwright's
 *    keyboard.type emits NO keydown for non-ASCII chars, which is why we
 *    dispatch). currentIndex only advances on a correct key, so reading the live
 *    cursor each step keeps us perfectly in sync and we always reach the end.
 *  - The TypingArea renders spaces as NBSP (char code 160) for layout; we map
 *    it back to a real space before dispatching.
 *  - Every wait is on a selector/state, never a fixed timeout.
 */

interface SeedKey {
  char: string
  /** correct / total — keep accuracy < 100 so it ranks as a weak key */
  correct: number
  total: number
}

/**
 * Seed the practice-history store with one finished session whose per-key
 * accuracy makes the given chars rank as "problematic" (total >= 5 is the
 * store's inclusion gate). Written before app code runs.
 */
async function seedWeakKeys(page: Page, keys: SeedKey[]): Promise<void> {
  await page.addInitScript((seedKeys: SeedKey[]) => {
    const keyAccuracy: Record<string, { correct: number; total: number }> = {}
    for (const k of seedKeys) {
      keyAccuracy[k.char] = { correct: k.correct, total: k.total }
    }
    const state = {
      state: {
        results: [
          {
            id: 'seed-session-1',
            textId: 'free',
            wpm: 18,
            accuracy: 72,
            durationMs: 30_000,
            totalKeystrokes: 40,
            correctKeystrokes: 29,
            keyAccuracy,
            completedAt: Date.now(),
            timerDuration: 0,
          },
        ],
      },
      version: 0,
    }
    window.localStorage.setItem(
      'ninja-keyboard-practice-history',
      JSON.stringify(state),
    )
  }, keys)
}

/**
 * Drive the active drill to completion by typing the live cursor character each
 * step. Reads the current char from the cursor-bearing span, normalizes the
 * NBSP the TypingArea uses for spaces, and dispatches a real `keydown`. Stops
 * when the cursor disappears (currentIndex reached the end of the drill text).
 * Bounded by maxSteps to avoid an infinite loop if something regresses.
 */
async function completeActiveDrill(page: Page): Promise<void> {
  await expect(page.getByLabel('טקסט לתרגול')).toBeVisible()

  const maxSteps = 200
  for (let step = 0; step < maxSteps; step++) {
    const done = await page.evaluate(() => {
      const spans = Array.from(
        document.querySelectorAll('[aria-label="טקסט לתרגול"] p > span'),
      ) as HTMLElement[]
      // The current character's span contains the absolutely-positioned cursor.
      const curIdx = spans.findIndex(
        (s) => s.querySelector('span.absolute') !== null,
      )
      if (curIdx === -1) return true // no cursor → reached the end
      const rawCh = spans[curIdx].textContent ?? ''
      // Map NBSP (160) back to a real space; take the first code point.
      const ch =
        Array.from(rawCh).map((c) => (c.charCodeAt(0) === 160 ? ' ' : c))[0] ??
        ''
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ch,
          code: ch === ' ' ? 'Space' : 'KeyX',
          bubbles: true,
        }),
      )
      return false
    })
    if (done) break
  }

  // Completion transitions to the results phase (effect + AnimatePresence).
  await expect(page.getByText('תוצאות התרגיל')).toBeVisible()
}

test.describe('Drill → Lesson loop (interactive)', () => {
  test('bootstraps weak keys from practice history and pre-selects them', async ({
    page,
  }) => {
    await seedWeakKeys(page, [
      { char: 'ק', correct: 3, total: 8 },
      { char: 'ר', correct: 5, total: 9 },
    ])
    await page.goto('/drill')

    // The two seeded weak keys render as selectable badges, pre-selected.
    const keyQ = page.getByRole('button', { name: /מקש ק/ })
    const keyR = page.getByRole('button', { name: /מקש ר/ })
    await expect(keyQ).toBeVisible()
    await expect(keyR).toBeVisible()
    await expect(keyQ).toHaveAttribute('aria-pressed', 'true')
    await expect(keyR).toHaveAttribute('aria-pressed', 'true')

    // Start is enabled because keys are selected.
    const start = page.getByRole('button', { name: /התחל תרגיל/ })
    await expect(start).toBeEnabled()
  })

  test('deep-link from a lesson pre-selects the requested keys and start is enabled', async ({
    page,
  }) => {
    // This is exactly the URL drillHref(keys, lessonId) builds in the lesson
    // results modal ("בוא נתרגל יחד").
    await page.goto('/drill?keys=%D7%A7,%D7%A8&from=lesson-07')

    const start = page.getByRole('button', { name: /התחל תרגיל/ })
    await expect(start).toBeEnabled()

    // Both requested keys are present and selected.
    await expect(page.getByRole('button', { name: /מקש ק/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('button', { name: /מקש ר/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('full drill run from a lesson shows results and the "back to lesson" CTA', async ({
    page,
  }) => {
    await seedWeakKeys(page, [
      { char: 'ק', correct: 3, total: 8 },
      { char: 'ר', correct: 4, total: 9 },
    ])
    // Reached from lesson-05 → loop-closure CTA must appear in results.
    await page.goto('/drill?keys=%D7%A7,%D7%A8&from=lesson-05')

    const start = page.getByRole('button', { name: /התחל תרגיל/ })
    await expect(start).toBeEnabled()
    await start.click()

    await completeActiveDrill(page)

    // The loop-closure CTA points back to the originating lesson.
    const returnCta = page.getByTestId('drill-return-to-lesson')
    await expect(returnCta).toBeVisible()
    await expect(returnCta).toHaveAttribute('href', '/lessons/lesson-05')

    // Closing the loop navigates back to the originating lesson.
    await returnCta.click()
    await expect(page).toHaveURL('/lessons/lesson-05')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('drill run WITHOUT a lesson origin shows results but no return CTA', async ({
    page,
  }) => {
    await seedWeakKeys(page, [{ char: 'ק', correct: 3, total: 8 }])
    await page.goto('/drill')

    const start = page.getByRole('button', { name: /התחל תרגיל/ })
    await expect(start).toBeEnabled()
    await start.click()

    await completeActiveDrill(page)

    // No lesson origin → no loop-closure CTA.
    await expect(page.getByTestId('drill-return-to-lesson')).toHaveCount(0)
    // "תרגל שוב" lets the kid run another drill.
    await expect(page.getByRole('button', { name: /תרגל שוב/ })).toBeVisible()
  })

  test('the drill page is RTL Hebrew with exactly one h1', async ({ page }) => {
    await page.goto('/drill')
    // Wait for the page heading first (the route is Suspense-wrapped; its
    // fallback briefly renders its own RTL <main>, so assert the real content
    // is present before counting to avoid a hydration/compile race under load).
    await expect(
      page.getByRole('heading', { name: 'תרגיל מקשים חלשים' }),
    ).toBeVisible()
    // The document root carries the RTL/Hebrew contract (single, stable).
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'he')
    // Exactly one h1 — poll so we never read mid-hydration (Suspense fallback
    // ↔ content swap), which is the source of the rare count flake.
    await expect.poll(() => page.locator('h1').count()).toBe(1)
  })
})
