# Ninja Keyboard — State Collection & Reconnect-to-Vision Plan

**Date:** 2026-06-07
**Author:** Claude Code (state-collection + planning pass)
**Repo:** `~/projects/ninja-keyboard`
**Live demo:** https://ninja-keyboard-nine.vercel.app
**Last commit:** `85a1f5d` (Iteration 18 docs) — ~Apr 10, 2026 (project idle ~8 weeks)

---

## 1. State Collection

### 1.1 What it IS (concept / vision)
A **Hebrew-first PWA that teaches kids ages 6–16 (and adults) to type and operate a computer**, wrapped in a ninja-themed RPG with original characters, voice acting, music, and a story mode. Per the v9 spec (`docs/ninja-keyboard-spec-v9-FINAL.md`), the product's **unique market position** is that no Hebrew tool combines all six learning pillars:

1. הכרת המחשב — computer literacy (hardware/software, mouse, keyboard)
2. הקלדה עיוורת — touch typing (Hebrew + English)
3. ניהול חלונות וקבצים — Windows / file management
4. קיצורי מקלדת — keyboard shortcuts (Ctrl+C, Alt+Tab, Win+D…)
5. אפס עכבר — "Mouseless Mastery" (full nav without a mouse)
6. קלט חכם — multimodal awareness (when keyboard vs. voice vs. touch)

Plus: 5 age tracks (shatil/nevet/geza/anaf/tzameret), adaptive difficulty, emotional-adaptive feedback, teacher/parent dashboard, full RTL, WCAG 2.2 AA accessibility, placement test, child-privacy by design. **Stated market: ~2M Israeli K-12 students + adults. "First of its kind in Hebrew."**

### 1.2 Tech Stack (verified from `package.json`)
- **Framework:** Next.js 16 (App Router), React 19.2, TypeScript strict
- **Styling:** Tailwind CSS 4, Framer Motion 12, Radix UI / shadcn (New York)
- **State:** Zustand 5 (12 stores, all `persist`-to-localStorage)
- **Backend:** Supabase (`@supabase/ssr`, `supabase-js`) — *code present, not wired to running app* (see 1.4)
- **Audio:** Howler + custom Web Audio `MusicManager`; Lottie
- **3D (new, uncommitted):** three.js, @react-three/fiber, @react-three/drei
- **Errors:** better-result · **Validation:** Zod · **i18n:** next-intl
- **Testing:** Vitest, RTL, Playwright (E2E), axe-core

### 1.3 What's BUILT (substantial, working)
- **~28 routes** under `src/app/(app)/`: home, lessons, battle, drill, speed-test, practice, shortcuts, statistics, games (letter-memory / ninja-slice / word-rain), story, jukebox, leaderboard, badges, gallery, certificates, placement, onboarding, profile, settings, accessibility, tips, teacher, parent-report, 3d-poc.
- **Typing engine** (`src/lib/typing-engine/`), **battle AI engine** (`src/lib/battle/ai-typing-engine.ts` — 5 typing patterns, rubber-banding), **gamification** (XP, badges, combos, power-ups), **feedback engine**, **daily challenge**, **placement**, **statistics**.
- **Content:** 21 graded lessons (`src/lib/content/lessons.ts`), practice texts, sentences, typing tips, a keyboard-shortcuts module.
- **Story:** 6 Hebrew chapters (`src/data/story/chapter-1..6.ts`), dialog/story-player system.
- **Audio assets:** ~44-tracks soundtrack pipeline (Suno), holiday music, SFX; character voices (ElevenLabs) — large `public/audio` tree.
- **Art:** 42 hero images, 31 characters in config, 11 badges (per PROGRESS).
- **Accessibility:** prefers-reduced-motion, aria-live, accessibility panel; a11y ~8.5/10 self-rated.
- **6 dedicated skills** in `~/.claude/skills/ninja-keyboard-{battle,design,music,story,suno,voice}` — these encode the production pipelines and ARE the operational vision.

