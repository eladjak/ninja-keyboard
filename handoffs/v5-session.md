# V5 Deep-Iteration Handoff

Autonomous overnight session (team-build protocol). Project live at https://ninja-keyboard-nine.vercel.app

## Baseline (verified at session start, 2026-06-14)
- branch: master, clean tree
- tsc: 0 errors
- tests: **1307 passed (77 files)**
- Character canon: Ki / Mika / Sensei Zen / rivals. NOT "Box" (agent-network char, not in this game).

## V5 backlog (from PROGRESS.md V4 section)
1. Weak-key drill → lesson loop closure: carry `from=lesson-XX` through `/drill?keys=…&from=lesson-XX`; on drill completion offer "חזרה לשיעור".
2. Coin balance in header + accent applied in header/XP bar.
3. More cosmetic categories for the coin shop (cosmetic-only, no payments).
4. QA layer: journey pass, text-fit/RTL pass, cross-device pass. Fix + test.
5. Other high-value free v5 items.

## Gates per block
tsc 0 → tests green (≥1307) → build → commit → push master → agent-browser verify live → next.

## Progress log

### Block 1 — Drill→lesson loop closure: SHIPPED (commit e27175d)
- `drillHref(keys, from?)` carries `?from=lesson-XX` (validated, path-traversal-safe).
- New lib helpers: `isLessonId`, `parseFromLesson`, `lessonHref` (+ tests, 15→21).
- Lesson results modal passes `from={lesson.id}`; drill results panel shows a green
  "חזרה לשיעור — בוא ננסה שוב!" CTA when `from` is present.

### Block 2 — Coin balance + accent in header: SHIPPED (commit 2d308e1)
- New shared `useCoinBalance()` hook (totalStars/earned/balance/equippedAccent/accentColor).
  Shop refactored to use it → single source of truth (no header/shop drift).
- Header: live coin badge (→ /shop) on desktop+mobile; XP badge + top gradient line
  tinted by the equipped accent color.
- New lib: `accentColorFor`, `DEFAULT_ACCENT_COLOR` (+ tests).

### Block 3 — More cosmetic categories: SHIPPED (commit 2d308e1)
- New 'title' cosmetic category — 6 Hebrew ninja titles (40–220 coins), own equip slot
  (`equippedTitle`/`equipTitle`), `DEFAULT_TITLE_ID = title-none`.
- `purchaseCosmetic` is now category-aware (auto-equips into accent OR title slot).
- Shop renders two sections (צבעי פרופיל / תוארי נינ׳ה). Profile card shows the
  equipped title under the name. New lib: `cosmeticsByCategory`, `equippedTitleFor`.
- Tests: 1313 → 1324 (+11 across blocks 1-3).

### Block 4 — QA layer: SHIPPED (1 fix: commit a383f77)
Ran against live prod (ninja-keyboard-nine.vercel.app) with agent-browser.
- **Journey pass:** all 18 routes return 200; each has exactly 1 `<h1>`, `dir=rtl`, `lang=he`.
- **Text-fit / RTL pass (375px mobile):** found `/home` overflowed 42px horizontally.
  Root cause: app-shell `flex-1` content column had default `min-width:auto`, so wide
  dashboard content blew past the viewport. **FIXED** with `min-w-0` on the column.
  Re-verified: every route 0/negative overflow after fix.
- **Cross-device pass:** 360 / 375 / 414 / 768 — `/home` clean at all widths post-fix.
- **False positives correctly diagnosed (no change needed):**
  - `/home` & `/battle` intermittent overflow readings were measurement/animation
    artifacts (viewport-reset race + battle entrance transforms). Stable re-measures
    and a 700ms settle delay confirmed 0 overflow.
- **Live behavior verified:** coin badges in header (desktop+mobile, link to /shop,
  aria-labelled), accent-tinted gradient line, shop two-section layout
  (🎨 8 accents / 🏷️ 6 titles), drill deep-link `?keys=א,ב&from=lesson-07` pre-selects
  both keys with start enabled.

## Final state
- tsc 0 · tests **1324** (+17 over 1307 baseline) · build clean · 4 commits pushed to master.
- All deploys Ready, live-verified. No OPEN-QUESTIONS raised — all blocks were
  unambiguous + free-tool + within character canon.

## v6 backlog (carried forward, free + high-value)
- Coin-collect SFX distinct from level-complete; celebratory voice line on cert modal
  (needs free TTS; ElevenLabs/Suno are paid → deferred).
- Avatar-frame cosmetic category (decorative ring styles) — 3rd category, same pattern.
- Real backend leaderboard + certificate persistence (Supabase env not set in prod).
- Drive the full drill→lesson loop + a shop purchase in an e2e (Playwright) test —
  unit-covered now, but no live interactive e2e yet.
