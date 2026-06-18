import { test, expect, type Page } from '@playwright/test'

/**
 * Interactive E2E for the core SHOP loop: BUY → EQUIP → APPLIED.
 *
 * Covers all three cosmetic categories end-to-end:
 *   - accent (profile color)  → applied to the avatar ring color
 *   - title  (ninja title)    → shown under the name on the profile card
 *   - frame  (avatar ring)    → applied as the avatar ring decoration
 *
 * The coin economy is DERIVED from stars (coins = floor(stars) * 10), and stars
 * are derived from each lesson's best result vs its target (see stars.ts /
 * use-coin-balance.ts). So to give the kid spendable coins we seed the persisted
 * xp-store with completed lessons whose best results clear the 3-star bar
 * (bestWpm 40 / bestAccuracy 100 beats every lesson target → avg >= 1.3 → 3
 * stars each). 15 lessons * 3 stars = 45 stars = 450 coins — comfortably enough
 * to buy across all three categories.
 *
 * Stability notes (no arbitrary sleeps):
 *  - addInitScript seeds localStorage before the store rehydrates (same proven
 *    pattern as lessons-flow.spec.ts).
 *  - Every assertion waits on a selector/attribute/state, never a fixed timeout.
 *  - We assert on the live equipped state via the profile card's data-testid
 *    hooks and the rendered inline styles, proving the cosmetic is actually
 *    APPLIED (not merely "owned").
 */

const COMPLETED_LESSON_IDS = Array.from(
  { length: 15 },
  (_, i) => `lesson-${String(i + 1).padStart(2, '0')}`,
)

/**
 * Seed the xp-store (idempotent) so coins are derivable. NOTE: addInitScript
 * runs on EVERY navigation, so it must NOT clear the settings store — doing so
 * would wipe a purchase made earlier in the test when we navigate to /profile.
 * The settings store is cleared once per test in beforeEach instead.
 */
async function seedCoinsViaLessons(
  page: Page,
  lessonIds: string[] = COMPLETED_LESSON_IDS,
): Promise<void> {
  await page.addInitScript((ids: string[]) => {
    const completedLessons: Record<string, unknown> = {}
    for (const id of ids) {
      completedLessons[id] = {
        lessonId: id,
        bestWpm: 40,
        bestAccuracy: 100,
        completedAt: Date.now(),
        attempts: 1,
      }
    }
    const xpState = {
      state: {
        totalXp: 1500,
        level: 8,
        streak: 3,
        lastPracticeDate: new Date().toISOString().split('T')[0],
        completedLessons,
      },
      version: 0,
    }
    window.localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
  }, lessonIds)
}

/** rgb() string for a hex color, matching how the browser serializes styles. */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * The profile may render more than one avatar element (responsive variants),
 * so we assert on the union of all their inline styles rather than a single
 * (possibly hidden) one. Waits (auto-retries) until at least one matches.
 */
async function expectSomeAvatarStyleContains(
  page: Page,
  needle: string,
): Promise<void> {
  const avatars = page.getByTestId('profile-avatar')
  await expect(avatars.first()).toBeAttached()
  await expect
    .poll(async () => {
      const styles = await avatars.evaluateAll((els) =>
        els.map((el) => el.getAttribute('style') ?? ''),
      )
      return styles.some((s) => s.includes(needle))
    })
    .toBe(true)
}

