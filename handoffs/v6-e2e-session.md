# V6 E2E Handoff — interactive Playwright for the core loops

Autonomous session. Project live at https://ninja-keyboard-nine.vercel.app

## Goal (from V6 backlog)
"Drive the full drill→lesson loop + a shop purchase in an e2e (Playwright)
test — unit-covered now, but no live interactive e2e yet." Added the two
missing interactive E2E suites for the core loops.

## Baseline (verified at session start)
- branch master, tsc 0, unit tests 1358 (81 files), Playwright 1.58.2.
- Existing e2e: 14 spec files under tests/e2e (lessons/settings/battle/etc.),
  no interactive coverage for drill-completion or shop-purchase.

## What was added (2 new specs, 12 tests)

### tests/e2e/drill-loop.spec.ts (5 tests) — DRILL → LESSON loop
- bootstraps weak keys from seeded practice-history and pre-selects them
- deep-link `/drill?keys=…&from=lesson-XX` pre-selects requested keys, start enabled
- **full interactive run**: types the real drill text to completion → results
  panel → "חזרה לשיעור" CTA → navigates back to the originating lesson
- run without a lesson origin → results but NO return CTA (+ "תרגל שוב")
- drill page RTL/Hebrew + exactly one h1

### tests/e2e/shop-buy-equip.spec.ts (7 tests) — SHOP buy → equip → applied
- spendable coin balance derived from seeded progress (45 stars → 450 coins)
- buy ACCENT → auto-equips → profile avatar ring recolored (asserts the rgb)
- buy TITLE → equips → appears under the profile name
- buy FRAME → equips → avatar ring decoration (box-shadow) applied
- owned-but-unequipped cosmetic re-equips from the shop; previous loses active
- too-expensive cosmetic is gated (buy disabled) on a small balance
- shop page RTL/Hebrew + one h1 + all three category sections

## Key techniques (so the next person can extend safely)

1. **Typing Hebrew in Playwright**: `keyboard.type()` emits NO keydown for
   non-ASCII chars. The engine compares `event.key === expected` and the
   TypingArea listens on `window` keydown, so we dispatch a real
   `KeyboardEvent('keydown',{key})` per char. We read the CURRENT cursor span
   each step (the span containing `span.absolute`), map NBSP(160)→space, and
   dispatch — staying in sync because currentIndex only advances on a correct
   key. See `completeActiveDrill()`.
2. **Seeding state before hydration**: `addInitScript` writes localStorage
   before the zustand persist store rehydrates (same pattern as
   lessons-flow.spec.ts). Coins are DERIVED from stars, so we seed xp-store
   with completed lessons (bestWpm 40 / bestAccuracy 100 → 3 stars each).
3. **addInitScript runs on EVERY navigation** → it must NOT clear the settings
   store, or a purchase made before navigating to /profile gets wiped. Settings
   is cleared once per test in beforeEach (goto+evaluate+reload) instead.
4. **Profile renders 2 avatar elements** (responsive) → assert on the UNION of
   all `data-testid=profile-avatar` styles via `expectSomeAvatarStyleContains`.
5. **Suspense race**: `/drill` is Suspense-wrapped; its fallback briefly renders
   its own RTL `<main>`. Assert on the page heading + the single `<html dir/lang>`
   (stable) and poll the h1 count — never a generic `main` selector mid-swap.

## Gates (all green)
- tsc 0 · unit 1358 (unchanged) · build exit 0.
- New specs: 48/48 passed under `--workers=3 --repeat-each=4` (zero flake).
- Full chromium e2e: 215/216 — the 1 failure is a PRE-EXISTING load-only flake
  in battle-flow.spec.ts:87 (passes 3/3 in isolation), not from this work.

## No product bugs found
The drill and shop loops behaved correctly end-to-end; no additive fixes were
needed. The work was purely additive test coverage.

## Note — Ponytail
Skill not installed in this project (`.claude/skills/ponytail` absent) → not
invoked, not installed globally. Worked in its spirit (minimal, no product
changes, reused existing test patterns) while definition-of-done governed.