### 1.4 What's STUBBED / not real
- **Auth + Supabase are bypassed in the deployed app.** `src/middleware.ts` returns `NextResponse.next()` whenever `NEXT_PUBLIC_SUPABASE_*` env is absent → the public demo runs with **no login, no protected routes**. Server actions (`src/lib/auth/actions.ts`) and migrations (`supabase/migrations/0000{1,2,3}`) exist but are not exercised by the live site.
- **No persistence to backend.** All 12 Zustand stores persist to **localStorage only**; no store / `lib/profile` / `lib/reports` / `lib/statistics` / `lib/gamification` module imports Supabase. Progress is per-browser, lost on device change. (This breaks the teacher/parent value prop, which requires server-side student data.)
- **Leaderboard = mock** (`generateMockLeaderboard(20)` in `leaderboard-client.tsx`).
- **Teacher dashboard = hardcoded mock data** (`MOCK_STUDENTS`, `MOCK_CLASSES` in `teacher/page.tsx`).
- **Curriculum gap (biggest vision miss):** the 21 graded lessons are almost entirely **Hebrew touch-typing** (home-row + letters/words). The four *differentiating* pillars — Windows/file mgmt, mouseless nav, multimodal input, computer literacy — are **not present as graded curriculum** (only the shortcuts pillar exists, and only as a standalone practice page, not graded).
- **3D POC** uncommitted and isolated (`src/app/(app)/3d-poc`, `src/components/characters/three-d`, `docs/3d-poc`) — waiting on a GLB model.
- **Content/parent messaging:** 1 real `TODO` (`student-list-mobile.tsx` — messaging hook not wired). Voice/theme-song coverage incomplete per PROGRESS (9 chars need voices, 8+ need songs).

### 1.5 What's BROKEN (from latest Chrome review in PROGRESS, Mar 24)
- **HIGH** /battle — 5/6 opponent avatars not loading (some may be resolved post-art-fixes; needs re-verify).
- **MEDIUM** /home — XP-bar hydration mismatch (server 0% vs client) — PROGRESS later claims fixed via useState+useEffect; verify.
- **LOW** /home — broken avatar image. /badges + /jukebox — known art/cover gaps.
- **Test signal is weak:** PROGRESS claims "1189+ tests," but only **5 `*.test.*` files** exist in `src/` today — the large count came from agent-generated tests that are not in the tree, OR were counted differently. Treat coverage as effectively unverified.

### 1.6 Does it build?
- **Build command:** `npm run build` (`next build`). **Not run here** (per instructions). Verify command: `npm run verify` = `tsc --noEmit && vitest run`. `tsconfig.tsbuildinfo` present (last typecheck Apr 10). Uncommitted 3D files add `three` imports — a fresh `tsc`/build should be run to confirm they don't break the tree before any further work.
- **Last activity (`git log -5`):** Iter-18 game-feature work (statistics dashboard, power-ups, shortcuts, combos). Working tree has 3 untracked 3D paths.

---

## 2. The Original Vision (from the 6 skills + v9 spec)

| Skill | What it encodes (intended product capability) |
|-------|-----------------------------------------------|
| `ninja-keyboard-battle` | AI typing rivals — 5 patterns (steady/burst-pause/burnout/accelerate/chaotic), difficulty scaling, rubber-banding, boss configs. *(Built.)* |
| `ninja-keyboard-design` | Dark gaming UI, RTL-first (logical props only), 5 age themes, WCAG 2.2 AA, sound-integrated interactions. *(Largely built.)* |
| `ninja-keyboard-music` | 48-track soundtrack, zone→route mapping, jukebox unlocks, holiday overrides, crossfade/ducking MusicManager. *(Mostly built; coverage gaps.)* |
| `ninja-keyboard-story` | Hebrew dialog beats, 3-act narrative, 14-char bible, 20-lesson character-introduction timeline. *(6 chapters built.)* |
| `ninja-keyboard-suno` | Automated Suno generation/validation pipeline for the soundtrack. *(Pipeline exists.)* |
| `ninja-keyboard-voice` | ElevenLabs Voice Design v3 character voices + ffmpeg post. *(Partial coverage.)* |

**The vision the skills + spec point to:** a *complete, shippable Hebrew computer-literacy game* — not just a typing trainer. The narrative/character/audio production machinery is mature; the **pedagogical breadth (6 pillars) and the multi-user backend (accounts, real progress, teacher dashboard, leaderboard)** are the parts the vision promises but the code has not delivered.

