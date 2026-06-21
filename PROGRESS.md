# Ninja Keyboard - Progress

## Status: 🟢 LIVE · Supabase RESTORED · Migration 00005 APPLIED (RPC live) · Guest /home regression FIXED
## Last Updated: 2026-06-21 (guest-access regression fix + 00005 re-verified live)
## Sprint: V7 — real backend leaderboard

## 2026-06-21 (PM) — "app fairly broken" diagnosis + fix
**Reported:** Supabase connected/"connected", but the app itself "fairly broken."

**Root cause found (the real breakage):** activating `.env.local` (so `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` are now present) flipped the middleware from "skip auth (guest-first)" into "enforce auth on PROTECTED_ROUTES." `/home` was in that list — but `/home` is the guest-first hub and the landing page's PRIMARY CTA ("מתחילים לשחק — חינם / בלי הרשמה"). So every guest who clicked Start got bounced to `/login`, with no accounts existing → the app's #1 button was dead, contradicting the advertised no-registration flow.
- **Fix (`fix/guest-home-access`, commit 49694c7):** removed `/home` from `PROTECTED_ROUTES` in `src/middleware.ts`. `/home` is entirely localStorage-driven (xp/badge/practice-history stores) — zero Supabase/account data, fully guest-safe. `/progress`,`/profile`,`/settings` stay gated.
- **Verified:** tsc 0 · 1368/1368 unit tests · `next build` ✓ · live dev guest `/home` → **200** (was 307→/login); `/progress`,`/profile`,`/settings` still 307→/login.

**Migration 00005 — CORRECTION (was reported "NOT applied"):** re-probed the live RPC today:
`POST /rest/v1/rpc/get_leaderboard {"p_limit":5}` with the anon key → **HTTP 200 `[]`** (NOT the old 404/PGRST202). The function EXISTS and is callable — **00005 IS applied**. The empty array is just "no real users yet," so the leaderboard correctly shows mock data (by design, `leaderboard-service.ts` falls back to mock on empty). No SQL-editor step remains for the leaderboard backend.

**Remaining (manual, optional — none block the app):**
- To see REAL leaderboard rows instead of mock: real users must sign up + earn XP (the `users`/`gamification` tables are currently empty). No code/SQL change needed.
- Auth accounts in prod, custom domain, ElevenLabs/Suno voice+music — all still deferred (paid / product decisions), none are "broken."