test.describe('Shop buy → equip → applied (interactive)', () => {
  test.beforeEach(async ({ page }) => {
    await seedCoinsViaLessons(page)
    // Clear any persisted cosmetics ONCE so each test starts from a clean
    // slate (no owned/equipped carryover). Done here rather than in
    // addInitScript so it does not re-wipe purchases on later navigations.
    await page.goto('/shop')
    await page.evaluate(() =>
      window.localStorage.removeItem('ninja-keyboard-settings'),
    )
    await page.reload()
  })

  test('the kid has a spendable coin balance derived from progress', async ({
    page,
  }) => {
    await page.goto('/shop')
    const balance = page.getByTestId('coin-balance')
    await expect(balance).toBeVisible()
    // 45 stars * 10 = 450 coins.
    await expect(balance).toContainText('450')
  })

  test('buy an ACCENT, it auto-equips, and recolors the profile avatar ring', async ({
    page,
  }) => {
    await page.goto('/shop')

    const tealCard = page.getByTestId('cosmetic-accent-teal')
    await expect(tealCard).toBeVisible()

    // Buy it (50 coins). The buy button is labelled with the price.
    await tealCard.getByRole('button', { name: /קנה את טורקיז/ }).click()

    // Flash confirms the purchase, and the card flips to "פעיל" (auto-equipped).
    await expect(page.getByTestId('shop-flash')).toContainText('קנית')
    await expect(tealCard.getByText('פעיל')).toBeVisible()

    // Navigate to the profile and verify the avatar ring uses the teal color.
    // accent-teal = #00B894. The avatar's boxShadow/background are tinted by it.
    await page.goto('/profile')
    await expectSomeAvatarStyleContains(page, hexToRgb('#00B894'))
  })

  test('buy a TITLE, equip it, and it appears under the profile name', async ({
    page,
  }) => {
    await page.goto('/shop')

    const titleCard = page.getByTestId('cosmetic-title-fast-fingers')
    await expect(titleCard).toBeVisible()

    // Buy "אצבעות ברק" (40 coins) — purchaseCosmetic auto-equips into the title slot.
    await titleCard.getByRole('button', { name: /קנה את אצבעות ברק/ }).click()
    await expect(titleCard.getByText('פעיל')).toBeVisible()

    // Profile shows the equipped title under the name.
    await page.goto('/profile')
    const title = page.getByTestId('profile-title')
    await expect(title).toBeVisible()
    await expect(title).toContainText('אצבעות ברק')
  })

  test('buy a FRAME, equip it, and it decorates the profile avatar ring', async ({
    page,
  }) => {
    await page.goto('/shop')

    const frameCard = page.getByTestId('cosmetic-frame-glow')
    await expect(frameCard).toBeVisible()

    // Buy "הילה זוהרת" (160 coins) — auto-equips into the frame slot.
    await frameCard.getByRole('button', { name: /קנה את הילה זוהרת/ }).click()
    await expect(frameCard.getByText('פעיל')).toBeVisible()

    // The glow frame adds a box-shadow ring to the avatar. Verify the avatar
    // style includes a box-shadow (the frame decoration applied over the base ring).
    await page.goto('/profile')
    await expectSomeAvatarStyleContains(page, 'box-shadow')
  })

  test('owned-but-unequipped cosmetic can be re-equipped from the shop', async ({
    page,
  }) => {
    await page.goto('/shop')

    // Buy two accents; the second auto-equips, leaving the first owned-but-unequipped.
    await page
      .getByTestId('cosmetic-accent-teal')
      .getByRole('button', { name: /קנה את טורקיז/ })
      .click()
    await expect(
      page.getByTestId('cosmetic-accent-teal').getByText('פעיל'),
    ).toBeVisible()

    await page
      .getByTestId('cosmetic-accent-rose')
      .getByRole('button', { name: /קנה את ורוד אש/ })
      .click()
    await expect(
      page.getByTestId('cosmetic-accent-rose').getByText('פעיל'),
    ).toBeVisible()

    // The teal one is now owned but not equipped → shows an "הפעל" (equip) button.
    const tealCard = page.getByTestId('cosmetic-accent-teal')
    const equipBtn = tealCard.getByRole('button', { name: /הפעל טורקיז/ })
    await expect(equipBtn).toBeVisible()
    await equipBtn.click()

    // Re-equipping teal flips it back to "פעיל" and rose loses the active state.
    await expect(tealCard.getByText('פעיל')).toBeVisible()
    await expect(
      page.getByTestId('cosmetic-accent-rose').getByText('פעיל'),
    ).toHaveCount(0)

    // And the profile avatar now reflects teal.
    await page.goto('/profile')
    await expectSomeAvatarStyleContains(page, hexToRgb('#00B894'))
  })

  test('a too-expensive cosmetic is gated and not purchasable', async ({
    page,
  }) => {
    // Seed only a tiny balance: 1 completed lesson → 3 stars → 30 coins.
    await page.addInitScript(() => {
      const xpState = {
        state: {
          totalXp: 50,
          level: 1,
          streak: 1,
          lastPracticeDate: new Date().toISOString().split('T')[0],
          completedLessons: {
            'lesson-01': {
              lessonId: 'lesson-01',
              bestWpm: 40,
              bestAccuracy: 100,
              completedAt: Date.now(),
              attempts: 1,
            },
          },
        },
        version: 0,
      }
      window.localStorage.setItem('ninja-keyboard-xp', JSON.stringify(xpState))
      window.localStorage.removeItem('ninja-keyboard-settings')
    })

    await page.goto('/shop')
    await expect(page.getByTestId('coin-balance')).toContainText('30')

    // accent-cosmic costs 250 — unaffordable on 30 coins → buy button disabled.
    const cosmicCard = page.getByTestId('cosmetic-accent-cosmic')
    const buyBtn = cosmicCard.getByRole('button', { name: /קנה את סגול קוסמי/ })
    await expect(buyBtn).toBeDisabled()
  })

  test('the shop page is RTL Hebrew with exactly one h1 and all three sections', async ({
    page,
  }) => {
    await page.goto('/shop')
    await expect(page.locator('[dir="rtl"][lang="he"]').first()).toBeVisible()
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(
      page.getByRole('heading', { name: 'חנות הנינג׳ה' }),
    ).toBeVisible()
    await expect(page.getByText('צבעי פרופיל')).toBeVisible()
    await expect(page.getByText('תוארי נינ׳ה')).toBeVisible()
    await expect(page.getByText('מסגרות אווטאר')).toBeVisible()
  })
})