---

## 3. Gap Analysis — Vision vs. Current State

| # | Vision element | Current state | Gap severity |
|---|----------------|---------------|--------------|
| G1 | Real user accounts + cross-device progress | Auth code exists but bypassed; localStorage-only | **CRITICAL** — blocks teacher/parent value, retention, leaderboard |
| G2 | 6 learning pillars graded curriculum | Only touch-typing (+standalone shortcuts) graded | **CRITICAL** — this is the *differentiator* and market claim |
| G3 | Teacher / parent dashboard with real data | Hardcoded mock data | **HIGH** — core B2B/B2school value prop |
| G4 | Competitive leaderboard | Mock generator | **HIGH** |
| G5 | Verified quality (tests, build green, bugs closed) | Only 5 test files; build not re-verified; open Chrome bugs | **HIGH** — can't ship on faith |
| G6 | Complete audio/voice/song coverage | 9 voices + 8 songs missing; jukebox covers missing | **MEDIUM** — polish, pipelines exist |
| G7 | Mobile / on-screen keyboard / touch | Not implemented (in continuation list) | **MEDIUM** — large audience is on tablets |
| G8 | PWA offline | Partial (`lib/offline` exists); service-worker strategy unconfirmed | **MEDIUM** |
| G9 | 3D character (Ki) | POC stub, waiting on GLB | **LOW** — nice-to-have, not on critical path |
| G10 | Onboarding + placement → personalized path | Pages exist; integration into a single first-run flow unverified | **MEDIUM** |

**Root cause of "stuck":** the project iterated deep on *content/art/game-feel breadth* (28 routes, combos, power-ups, art rounds) while the **two load-bearing foundations — a real backend (G1/G3/G4) and the differentiating curriculum (G2) — were left as demo/mock.** It looks 90% done but the 10% that's missing is exactly what makes it a *product* rather than a *demo*.

---

## 4. Structured Plan (phased, ordered by leverage)

> Principle: stop adding surface area. Convert the existing demo into a real product by (a) deciding the shippable scope, (b) making one foundation real, (c) closing the differentiator. Use the 6 ninja skills as the execution playbooks they were built to be.

### ⭐ #1 HIGHEST-IMPACT NEXT ACTION
**Make a binding scope decision, then verify the current tree is green.** Concretely, as the very first move:
**Run `npm run build && npm run typecheck` (with the uncommitted 3D files either committed or stashed) to establish a known-good baseline**, and in parallel **decide the v1 shipping target** (Recommended: *"Single-player Hebrew typing+shortcuts game with real accounts and saved progress"* — i.e. close G1 + the shortcuts slice of G2, defer teacher/leaderboard/3D). Everything else in the plan branches from that decision. Without a green baseline + a scope line, the project will keep accreting features and stay stuck.

---

### Phase 0 — Triage & Baseline (½–1 day)
*Goal: know exactly what works today and freeze scope.*

- **0.1** Resolve the uncommitted 3D POC: commit behind a flag or `git stash` it so the tree is clean.
- **0.2** Run `npm install` (cold) → `npm run build` → `npm run typecheck` → `npm run test`. Record pass/fail. (Build NOT run in this pass per instructions.)
- **0.3** Re-run a Chrome/`agent-browser` smoke pass on the live demo's top 8 routes; confirm/close the 3 open bugs (battle avatars, home hydration, broken avatar img). Mark each FIXED/OPEN.
- **0.4** Reconcile the test claim: either restore the agent-generated tests or accept current 5 files as the real baseline and set a coverage target.
- **0.5** **Scope freeze:** write the v1 line (recommend the single-player+accounts target above) into `PROGRESS.md`. Defer G3/G4/G7/G9 explicitly.
- **0.6** Decide hosting: keep Vercel; provision a real Supabase project + env (`NEXT_PUBLIC_SUPABASE_*`) so auth/middleware activate.

### Phase 1 — MVP: make it a real product (1–2 weeks)
*Goal: a logged-in user keeps their progress, and the differentiator is visibly present.*