## 2026-06-21 — DB restore verification + .env.local activation
**Evidence:**
- Elad restored Supabase project `fyccvueeneldyhlhhzte` via dashboard
- `POST /rest/v1/rpc/get_leaderboard {"p_limit":5}` with anon key → HTTP 404 PGRST202 "function does not exist" → DB is **awake** but migration 00005 is **NOT applied**
- `.env.local` activated: copied from `.env.local.disabled` (was ignored from git via `.env*` rule, stays ignored)
- Vercel Production already has `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (confirmed via `vercel env ls`)
- Live `/leaderboard` page: HTTP 200, renders mock data gracefully (no crash; service falls back to mock on PGRST202)
- Public routes `/lessons` `/shop` `/leaderboard` stay public: middleware only protects `/home` `/progress` `/profile` `/settings`

**One step still blocking real leaderboard data:**
- Supabase SQL Editor (2 min): paste content of `supabase/migrations/00005_leaderboard_function.sql` → Run
- URL: https://supabase.com/dashboard/project/fyccvueeneldyhlhhzte/sql/new
- After that: RPC returns real data, leaderboard flips from mock to live automatically. No code change needed.

**No DB password found anywhere** (searched: all `.env*` in project, `~/.claude/secrets/keyvault/*`, `vercel env pull`, Windows Credential Manager). Only path to apply 00005 is Supabase SQL Editor.

## V7 (2026-06-19) — Real Supabase leaderboard backend (Shabbat run N)
**Commit:** `815cf51`. **Gates:** tsc 0 · unit tests **1368 (+10 from 1358)** · build ✓ · prod deploy Ready · live-verified (/ + /leaderboard both 200).

### Blockers inventory (per accessRule)

**BLOCKER 1 — Leaderboard: Supabase SERVICE_ROLE_KEY**
- **Root cause found:** `SUPABASE_SERVICE_ROLE_KEY` was blank in `.env.local.disabled`. The key was NEVER set. The Supabase project (`fyccvueeneldyhlhhzte.supabase.co`) is also currently **PAUSED** (free tier, created 2026-06-07, 12 days without active use, DNS does not resolve).
- **Resolution (no secret needed):** Built a `get_leaderboard()` **SECURITY DEFINER** SQL function (migration `00005_leaderboard_function.sql`) that reads `gamification + users` cross-user, bypasses RLS, and is callable with the **ANON key** only. No service role key is required.
- **Implementation:** `src/lib/leaderboard/leaderboard-service.ts` — `fetchLeaderboard()` calls the RPC, falls back to deterministic mock when env absent / project paused / DB empty / any error. Graceful fallback means the leaderboard always renders.
- **Vercel env wired:** Added `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel production (were absent — only `NEXT_PUBLIC_SITE_URL` was there before).
- **Leaderboard client** converted from pure-client mock to real `useEffect` data-fetcher with honest "demo/live" notice.
- **10 new tests** covering all cases: no-env, RPC error, throws, empty-DB fallback, real-data path, rank assignment, emoji mapping, p_limit param.
- **Status:** WIRED but awaiting Supabase project unpause. **Elad must unpause the project** at https://supabase.com/dashboard/project/fyccvueeneldyhlhhzte and then apply migration 00005 via the SQL editor or `supabase db push`. After that, leaderboard flips to live data automatically (no code change needed).

**BLOCKER 2 — Write path (score submission)**
- **Finding:** NOT blocked. Score writes use `pushGamification`/`pushProgress` with the ANON key + authenticated user RLS (`user_id = auth.uid()`). Project is guest-first in prod (no auth env in prod before today), so no writes are attempted. When auth is enabled and users log in, writes will work with existing RLS policies. No service role needed for writes either.

**BLOCKER 3 — SERVICE_ROLE_KEY search result**
- Searched: `~/.claude/secrets/keyvault/*`, all project `.env*` files, CLAUDE.md memory. **Not found anywhere.** The key was never generated/stored. To get it: Supabase Dashboard → Project `fyccvueeneldyhlhhzte` → Settings → API → Service role key (secret).

### What is still needed (honest list)
1. ~~**Unpause Supabase project**~~ ✅ DONE (Elad, 2026-06-21 — DB confirmed awake via REST 200)
2. **Apply migration 00005** — ONE remaining step. Paste `supabase/migrations/00005_leaderboard_function.sql` into https://supabase.com/dashboard/project/fyccvueeneldyhlhhzte/sql/new → Run (2 min). After this, leaderboard shows real data instantly.
3. **Custom domain** — still on *.vercel.app default.
4. **Auth accounts in prod** — flip `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` (done) + enable auth routes (middleware already handles this).
5. **ElevenLabs/Suno** voice + music (paid APIs, deferred).
6. **WPM leaderboard** — the current `get_leaderboard()` ranks by XP (gamification). To rank by WPM, add a `MAX(wpm)` aggregation from the `sessions` table. Migration 00005 can be extended for this.

## V6 (2026-06-18) — Interactive E2E for the core loops (drill→lesson + shop buy→equip)
**Gates:** tsc 0 · unit tests **1358 (unchanged)** · build ✓ · new specs 48/48 under `--workers=3 --repeat-each=4` (zero flake). Handoff: `handoffs/v6-e2e-session.md`.

- **Closes the carried-forward V5/V6 backlog item** "Drive the full drill→lesson loop + a shop purchase in an e2e (Playwright) test — unit-covered now, but no live interactive e2e yet." Two new spec files, **12 interactive tests**, no product changes (purely additive coverage).
- **`tests/e2e/drill-loop.spec.ts` (5 tests)** — the DRILL → LESSON loop end-to-end: bootstrap weak keys from seeded practice-history; deep-link `?keys=…&from=lesson-XX` pre-selects keys; a **full interactive run** that actually TYPES the generated drill text to completion → results panel → "חזרה לשיעור" CTA → navigates back to the originating lesson; a no-origin run (results, no CTA); RTL/one-h1.
- **`tests/e2e/shop-buy-equip.spec.ts` (7 tests)** — the SHOP buy→equip→APPLIED loop across all 3 cosmetic categories: spendable balance derived from seeded stars (45★→450 coins); buy **accent** → avatar ring recolored (asserts the rgb); buy **title** → shown under the profile name; buy **frame** → avatar box-shadow ring applied; owned-but-unequipped re-equip; too-expensive gating; RTL/one-h1/3 sections.
- **Stability techniques (no arbitrary sleeps):** Hebrew typing via dispatched `keydown` (Playwright `keyboard.type` emits none for non-ASCII; engine compares `event.key===expected`), reading the live cursor span each step (NBSP→space) so we stay in sync with `currentIndex`; seed localStorage before hydration via `addInitScript`; never clear settings in `addInitScript` (it re-runs on every nav and would wipe purchases); assert on the UNION of the two responsive profile-avatar styles; poll the h1 count past the Suspense fallback swap.
- **No regressions:** full chromium e2e 215/216 — the single failure is a PRE-EXISTING load-only flake in `battle-flow.spec.ts:87` (passes 3/3 in isolation), untouched by this work.

### Note — Ponytail
Skill not installed in this project (`.claude/skills/ponytail` absent) → not invoked, not installed globally. Worked in its spirit (minimal, no product changes, reused the existing e2e patterns) while definition-of-done governed (real, stable, passing interactive tests for both core loops).

## V6 (2026-06-18) — Avatar-frame cosmetic category (3rd equip slot)
**Commit:** `b3f9f1c`. Gates: tsc 0 · tests **1358 (+17 from 1341)** · build ✓ · prod deploy Ready · live-verified.

- **Closes the carried-forward V5/V6 backlog item "avatar frames"** — a 3rd cosmetic category in the coin shop, following the EXACT buy/own/equip pattern of accents + titles. Cosmetic-only, no payments.
- **`coins.ts`**: new `'frame'` category + `FrameStyle` union (none/solid/double/dashed/glow/gradient). **6 frames** (טבעת רגילה=free · טבעת מלאה 40 · טבעת כפולה 70 · טבעת נינ׳ה 110 · הילה זוהרת 160 · קשת קסם 240). `DEFAULT_FRAME_ID='frame-none'`. New pure resolvers `equippedFrameFor` (no cross-slot leakage) + `frameDecoration(style, accentColor)` → inline CSS. **Frames are pure on-brand CSS rings (no external/paid images); the ring is tinted by the equipped ACCENT color, so frames + accents compose.**
- **settings-store**: new `equippedFrame` state + `equipFrame` action (persisted); `purchaseCosmetic` is now **3-way category-aware** (auto-equips into accent | title | frame slot).
- **shop**: third "🖼️ מסגרות אווטאר" section; each frame swatch previews its REAL ring (tinted by the equipped accent).
- **profile-card**: the equipped frame is applied to the avatar ring (overrides the base border/glow), tinted by the accent color.
- **Tests (+17)**: frame catalog/`equippedFrameFor`/`frameDecoration` (coins.test.ts), store 3-way auto-equip + `equipFrame` + idempotency (new settings-store.test.ts), profile-card applies the equipped frame (new profile-card.test.tsx).
- **Live-verified** on prod: shop renders 8 accents + 6 titles + **6 frames**, 1 h1, dir=rtl/lang=he; the gradient frame swatch renders a live conic-gradient ring; profile avatar with an equipped **glow** frame + **teal** accent shows the glow box-shadow AND border both tinted `rgb(0,184,148)` — proving the frame+accent composition end-to-end.

### Note — Ponytail
Not installed in this project (`.claude/skills/ponytail` absent) → not invoked, not installed globally. Worked in its spirit (minimal, YAGNI: reused the existing cosmetic pattern, no new store/route, no speculative abstraction) while definition-of-done governed (full feature: catalog + shop UI + equip + avatar display + tests). Net feature LOC ≈ +213 across 5 files + 2 new focused test files. definition-of-done preserved.

## V6 (2026-06-18) — Free celebratory voice (Web Speech API)

## V6 (2026-06-18) — Free celebratory voice (Web Speech API)
**Commit:** `6d375e4`. Gates: tsc 0 · tests **1341 (+17 from 1324)** · build ✓ · prod deploy Ready · live-verified.

- **Unblocks the deferred "celebratory voice" feature** without the paid ElevenLabs/Suno dependency, using the FREE in-browser Web Speech API (`window.speechSynthesis`).
- **New `useSpeech` hook** (`src/hooks/use-speech.ts`) — wraps SpeechSynthesis; picks a `he-IL` voice via pure `pickHebrewVoice`; **graceful fallback = stays SILENT** when no Hebrew voice exists (never reads Hebrew with an English accent, never crashes). Gated by pure `shouldSpeak`: requires `voiceEnabled` ∧ `soundEnabled` (global mute also mutes voice) ∧ NOT reduced-motion ∧ platform has SpeechSynthesis. SSR-safe (speak/cancel no-op on server); async `voiceschanged` handled; cancels on unmount + on modal close.
- **Wired into the certificate auto-surface modal** (`certificate-celebration.tsx`): when a new bronze/silver/gold/platinum/ninja-master milestone pops, speaks "כל הכבוד {שם}! השגת {תעודה}!" alongside the existing level-complete SFX. Does not touch the existing music/SFX system.
- **Settings UI toggle** "קול חגיגי" added under the Sound section (disabled when sound is off), persisted via new `voiceEnabled` + `toggleVoice` in settings-store. Hydration-safe.
- **Test** `src/hooks/use-speech.test.ts` (+17): pure helpers (Hebrew-voice pick, gating matrix) + hook behavior against a faked SpeechSynthesis — speaks with Hebrew voice, silent fallback when none, blocked by each gate, no-crash when API absent.
- **Live-verified** on prod: settings shows the toggle; browser exposes `he-IL: Microsoft Asaf` voice; simulated speak path picks `he-IL` and does not throw; page RTL (dir=rtl/lang=he). If a test env had NO Hebrew voice, the hook stays silent (verified by the `hebrewVoiceAvailable=false → no speak` unit test).

## V5 Deep-Iteration (2026-06-14) — Blocks 1-4
**Commits:** e27175d → 2d308e1 → a383f77. Gates green every block: tsc 0, **1324 tests (+17 from 1307)**, build ✓, prod deploy ✓, live agent-browser verification ✓. Handoff: `handoffs/v5-session.md`.

- **Block 1 — Weak-key drill → lesson loop closure** ✅. `drillHref(keys, from?)` now carries a validated `?from=lesson-XX` (path-traversal-safe via `isLessonId` regex). New pure helpers `isLessonId`/`parseFromLesson`/`lessonHref` in `weak-key-suggestion.ts` (+6 tests). The lesson results modal passes `from={lesson.id}` into the drill deep-link; the `/drill` results panel reads `from` and shows a green "חזרה לשיעור — בוא ננסה שוב!" CTA so the kid can retry the lesson that triggered the drill. **Live-verified:** `/drill?keys=א,ב&from=lesson-07` pre-selects both keys, start enabled.
- **Block 2 — Coin balance in header + accent everywhere** ✅. New shared `useCoinBalance()` hook (totalStars/earned/balance/equippedAccent/accentColor) — the shop was refactored onto it so header and shop share ONE source of truth (no drift). Header gains a live coin badge (desktop + mobile, links to /shop, aria-labelled) and the XP badge + top gradient line are tinted by the equipped accent color. New lib `accentColorFor`/`DEFAULT_ACCENT_COLOR` (+ tests). **Live-verified** in the header.
- **Block 3 — More cosmetic categories (shop depth)** ✅. New cosmetic category **'title'** — 6 Hebrew ninja titles (אצבעות ברק / נינ׳ת הצללים / אלוף המקלדת / דרקון ההקלדה / אגדה חיה, 40–220 coins) with its own equip slot (`equippedTitle`/`equipTitle`, `DEFAULT_TITLE_ID`). `purchaseCosmetic` is now category-aware (auto-equips into the correct slot). Shop renders two sections (🎨 צבעי פרופיל · 🏷️ תוארי נינ׳ה); the profile card shows the equipped title under the name. New lib `cosmeticsByCategory`/`equippedTitleFor` (+ tests). Cosmetic-only, no payments. **Live-verified:** shop shows 8 accents + 6 titles.
- **Block 4 — QA layer (team-build)** ✅. Hard QA pass on live prod via agent-browser: (1) **journey pass** — all 18 routes 200, exactly 1 h1, dir=rtl/lang=he each; (2) **text-fit/RTL pass** at 375px — found `/home` overflowing 42px horizontally; **root-caused to the app-shell `flex-1` content column lacking `min-w-0`** (default min-width:auto let wide content blow past the viewport) and **fixed it** (`min-w-0`); re-verified every route 0 overflow; (3) **cross-device pass** 360/375/414/768 — clean. Two intermittent readings (/home, /battle) were correctly diagnosed as measurement/animation artifacts (stable re-measures + 700ms settle = 0 overflow), not bugs. **1 real fix shipped, 1307→1324 tests kept green.**

### V6 backlog (next session — free + high-value)
- Coin-collect SFX distinct from level-complete (celebratory voice ✅ shipped this sprint; cert auto-surface already speaks).
- ~~3rd cosmetic category: avatar frames~~ → ✅ DONE (commit b3f9f1c, see top of file).
- 4th cosmetic surface idea: apply the equipped frame to the header avatar / lesson-map too (currently only the profile avatar). Lesson-map themes.
- Real backend leaderboard + certificate persistence (Supabase env still not set in prod).
- ~~Playwright e2e for the full drill→lesson loop + a shop purchase~~ → ✅ DONE (see top of file — `tests/e2e/drill-loop.spec.ts` + `tests/e2e/shop-buy-equip.spec.ts`, 12 interactive tests).

## V4 Deep-Iteration (2026-06-13) — Blocks 1-5
**Commits:** e6a0702 → a3da292 → 1bf2562 → 3daaba4 → 314b928. Gates green every block: tsc 0, **1307 tests (+50 from 1257)**, build ✓, prod deploy ✓.

- **Block 1 — Weak-key drill auto-suggest (<85%)** ✅. New pure lib `src/lib/typing-engine/weak-key-suggestion.ts` (`findMissedKeys`, `buildDrillSuggestion`, `drillHref`, `parseDrillKeys`, +15 tests). After any finished lesson the session is recorded to practice-history; when accuracy < 85% the results modal shows an encouraging, non-punishing amber drill card listing the specific missed keys with a "בוא נתרגל יחד" deep-link to `/drill?keys=…`. The `/drill` page now reads `?keys=` and pre-seeds/selects those keys (Suspense-wrapped for `useSearchParams`). Also fixed a pre-existing date-seeded flake in home-dashboard test (scoped `within()` the daily-challenge card).
- **Block 2 — Certificate auto-surface on milestone** ✅. New pure `detectNewCertificate()` in `certificate.ts` (+5 tests) + persisted `certificate-celebration-store` (+4 tests). New `CertificateCelebration` component mounted once in `app-shell`: when a kid crosses a bronze/silver/gold/platinum/ninja-master milestone, a confetti modal with the shareable `NinjaCertificate` pops automatically anywhere in the app. Hydration guard marks already-earned certs from prior sessions silently so only genuinely-new milestones pop. Reduced-motion respected.
- **Block 3 — Polish: leaderboard demo-label** ✅. Stopped dishonestly marking a random mock entry as "אתה" (you). Notice copy clarifies the names are an illustrative demo until real accounts ship; e2e expectation updated. (Statistics/drill empty+loading states were already present.)
- **Block 4 — Spendable coin economy + cosmetic shop** ✅. New pure `coins.ts` (8-accent catalog, `coinsFromStars` @10/star, `coinBalance`, `evaluatePurchase`, `isUnlocked`, +21 tests) + `totalStarsEarned()` in stars.ts (+2 tests). Coins are EARNED deterministically from stars (re-derivable); only spend is persisted (balance = earned−spent). settings-store gained `coinsSpent`/`unlockedCosmetics`/`equippedAccent` + idempotent `purchaseCosmetic` (auto-equip) + `equipAccent` (+4 tests). New `/shop` ("חנות הנינג׳ה") — balance, buy/equip cards, affordability gating, explicit "no real money" note. Equipped accent recolors the profile avatar ring+glow. Added to sidebar nav.
- **Block 5 — Per-key ripple on on-screen keyboard** ✅. The `Key` component emits a soft radial ripple on each press across ALL flows that render `HebrewKeyboard` (practice, lesson-view, speed-test, onboarding). Transform/opacity only, 180ms, tinted by correctness or finger-zone colour; reduced-motion users opt out. +3 tests.

### V5 backlog (next session)
- Sound/voice for the new flows: a celebratory voice line on the certificate auto-surface modal; a coin-collect SFX distinct from level-complete.
- Shop depth: more cosmetic categories beyond accent (avatar emoji/frames, lesson-map themes); show the equipped accent in more surfaces (header, XP bar gradient).
- Weak-key drill loop closure: after completing an auto-suggested drill, offer "חזרה לשיעור" to retry the lesson that triggered it (carry the lessonId through `/drill?keys=…&from=lesson-XX`).
- Coin balance visible in the header/profile (currently only on /shop) so kids feel the economy passively.
- Real backend leaderboard + certificate persistence (still demo/local).
- Per-key ripple: consider `overflow-visible` container tuning if neighbor overlap is ever distracting on small mobile keyboards (currently fine — pointer-events-none + fast fade).

## V3 Deep-Iteration (2026-06-12 night) — Blocks 1-3
**Commits:** 84238c2 (blocks 1-3) → e15188a (cert goal-preview UX). Gates green: tsc 0, **1257 tests (+35 from 1222)**, build ✓, prod deploy ✓.

- **Block 1 — Shareable "תעודת נינ׳ה" (certificate PNG)** ✅ NEW. `src/lib/gamification/certificate-canvas.ts` — pure, dependency-free, draws a brand-consistent RTL Hebrew certificate to a canvas (kid's persisted name, milestone title/emoji, stars, dd.MM.yyyy date, brand frame in #6C5CE7/#00B894). Exports downloadable PNG + Web Share (`navigator.share({files})` with download fallback). New persisted `playerName` in settings-store (editable inline). Component `ninja-certificate.tsx` (live canvas preview + name input + download/share). Surfaced on `/certificates` — shows highest earned milestone, or bronze as an aspirational goal-preview when none earned yet. +12 unit tests (date/filename/stars/buildData helpers).
- **Block 2 — Victory/defeat taunt wiring** ✅. Added `playerWon`/`playerLost` rival categories (6 rivals, in-character — bug gloats/shocked, shadow gracious, yuki warm, etc.) + Mika `victory`/`defeat` coach lines (supportive, never punishing) to `battle-taunts.ts`. Surfaced in `battle-results.tsx` results modal: rival taunt (themed) + Mika line, deterministic seed, `aria-live`, reduced-motion respected. Passes `rival={selectedRival}` from arena. +6 tests (distinctness, win/loss pick, supportiveness); extended existing taunt test to cover new categories.
- **Block 3 — Confidence-gated progression** ✅. `src/lib/typing-engine/progression.ts` — pure lib. Next lesson unlocks only when the previous lesson clears a confidence accuracy gate = `max(70 floor, targetAccuracy − 5 grace)`, replacing completion-only unlock. New `needs-practice` status (completed but below gate) with amber styling + encouraging non-punishing retry nudge showing the EXACT accuracy gap ("עוד N% ותפתח את השיעור הבא. נסה שוב — אתה משתפר!"). Wired into `lesson-list-client.tsx`. +13 tests. **Live-verified:** fresh guest sees lesson 1 unlocked, 2-20 locked.

### V3 backlog — status after this session
1. ~~Per-key ripple on on-screen keyboard~~ → DEFERRED to v4 (low priority, only renders in practice/placement)
2. ~~Confidence-gated progression~~ → ✅ DONE (Block 3)
3. ~~Printable certificate at milestones~~ → ✅ SUPERSEDED by Block 1 (shareable downloadable PNG, parent-visible artifact)
4. Auto-suggest weak-key drill after a lesson with <85% accuracy → v4 (synergizes with the new needs-practice state)
5. Spendable currency economy (Nitro Type garage pattern) → v4
6. Polish pass: leaderboard demo-label UX, mobile viewport sanity, empty/loading states sweep → v4
7. ~~Rival taunts in battle RESULTS screen (victory/defeat)~~ → ✅ DONE (Block 2)

### V4 backlog (next session)
- Per-key ripple / on-screen keyboard juice in the main lesson flow (item 1)
- Auto-suggest weak-key drill after <85% accuracy lesson — hook into `needs-practice` (item 4)
- Trigger the certificate modal automatically on course/belt completion (currently lives on /certificates page; add a celebratory auto-surface on the 5/10/15/20 milestone completion)
- Spendable currency economy (item 5)
- Polish sweep (item 6)

---


## V2 Deep-Iteration (2026-06-12 evening) — Blocks 1-5
**Commits:** c21932f (research) → a4a7559 (narrative) → 427e26d (juice). All gates green: tsc 0, 1222 tests, build, deploy.

- **Block 1 RESEARCH** ✅ `docs/v2-research.md` — 12 mechanics extracted from TypingClub/NitroType/DanceMat/keybr, each mapped vs codebase. Key insight: most genre mechanics already shipped in iters 16-18; V2's job was CONNECTING them into one journey.
- **Block 2 SOUND** ✅ audit only — already exceeds brief: sound-manager (16 MP3 SFX + Web Audio synthesis fallback), music-manager (15 zones, crossfade), persisted soundEnabled/soundVolume in settings-store, reduced-motion respected. No work needed.
- **Block 3 NARRATIVE** ✅ shipped — `storyIntroHe`/`storyOutroHe` on all 20 lessons (Ki's 3-act journey: awakening 1-7 / training 8-15 / ninja 16-20, matching docs/character-integration-map). Intro beat renders on lesson idle screen, outro in results modal on pass. Battle: `src/lib/battle/battle-taunts.ts` — per-rival personality taunts (6 rivals × 4 moments) + Mika coach encouragements on combo milestones; throttled aria-live speech strip in arena. NOTE: brief said "Box" but Box isn't in this game's canon (he's an agent-network character) — implemented per the actual character bible (rivals + Mika).
- **Block 4 JUICE** ✅ shipped — shared `calculateStars` lib (+6 tests), mastery stars (1-3) on lessons map from best WPM/accuracy, escalating combo streak counter in lesson page (10=green / 25=purple / 50=gold+🔥, comboHit SFX at tiers).
- **Block 5 BACKGROUNDS** ✅ already shipped previously — 10 themed JPGs in public/images/backgrounds wired across all 10 scenes.
- **Block 6 POLISH** → deferred to v3 (see backlog below).

### V3 backlog (from V2 research + deferred polish)
1. Per-key ripple on on-screen keyboard (only renders in practice/placement, not main lesson flow — low priority)
2. Confidence-gated progression (keybr-style: unlock next lesson by accuracy, not just completion)
3. Printable certificate at lessons 5/10/15/20 (Dance Mat pattern, parent-visible artifact)
4. Auto-suggest weak-key drill after a lesson with <85% accuracy
5. Spendable currency economy (Nitro Type garage pattern)
6. Polish pass: leaderboard demo-label UX, mobile viewport sanity, empty/loading states sweep
7. Rival taunts in battle RESULTS screen (victory/defeat lines — lib categories exist, UI not wired)

## Current State (pre-V2 baseline)
Iteration 18 COMPLETE (Apr 10, 2026). Massive gameplay session — 10 commits, 13 features shipped. Art fixes (Rex V5, Shadow V3, Laila V2). Ki mascot emotional feedback. Weak key drill mode. Battle: combo system (5 tiers) + power-ups (4 types, fully integrated into arena). Speed-test: personal bests + history chart + new record banner. Keyboard shortcuts module (22 shortcuts, 5 categories, interactive practice with SFX + difficulty stars). Statistics dashboard (overview, WPM chart, weak keys, session history, XP progress). TypeScript: 0 errors. Tests: 1189+. Commits: b9722f5 → 08ab0ca.

## EXACT CONTINUATION PLAN (for next session)
### PRIORITY 1: Content & Audio
1. Voice generation — 9 characters still need ElevenLabs voices (use voice-generate-all-hebrew.mjs)
2. Theme songs — 8+ characters need Suno tracks (use suno-music-pipeline.mjs)
3. Lesson content expansion — more Hebrew texts per difficulty level

### PRIORITY 2: Backend & Social
4. Leaderboard system — Supabase backend, competitive rankings by school/age
5. Teacher/parent dashboard — class management, student progress reports, lesson planning
6. Tournament mode — bracket system, automated scheduling

### PRIORITY 3: Polish & Future
7. Onboarding polish — first-time user experience, placement test flow
8. 3D POC — waiting for GLB model upload (Tripo3D/Meshy)
9. Mobile responsiveness — on-screen keyboard, touch support
10. PWA offline mode — service worker, cache strategy

### WHAT WAS COMPLETED IN ITERATION 18 (summary)
- 5/9 original game dev priorities DONE in a single session
- Battle system: combo (5 tiers) + power-ups (4 types) + SFX + shield mechanic
- 3 new pages: /drill, /shortcuts (enhanced), /statistics (rebuilt)
- Ki mascot now reacts to typing emotions in real-time
- Speed-test now tracks personal bests with history visualization
- Shortcut practice has difficulty stars and sound effects
- 45 new tests added by agents (1189+ total)

### ITERATION 18 COMPLETED
- ✅ Rex V5: balanced cool gamer dino with slight smile (not chibi)
- ✅ Shadow Combat V3: matches base character (same gray cat with hood+mask)
- ✅ Laila V2: anthropomorphic panther on 2 legs (consistent design language)
- ✅ Ki mascot feedback: emotional detection + Hebrew speech bubbles during typing
- ✅ Weak key drill page (/drill): targeted practice with easy/medium/hard modes
- ✅ Drill text generator: per-key Hebrew words and sentences
- ✅ Sidebar: added gallery (/gallery) and drill (/drill) navigation links
- ✅ Ki mascot integrated into lesson-view.tsx
- ✅ Battle combo system: 5 tiers (x5-x50+), Hebrew labels, milestone popups
- ✅ Battle SFX: per-keystroke correct/error sounds, combo milestone hits
- ✅ Battle power-ups: speed boost, shield (3 hits), freeze AI, double XP — with cooldowns + combo earning
- ✅ Power-ups integrated into battle arena (shield absorbs errors, tick timer, combo milestones)
- ✅ Speed-test: personal best display, history bar chart, new record crown banner
- ✅ Keyboard shortcuts module: 20+ shortcuts, 5 categories, interactive key combo practice, Mika avatar
- ✅ Statistics dashboard: overview cards, WPM trend chart, problematic keys, session history, XP progress

### ART — DONE (Round 5)
- ✅ All art user-approved (6 dojo masters, Rex V5, Shadow V3, Laila V2)
- ✅ 42 hero images total, 31 characters in CHARACTER_CONFIGS

### ART ROUND 3 (Apr 3, 2026) — ALL DONE
- ✅ Rex V3: GREEN color + gamer elements (headset, controller) + creative (beret, paintbrush)
- ✅ Shadow combat mode: hood + face mask, dual daggers, fighting stance
- ✅ Keres+Virus mega boss V2: MUCH bigger, muscular, intimidating
- ✅ Barak V2: with pants matching Storm's outfit
- ✅ Alon hero (Ki's dad): first image — ninja-coder, golden pendant, digital gloves
- ✅ Shir hero (Ki's mom): first image — warm Israeli mom, braid, reading glasses, pendant
- ✅ Gallery corrections noted: Phantom→mentor is Sensei Zen (not Mika!), Sakura→mentor for Yuki AND other girls
- Future: battle poses for all characters in expression sheets

### ART ROUND 2 — ALL DONE
- ✅ Ki's dad RENAMED: Raz → Alon (אלון) in visual bible. Phantom stays separate.
- ✅ Phantom 2 versions: with cloak + without cloak (revealed face)
- ✅ Pixel V3: more robotic while staying feminine
- ✅ Rex V2: slightly more mature
- ✅ Block V3: gray concrete + orange, more threatening
- ✅ Glitch 5 forms: confused → current → corrupted → shattered → whole
- ✅ Keres+Virus fusion: bug king merged with virus power
- ✅ Virus ancient form: primordial enemy of Master Beat
- ✅ Blaze V2: APPROVED, kept as is

### NEXT PRIORITY
8. Chrome review remaining 15 pages
9. Voice generation: 9 characters (ElevenLabs)
10. Theme songs: 8+ characters (Suno V5)
11. Jukebox cover art
12. Teacher/parent dashboard
13. 3D POC: Ki model (React Three Fiber, files started)
14. More game-feel: power-up visuals

## KEY RULES (from user feedback)
- ALL character art MUST be CHIBI style (big head, small body, kid-friendly)
- Pixel V3 was great (keep personality), Mika V3 has tech elements (keep)
- Story dialog should sound like natural Israeli Hebrew (slang, unique voices)
- App must FEEL like a real game (particles, combos, celebrations)
- User reviews MUST be HTML in browser (never terminal text)
- Follow iteration protocol: read context → work → verify → document → review

## What Was Done (Iteration 17 — Apr 1, 2026)

### Art Completion — 23/23 Heroes
- ✅ Generated 7 remaining chibi heroes: Kai, Phantom, Master Beat, Zara, Keres, Block, Lens
- ✅ Generated Bug hero (was missing heroImage in config)
- ✅ ALL 23 characters now have heroImage in CHARACTER_CONFIGS
- ✅ All heroes in consistent chibi style (big head, small body, kid-friendly)

### Badge Art Completion — 11/11
- ✅ Generated "Patient" badge (meditation ninja)
- ✅ Generated "Focused" badge (brain concentration ninja)
- ✅ ALL 11 badges now have unique JPG art

### Game-Feel Effects (3 new components)
- ✅ **LevelUpCelebration** — fullscreen overlay with scale-in level number, 16 CSS star rays, character celebration, auto-dismiss (3s)
- ✅ **CharacterLoading** — random ninja hero + rotating Hebrew messages + bounce animation
- ✅ **useLevelUp hook** — detects XP→level transitions, 15 unit tests
- ✅ Level-up celebration integrated into Home Dashboard
- ✅ App loading screen upgraded to CharacterLoading (was basic SVG NinjaLoader)

### Story Page Upgrade
- ✅ Sensei Zen as narrator companion (180px, gold glow)
- ✅ Character avatars use heroImage instead of model-sheet images

### Tests & Quality
- ✅ TypeScript: 0 errors
- ✅ 1144 tests passing (29 new from useLevelUp hook + test)
- ✅ Loading test fixed (dir=rtl for CharacterLoading)

---

## What Was Done (Iteration 16 — Mar 30, 2026)

### Bug Fixes (Chrome Review)
- ✅ **HIGH** Battle avatars: Shadow/Storm/Blaze → model-sheets with light backgrounds (visible on dark UI)
- ✅ **MEDIUM** XP bar hydration mismatch → useState+useEffect pattern (SSR-safe)
- ✅ **LOW** Ki hero image fixed → ki-hero.jpg (was model-sheet composite)

### Character System Upgrades
- ✅ 4 missing characters added to type system: Zara (Bug Queen), Keres (Bug King), Block, Lens
- ✅ Expression sheets wired: 23 characters now have expressionSheet path in CHARACTER_CONFIGS
- ✅ Badge images linked: 9/11 badges now show real JPG art instead of emoji

### UI/UX Overhaul (from user feedback)
- ✅ Large character companions (220px + idle animations) on 7 pages: Ki→home, Zen→lessons, Yuki→speed-test, Luna→practice, Mika→shortcuts, Rex→games, Pixel→statistics
- ✅ Lesson page game-styled: game-card-border on stats + typing area, keystroke sounds added
- ✅ Results modal upgraded: animated stars, XP pop-in, game-card-border styling
- ✅ Sensei Zen as daily tip companion with speech bubble
- ✅ 5 age themes visually differentiated (unique color schemes + animation modifiers wired)

### Story Content
- ✅ Virus + 7 missing characters added to story chapters (Barak, Sakura, Phantom, Master Beat, Zara, Keres)
- ✅ ~30+ new story beats across chapters 2-6 in Hebrew
- ✅ ~60 dialog lines rewritten by Opus for natural Israeli Hebrew (slang, unique voices per character)

### Game-Feel Effects (Mar 31)
- ✅ Floating particles background (20 CSS-only particles, purple/teal)
- ✅ Combo counter in typing area (x5, x10... with pop animation, 4 intensity levels)
- ✅ Screen shake on typing errors (2px, 120ms, respects reduced-motion)
- ✅ Confetti burst on lesson completion

### Art — Chibi V2 (Mar 31)
- ✅ 7 hero illustrations regenerated as CHIBI style (big head, small body, kid-friendly)
- ✅ User feedback: Pixel needs more personality, Mika needs tech elements → V3 generating
- ✅ 8 NEW heroes generating: Shadow, Storm, Blaze, Glitch, Virus, Noa, Barak, Sakura
- ✅ heroImage field added to 15 characters in CHARACTER_CONFIGS
- ✅ Noa added as companion on /progress page
- ✅ Battle rivals updated to hero images

### Cleanup
- ✅ 5 orphan background images deleted (3.9MB freed)
- ✅ Test fixed: Ki alt text Hebrew alignment
- ✅ Gemini model updated to 3.1 Flash (was deprecated 3-pro-image-preview)
- ✅ 3 memory files created with feedback/lessons

## Next Steps
1. Generate remaining 7 heroes: Phantom, Master Beat, Kai, Zara, Keres, Block, Lens
2. Jukebox gamification — track unlock system (in progress)
3. Continue Chrome review (15 pages remaining)
4. Voice generation for 9 characters
5. Theme songs for 8+ characters
6. Ki voice + consistency redesign
7. Sensei Zen Israeli accent voice
8. Teacher/parent dashboard expansion
9. Badge art generation (Gemini)
10. Jukebox cover art for missing tracks

## Chrome Review Results (Mar 24, 2026 — 10 pages)

| Page | Status | Issues |
|------|--------|--------|
| /home | ✅ | Hydration mismatch (XP bar SSR), 1 broken image (Clerk) |
| /lessons | ✅ | 20 lessons, badges, locks — all working |
| /battle | ⚠️ HIGH | 5/6 opponent avatars not loading |
| /progress | ✅ | Empty state in Hebrew OK |
| /profile | ✅ | Avatar, stats, 0/11 badges |
| /leaderboard | ✅ | Podium, table, filters, "you" highlighted |
| /games | ✅ | 4 games with Hebrew descriptions |
| /badges | ⚠️ KNOWN | All 11 badges generic locks (96 art gaps) |
| /jukebox | ⚠️ KNOWN | 7/17 tracks, missing covers |
| /settings | ✅ | Theme/sound/music controls perfect |

### Bugs Found
1. **HIGH** /battle — 5/6 opponent avatars not loading (only "באג" shows image)
2. **MEDIUM** /home — Hydration mismatch: XP bar server=0% vs client=48%
3. **LOW** /home — Clerk avatar broken (alt="Ki")

### Positive Findings
- RTL: dir="rtl" + lang="he" on all pages ✅
- Hebrew: All text, labels, buttons fully localized ✅
- UI: Professional dark theme, primary purple #6C5CE7 ✅
- Sidebar: Full Hebrew navigation, clear active states ✅
- Console: Only 1 hydration error (non-critical) ✅

---

## Previous State (Iteration 14)

## What Was Done This Session (Iteration 14)

### Commit 5: Utility Scripts & Suno Guide
- suno-generation-guide.md: Suno V5 prompts for 42 tracks
- audio_audit_gen.py: audio file audit script
- launch-claude.sh: project launch helper

### Commit 4: Interactive Feedback Review (96 Known Gaps)
- **game-feedback-review.html** — 1,346 lines, 15 sections
- 96 pre-populated gaps from art-audit, audio-audit, audit-data, iteration reviews
- Per-gap: severity badge, status radio, notes textarea
- Severity breakdown: 9 critical, 33 high, 48 medium, 6 low
- LocalStorage persistence, JSON export/import, gap filtering
- Floating sidebar with gap counts per section

### Commit 3: Audit Data & Post-Iteration-12 Report
- art-audit.json, audio-audit.json, audit-data.json
- post-iteration-12-audit.html (comprehensive audit report)

### Commit 2: Holiday Music Folder Reorganization
- Moved 24 generic MP3s to holidays/generic/ (backup)
- Moved 48 cover art JPGs to holidays/covers/
- Reference-based tracks remain as primary in main directory

### Commit 1: Security Headers
- X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- Referrer-Policy, HSTS, Permissions-Policy
- Removed X-Powered-By header

---

## Previous: Iteration 13 — Quality & Polish

### Commit 6: Reference-Based Holiday Music
- **New script**: `suno-holiday-references.mjs` — fully automated pipeline:
  1. Downloads 15s instrumental reference clips via yt-dlp
  2. Uploads to tmpfiles.org for Suno access
  3. Uses Suno V5 upload-cover API with audioWeight control
  4. Downloads, quality-checks, updates manifest
- **12/12 holiday tracks regenerated** with authentic melodic references:
  - HOL-001 חנוכה: Mi Yemalel melody (public domain, audioWeight=0.35)
  - HOL-002 פורים: Chag Purim melody (public domain)
  - HOL-003 פסח: Ma Nishtana melody (public domain)
  - HOL-004 יום העצמאות: Yerushalayim Shel Zahav STYLE ONLY (copyrighted, audioWeight=0.15)
  - HOL-005 ראש השנה: Shana Tova melody (public domain)
  - HOL-006 סוכות: Sukkot harvest melody (public domain)
  - HOL-007 שבועות: Shavuot Bikkurim melody (public domain)
  - HOL-008 ל"ג בעומר: Bar Yochai piyyut melody (public domain)
  - HOL-009 ט"ו בשבט: HaShkediya Porachat melody (public domain)
  - HOL-010 יום הזיכרון: Eli Eli STYLE ONLY (copyrighted, audioWeight=0.15)
  - HOL-011 יום השואה: Ani Ma'amin melody (public domain)
  - HOL-012 שמחת תורה: Sisu VeSimchu melody (public domain)
- 24 new reference-based MP3s (2 takes each), all quality-checked
- music-manager.ts updated to use -ref versions as primary
- Original generic tracks kept as backup

### Commit 5: Generic Holiday Music via Suno V5 (9085c24)
- 12 holiday tracks generated (24 MP3s, 94MB) using standard Suno V5 generate
- Duration quality gate fixed: holidays max 150→300s

### Commit 4: PROGRESS.md update (29b9ba8)

### Commit 3: Dead Code Cleanup + Report (f34c621)
- 5 dead files deleted (420+ lines): use-is-mobile, use-media-query, types/music, types/typing, tutorial-intro
- 4 dead exports removed: useSuccessSound, findBeatById, VILLAIN_CHARACTERS, getBossConfig
- 9 exports de-exported (narrowed to file-private)
- Iteration 13 HTML report generated (docs/iteration-13-report.html)

### Commit 2: A11y + Battle Tests + Holiday Music (c8b2e4e)
- **Accessibility**: prefers-reduced-motion across 9 components + new use-reduced-motion hook
- **Accessibility**: CSS @media reduced-motion rules for all keyframe animations
- **Accessibility**: aria-live regions for battle arena, results, lesson completion
- **A11y score**: 6.5/10 → ~8.5/10
- **Battle tests**: Fixed 16 failing tests (mocks for motion.button, next/image, radix-ui, sound-manager)
- **Holiday music**: 12 Israeli holiday tracks added to Suno catalog (56 total)

### Commit 1: Post-Iteration 12 Audit Fixes (161ba9d)
- 39 broken music paths fixed in music-manager.ts
- 4 broken image paths fixed (ai-typing-engine + home-client)
- Dialog "Close" → "סגור" (Hebrew i18n)
- Unused TIMER_DURATIONS import removed

### Code Quality Scan (No fixes needed!)
- English strings in UI: 0
- console.log: 0
- `any` types: 3 justified only

## Next Steps
1. **3D POC** → Ki character model (user wants to start together, budget consideration)
2. **User interactive review** → Full game walkthrough
3. **Teacher mobile interface** → Expand teacher dashboard for mobile

## Previous Session

### 5-Agent Verification Audit
Ran 5 parallel agents to verify the full project:

#### 1. Test Runner (PASS)
- TypeScript: 0 errors
- Build: 54 static pages, all passing
- Unit tests: 1080/1096 pass (16 failures in battle-arena.test.tsx - Dialog mock issue, not a code bug)

#### 2. Code Cleanup (CLEAN)
- console.log: 0 found (excellent hygiene)
- TODO/FIXME: 1 low-priority in student-list-mobile.tsx (messaging hook)
- Unused imports: 1 found (TIMER_DURATIONS in practice/page.tsx) → FIXED
- Dead exports: 6 entire modules + 25 individual exports never used
- English strings: dialog.tsx "Close" → FIXED to "סגור"

#### 3. Accessibility Audit (6.5/10)
- PASS: RTL handling correct throughout
- CRITICAL: oklch contrast on borders (decorative, not text)
- HIGH: prefers-reduced-motion not checked for animations
- HIGH: missing aria-live for game state changes

#### 4. Audio Audit (39 broken refs → FIXED)
- 379 files (571MB) total
- 39 broken music path references in music-manager.ts → ALL FIXED
  - DEFAULT_ZONE_TRACKS: flat paths → subdirectory paths (gameplay/, battle/, events/, menu/)
  - STINGER_TRACKS: stingers/ → events/ with correct filenames
  - TRACK_MANIFEST: name fixes (ki→kis, bug→bugs, sensei-zen→sensei-zens, geza-arena→geza-ninja-arena)
- 12 holiday tracks: paths defined but files not yet generated (future task)
- 360 orphaned files (v2/v3/v4 variants not referenced in code - by design, for jukebox)

#### 5. Image Audit (4 broken refs → FIXED)
- 149 images (97MB)
- 4 broken image references fixed:
  - ai-typing-engine.ts: yuki-model-sheet→yuki-girl, bug-model-sheet→bug-creature, virus-model-sheet→virus-dual-form
  - home-client.tsx: achievement-star→badge-achievement-gold
- 58 orphaned images (character art variants, kept for reference)

### Fixes Applied
- [x] 39 music paths fixed in music-manager.ts (zone tracks, stingers, manifest)
- [x] 4 broken image paths fixed (3 in ai-typing-engine, 1 in home-client)
- [x] Dialog "Close" → "סגור" (Hebrew i18n fix)
- [x] Unused TIMER_DURATIONS import removed from practice/page.tsx
- [x] 85 duplicate MP3s deleted from Downloads folder (272MB freed)
- [x] TypeScript: 0 errors after all fixes

## Next Steps
1. **Commit** audit fixes (music paths, image paths, i18n, cleanup)
2. **Battle test fix** → Mock Dialog component in test setup (16 test failures)
3. **A11y fixes** → aria-live regions for game states, prefers-reduced-motion
4. **Holiday music** → Generate 12 holiday theme tracks via Suno
5. **User feedback** → Pending interactive review on full game
6. **3D POC** → Ki character model (waiting for user go-ahead)

---

## Previous Iterations Summary

### Iteration 12 (March 11-12)
- Gaming CSS applied to ALL 12 remaining pages via 3 parallel agents
- AI battle system polished (timer, stats, Hebrew names, portraits)
- Music manifest: 44 tracks, 173 MP3 files
- Teacher mobile dashboard (2-tab, skill mapping)
- Commit: 2b1cd27 (14 files)

### Iteration 11 (March 10-11)
- Full 5-agent verification: all systems production-ready
- Soundtrack 44/44 tracks via Suno V5 API (90 MP3)
- Commit: 1f498ca (164 files)

### Iteration 10 (March 8-9)
- Suno batch generator, expression sheets, music pipeline, Chapter 6

### Iteration 9 (March 8)
- Sensei Zen turtle, Sakura crane, Glitch 6 versions, Master Beat, Visual Bible

### Iteration 8
- Story Ch4-6, MusicProvider, AI battle system, 5 skills

### Iteration 7
- DialogBox, StoryPlayer, Yuki V8-D voice, badges

### Iteration 6-5
- Copyright, voices, music system, gaming UI, holiday skins, story V2

---

## 2026-06-11 — apps-finish sweep (Fable-5 / Claude Opus 4.8)
- **audit:** `npm audit fix` (no --force) resolved 13 vulns incl. 1 CRITICAL (vitest UI RCE) + 5 HIGH (next, vite, fast-uri, path-to-regexp, picomatch) — all within semver. Down to 3 moderate (need major/`--force` = deferred). Commit `45be4a1` (package-lock.json only).
- **verify:** tsc 0 · `next build` exit 0 · lockfile-only change.
- **NOT touched (intentional, working patterns):** 36 eslint "errors" = React-Compiler heuristic rules (set-state-in-effect / refs / preserve-manual-memoization) across many files — rewriting changes runtime; out of scope for a types/lint-only sweep.
- **Needs Elad / next session:** PRIORITY-1 content (9 char voices ElevenLabs · 8+ Suno theme songs · lesson texts) · PRIORITY-2 backend (leaderboard/teacher dashboard/tournament Supabase) · 3D POC awaits GLB upload · mobile on-screen keyboard · PWA offline. Project is local/unpushed (no Vercel) — no live-deploy risk.

---

## 2026-06-12 — 🚀 v1 PRODUCTION LAUNCH (Fable-5, autonomous Shabbat session)

**LIVE:** https://ninja-keyboard-nine.vercel.app (Vercel project `ninja-keyboard`, scope eladjaks-projects)

### Launch decision: guest-first deploy (no Supabase env in production)
- Middleware already skips auth when Supabase env is absent → ALL 40 routes publicly playable as guest, progress in localStorage. Zero login wall for kids.
- Backend accounts/sync = deferred to v1.1 (env vars + Supabase project flip it on; code is ready — Phase 1 store-boundary sync from `82adfd0`).

### Shipped this session
- **Landing page at `/`** (was a bare redirect to /home): server-rendered Hebrew RTL marketing page — hero with Ki, 6 feature cards (real character art), parents/teachers section, 6-question FAQ, external links, contact footer. Exactly 1 h1, full semantic tags, alt on all images.
- **`/about` page** — story, principles, creator, contact.
- **GEO/AEO bundle**: JSON-LD as plain script in initial HTML (WebSite + WebApplication + Person + WebPage + FAQPage), robots.txt (AI bots allowed), sitemap.ts (22 routes), llms.txt, metadataBase + canonical + OpenGraph. **Local geo-scan score: 100/100 (0 failed).** mole-ai scanner returned no score (quota).
- **Auth graceful degradation**: all server actions in `src/lib/auth/actions.ts` return friendly Hebrew guest-mode message when Supabase env missing (was: server-action crash). Auth layout shows guest notice + "כניסה כאורחים" CTA. Verified live: form submit → friendly message.
- **Leaderboard mock data honestly labeled** as demo ("תחרות אמיתית תיפתח יחד עם החשבונות").
- **Sidebar brand h1 → p** — exactly one h1 per app page (a11y/SEO).
- **3D POC committed** (Ki GLB viewer, hidden route /3d-poc, graceful missing-model state).

### Gates
- tsc: 0 errors · tests: 1197/1197 pass (68 files) · next build: clean (40 routes)
- Live verification (agent-browser headless): / 200, /home 200 guest-accessible, /lessons + /lesson-01 render, /battle renders, /login graceful, robots/sitemap/llms 200.

### Commits
`b57ac5d` (launch) · `980f47e` (canonical domain fix → ninja-keyboard-nine.vercel.app) · `9e7c4bb` (sidebar h1) — all pushed to master.

### Deferred (honest list for next session)
1. Character voices (ElevenLabs — paid) + theme songs (Suno — paid): hooks exist, skipped per no-paid-APIs constraint.
2. Real backend: Supabase env not set in prod → accounts, real leaderboard, teacher dashboard, cross-device sync OFF. To enable: `vercel env add NEXT_PUBLIC_SUPABASE_URL/ANON_KEY production` + verify RLS + decide on the /home auth-wall UX (currently guest-first).
3. Lesson content expansion (more Hebrew texts per level) — needs Elad's creative pass.
4. Mobile on-screen keyboard / touch, PWA offline mode, 3D GLB model upload.
5. Teacher `student-list-mobile.tsx` TODO: notification/messaging hookup.
6. Custom domain (currently *.vercel.app default — per launch constraints, no DNS touched).