- **1.1 (G1) Wire real auth + persistence.** Activate Supabase (env in 0.6). Connect the 3 migrations. Replace localStorage-only progression with a sync layer: on auth, hydrate Zustand from Supabase `progress`/`gamification`; write through on lesson/battle completion. Keep localStorage as offline cache (merge-on-login). *This single change unblocks leaderboard, teacher, retention.*
- **1.2 (G2) Close the curriculum differentiator — at least 2 of the 4 missing pillars as graded lessons.** Prioritize **keyboard-shortcuts** (module already exists — promote it into the graded lesson track with XP/badges) + **Windows/file-management** (new graded lessons). Use `ninja-keyboard-design` for UI and the spec's 6-column matrix as the syllabus. This converts the market claim from aspiration to fact.
- **1.3 (G5) Quality gate.** Get `npm run verify` green; add tests for the new persistence + curriculum logic; close Phase-0 bugs. Establish CI (the `.github/` dir already exists).
- **1.4 Onboarding→placement→path (G10).** Stitch the existing onboarding + placement pages into one first-run flow that sets the age track and seeds the first lesson. First impression = retention.

### Phase 2 — Polish, social & reach (2–4 weeks, post-MVP)
*Goal: turn the real product into a compelling, sticky one.*

- **2.1 (G4) Real leaderboard** off the now-real Supabase data (school/age filters per spec). Replace `generateMockLeaderboard`.
- **2.2 (G3) Teacher/parent dashboard on real data** — class codes (code exists in `lib/auth/class-code`), student progress reads, parent reports. Replace `MOCK_STUDENTS`/`MOCK_CLASSES`. Wire the `student-list-mobile.tsx` messaging TODO.
- **2.3 (G6) Audio/voice completion** via `ninja-keyboard-voice` + `ninja-keyboard-suno`/`-music`: 9 missing voices, 8+ theme songs, jukebox cover art. Pipelines exist — this is batch execution.
- **2.4 (G2 cont.) Remaining pillars** — mouseless nav + multimodal awareness lessons; complete the 6-pillar curriculum the spec promises.
- **2.5 (G7/G8) Mobile + PWA offline** — on-screen Hebrew keyboard, touch support, finalize service-worker offline strategy (`lib/offline`).
- **2.6 (G9) 3D Ki** — only after a GLB exists; keep behind a flag. Lowest priority.
- **2.7 GEO/AEO + launch** — run the GEO protocol on the marketing surface before any public push; finalize a landing page.

---

## 5. Key File References
- Vision/spec: `docs/ninja-keyboard-spec-v9-FINAL.md`
- Auth (exists, unused live): `src/lib/auth/actions.ts`, `src/middleware.ts`, `supabase/migrations/`
- Curriculum (the gap): `src/lib/content/lessons.ts` (21 lessons, typing-only), `src/lib/content/shortcuts.ts`, `keyboard-shortcuts.ts`
- Mocks to replace: `src/app/(app)/leaderboard/leaderboard-client.tsx`, `src/app/(app)/teacher/page.tsx`, `src/lib/leaderboard/leaderboard-utils.ts`
- Persistence (localStorage-only): `src/stores/*` (all use `persist`)
- Game engines (solid): `src/lib/typing-engine/`, `src/lib/battle/ai-typing-engine.ts`
- 3D POC (uncommitted): `src/app/(app)/3d-poc/`, `src/components/characters/three-d/`, `docs/3d-poc/`
- Execution playbooks: `~/.claude/skills/ninja-keyboard-{battle,design,music,story,suno,voice}`


---
## Phase 0 baseline result (2026-06-07)
- `npm install` OK (16 vulns: 1 critical/5 high/9 mod/1 low — `npm audit` later, non-blocking).
- `npm run typecheck` (tsc --noEmit) → **GREEN**.
- `npm run build` → **GREEN** (~28 routes prerender).
- Conclusion: project is NOT stuck on build/types. Blocker is architectural (mock backend + typing-only curriculum), per plan above. Ready for Phase 1 once Elad confirms v1 scope.
- Untracked experimental 3D POC present (src/app/(app)/3d-poc, src/components/characters/three-d) — left untracked (defer per plan: 3D is last).
