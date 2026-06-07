# Ninja Keyboard — Phase 1 Implementation Blueprint

**Date:** 2026-06-07
**Author:** Claude Code (planning pass — blueprint only, NO app code written, NO migrations applied)
**Scope source of truth:** `docs/NINJA-STATE-AND-PLAN-2026-06-07.md` §4 Phase 1, grounded in `docs/ninja-keyboard-spec-v9-FINAL.md`
**v1 line (approved):** *Single-player Hebrew typing + shortcuts game, with REAL accounts and saved progress (Supabase).* Defer: teacher dashboard (G3), leaderboard (G4), 3D (G9), mobile/on-screen-keyboard (G7), remaining curriculum pillars (mouseless/multimodal).

> This document is a blueprint. It contains a SQL **proposal** (do not apply blind) and ordered, file:line-targeted implementation steps. It does not change source code.

---

## 0. Binding vision constraints (cited) that affect persistence/auth/curriculum

From `docs/ninja-keyboard-spec-v9-FINAL.md` and the 6 `ninja-keyboard-*` skills:

1. **Six learning pillars** (`spec` §1.1 / state-plan §1.1, lines 14-23): computer literacy · touch typing · windows/file mgmt · **keyboard shortcuts** · mouseless · multimodal. **v1 covers pillars 2 (typing) + 4 (shortcuts) only** per the approved scope. Persistence must therefore track *typing progress* and *shortcuts progress*, with a schema that can later extend to `keys_mastered[]`, `shortcuts_mastered[]`, `mouseless_level`, `multimodal_completed[]` (`spec` lines 525-529) without a breaking migration.
2. **Progression model is sequential per-lesson gating.** Verified in code: `src/app/(app)/lessons/lesson-list-client.tsx:43-47` — lesson `level N` unlocks only when `lesson-(N-1)` is present in `completedLessons`. A lesson is "completed" only when `isLessonComplete(stats, targetWpm, targetAccuracy)` passes (`lesson-page-client.tsx:129-143`). **"Progress" = the `completedLessons` map (best WPM/accuracy/attempts per lesson) + total XP/level/streak + practice-session history.** This is the load-bearing state Phase 1 must persist to the backend.
3. **5 age tracks** shatil/nevet/geza/anaf/tzameret (`CLAUDE.md` line 23; `spec` line 493 `age_group`). The spec wants `age_group`, `onboarding_completed`, and `placement_test_result` **on the user record** (`spec` lines 493-501). The current migration only has `age INTEGER` + `settings JSONB` on `public.users` (`supabase/migrations/00001_initial_schema.sql:11-13`). v1 should persist the chosen track + onboarding/placement outcome so the first-run flow (G10) survives device change.
4. **Story gating** (`ninja-keyboard-story` skill; `src/stores/story-store.ts`): acts derive from highest completed lesson (`story-store.ts:174-185`), characters unlock via story flags. Story state (`unlockedCharacters`, `storyFlags`, `bossResults`, seen beats, dialog choices) is part of single-player progress and **should be persisted in v1** (it is part of "saved progress" and directly tied to lesson progression). It maps cleanly to a JSONB blob.
5. **Child-privacy by design** (`spec` §1.1; `consents` table already exists). RLS is mandatory — every table is already `ENABLE ROW LEVEL SECURITY` with owner-scoped policies (`00002_rls_policies.sql`). v1 must not weaken these. Guests (no account) must still be able to play with localStorage-only (the spec's "אפס חיכוך" / low-friction onboarding, lines 1244-1245).
6. **RTL / Hebrew / a11y / brand** (`CLAUDE.md` lines 21-28) — unchanged for Phase 1; no new UI surfaces beyond auth-state plumbing and a guest→account merge prompt.

**Net:** the schema and engines already match the vision's *typing+shortcuts+gamification+story* slice. The work is **wiring**, not redesign.

---

## 1. Current → Target wiring map (cited)

### 1.1 The 12 Zustand stores (all `persist` → localStorage)

| # | Store | localStorage key | Holds | v1 relevance |
|---|-------|------------------|-------|--------------|
| 1 | `xp-store.ts` | `ninja-keyboard-xp` (`:142`) | `totalXp, level, streak, lastPracticeDate, completedLessons{}` (`:36-59`) | **V1 CORE — sync** (→ `gamification` + `progress`) |
| 2 | `practice-history-store.ts` | `ninja-keyboard-practice-history` (`:121`) | `results[]` per-session WPM/accuracy/keyAccuracy (`:28-47`) | **V1 — sync** (→ `sessions`) |
| 3 | `badge-store.ts` | `ninja-keyboard-badges` (`:62`) | `earnedBadges{}` (`:9-24`) | **V1 — sync** (→ `gamification.badges`) |
| 4 | `story-store.ts` | `ninja-keyboard-story` (`:187`) | acts, unlocked chars, flags, boss results, seen beats, dialog choices (`:24-64`) | **V1 — sync** (→ `progress.story` JSONB) |
| 5 | `daily-challenge-store.ts` | `ninja-keyboard-daily-challenges` (`:59`) | `completedChallenges{}` (`:5-15`) | **V1 — sync** (→ `progress.daily` JSONB) |
| 6 | `consent-store.ts` | `ninja-keyboard-consent` (`:76`) | `consents[], studentAge, studentId` (`:11-39`) | V1 — partial (age→user; consents→`consents` table later. For v1 single-player keep local, persist `studentAge` to user) |
| 7 | `settings-store.ts` | `ninja-keyboard-settings` (`:70`) | app settings | **Defer** (device pref; optional → `users.settings`) |
| 8 | `accessibility-store.ts` | `ninja-keyboard-accessibility` (`:80`) | a11y prefs | **Defer** (device pref; optional → `users.settings`) |
| 9 | `theme-store.ts` | `ninja-keyboard-theme` (`:32`) | age theme | **Defer** (device pref; optional → `users.settings`) |
| 10 | `music-store.ts` | `ninja-keyboard-music` (`:188`) | music/jukebox prefs | **Defer** (device pref) |
| 11 | `typing-session-store.ts` | (transient, see file) | in-flight typing session | **N/A** — ephemeral, never persist |
| 12 | `ai-opponent-store.ts` | `ninja-keyboard-*` | battle opponent state | **Defer** (battle is single-player but not core v1 progress; persist later) |

**v1-relevant (must sync to Supabase):** #1 xp, #2 practice-history, #3 badges, #4 story, #5 daily-challenge, + `studentAge` from #6.
**Deferable (device-local prefs OK to keep localStorage):** #7 settings, #8 accessibility, #9 theme, #10 music, #12 ai-opponent. (Optionally mirror #7-9 into `users.settings` JSONB later for cross-device prefs — not required for v1.)
**Never persist:** #11 typing-session (transient).

### 1.2 Auth / middleware (NOT a hard no-op — env-gated)

- `src/middleware.ts:9-11` — **skips auth only when `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` are absent**. With env present, lines 13-35 enforce: redirect unauth'd from `PROTECTED_ROUTES` (`:4`) → `/login`; redirect auth'd from `AUTH_ROUTES` (`:5`) → `/home`. **So "un-no-op" = provision env + decide protected routes**, not rewrite middleware.
- **GAP:** `src/components/auth/auth-guard.tsx` (server component, redirects on no-user) **is never imported/used** (grep: zero hits). `src/app/(app)/layout.tsx` wraps only `<AppShell>` — no auth guard. Defense-in-depth currently = middleware only.
- Supabase clients ready: `src/lib/supabase/client.ts` (browser), `server.ts` (RSC, cookie-aware), `middleware.ts` (edge). All read `NEXT_PUBLIC_SUPABASE_*` with non-null `!` (`client.ts:5-6`).
- Server actions ready: `src/lib/auth/actions.ts` — `loginWithEmail` (`:8`), `loginWithGoogle` (`:30`), `registerParent` (`:48` — inserts `users` row), `joinClass` (`:88`), `createStudentProfile` (`:111` — inserts `users` + `class_members` + `gamification`), `logout` (`:169`).
- Auth UI exists: `src/app/(auth)/{login,register,join,student-setup}/page.tsx`, `callback/route.ts`; forms in `src/components/auth/*`.
- **Env expected** (`.env.local.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`. **Also referenced but missing from example:** `NEXT_PUBLIC_SITE_URL` (`actions.ts:35` OAuth redirect). Add it.

### 1.3 Write-through call sites (where persistence must hook in)

Progress is written at these exact points today (localStorage via Zustand `set`):

- `src/app/(app)/lessons/[id]/lesson-page-client.tsx:141-142` — `addXp(reward.total)` + `completeLesson(...)` on lesson pass.
- `src/components/typing/lesson-view.tsx:177-182` — `completeLesson` + `addXp` + `updateStreak` (alternate lesson UI).
- `src/app/(app)/practice/page.tsx:113-117` — `addXp` + `updateStreak` + `practiceHistory.addResult(...)`.
- `src/app/(app)/speed-test/page.tsx:107-111` — same triad.
- `src/app/(app)/shortcuts/shortcuts-client.tsx:61` — `addXp(xp)` (the v1 differentiator slice).
- `src/components/battle/battle-arena.tsx:222` — `addXp` (battle; defer sync).
- Games `word-rain`/`ninja-slice`/`letter-memory` `page.tsx` — `addXp` + `updateStreak` (defer or include via generic xp sync).
- `src/components/onboarding/{placement-test,first-lesson-magic}.tsx` — `addXp` (first-run).

**Integration strategy:** do NOT scatter Supabase calls across these 9+ sites. Instead make the **store the sync boundary** (see §2.2) so every existing `addXp`/`completeLesson`/`addResult`/`earnBadge` call automatically write-throughs when authenticated. Zero changes to call sites.

### 1.4 Schema: EXISTS vs MUST-CREATE

**Tables that EXIST** (`supabase/migrations/00001_initial_schema.sql`, RLS in `00002`, indexes in `00003`):
- `public.users` (`:5-17`) — id, role, display_name, avatar_id, **age**, auth_method, parent_id, pin_hash, **settings JSONB**, timestamps.
- `public.progress` (`:59-70`) — (user_id, lesson_id) PK, best_wpm, best_accuracy, stars, attempts, last_attempt_at. **← backs `completedLessons`.**
- `public.gamification` (`:73-82`) — user_id PK, xp, level, streak_days, **badges JSONB**, last_active. **← backs xp-store totals + badge-store.**
- `public.sessions` (`:42-56`, partitioned) — user_id, lesson_id, wpm, accuracy, duration_seconds, key_stats JSONB, emotional_flags. **← backs practice-history.**
- `public.classes`, `public.class_members`, `public.consents` (defer to Phase 2 for classes; consents used for child-privacy).

**MUST CREATE / ALTER for v1** (see §3 SQL proposal):
- **`progress` needs a JSONB column for story + daily-challenge blobs** (no table today holds story state). Proposal: add `progress` rows keyed by synthetic lesson_id OR — cleaner — a new `player_state` table (one row/user) holding `story JSONB`, `daily JSONB`, `completed_lessons JSONB` snapshot for fast hydrate. **Recommended: new `player_state` table** (avoids overloading the per-lesson `progress` grain).
- **`users` should gain `age_group TEXT`, `onboarding_completed BOOLEAN`, `placement_result JSONB`** to match spec lines 493-501 and let first-run survive device change. (Currently only `age INTEGER` + free-form `settings`.)
- **`gamification.completed_lessons` is NOT needed** — per-lesson detail lives in `progress`; the store's `completedLessons` map is reconstructed from `progress` rows on hydrate.
- **Generated TS types missing:** there is no `src/types/database.ts`. Must `supabase gen types` after schema is final (referenced by `supabase.ts:supabase.from('users')` calls which are currently untyped).

---

## 2. Phase-1 implementation plan (ordered, file:line targets)

### Step A — Provision backend + activate auth (G1 foundation)

- **A1.** Create a real Supabase project (or reuse one). Get URL + anon + service-role keys.
- **A2.** Add env to `.env.local` (local) and Vercel project env (prod):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (`.env.local.example:2-4`)
  - `NEXT_PUBLIC_APP_URL` (`:7`) **and add `NEXT_PUBLIC_SITE_URL`** (used at `actions.ts:35` — currently undefined → OAuth redirect would be `undefined/callback`). Update `.env.local.example` to include it.
- **A3.** Apply migrations `00001`→`00002`→`00003` to the project (via `npm run db:migrate` against a linked project, or Supabase MCP `apply_migration`). **Proposal in §3; do not apply until reviewed.**
- **A4.** Configure Supabase Auth providers: email/password ON; Google OAuth optional (set redirect `${NEXT_PUBLIC_SITE_URL}/callback`, matching `callback/route.ts`).
- **A5.** No middleware code change needed — once env is present, `middleware.ts:13-35` activates automatically. **Decision required:** confirm `PROTECTED_ROUTES` (`middleware.ts:4`) is the right v1 set. Recommendation for v1 single-player: keep `/home /lessons /battle /progress /profile /settings` protected, but allow a **guest mode** (see Step C) — i.e. either (a) add a `/play` public entry, or (b) relax protection so the typing surfaces are playable as guest and only `/profile`/`/progress` require login. **Recommended (b):** remove `/lessons` and `/battle` from `PROTECTED_ROUTES` so guests can play; keep `/home /progress /profile /settings` protected. This honors the low-friction vision (spec lines 1244-1245) while making accounts meaningful.
- **A6.** Defense-in-depth: wire `AuthGuard` (`auth-guard.tsx`) into the protected RSC layout for the *account-only* routes, OR leave middleware as the single gate. (Optional for v1; middleware is sufficient. If kept, only guard `/progress`,`/profile`.)
- **A7.** Generate types: `supabase gen types typescript ... > src/types/database.ts`; thread `Database` generic into the three `createClient`s (`client.ts:3`, `server.ts:7`, `middleware.ts:7`).

### Step B — Persist v1 progress to Supabase, with localStorage fallback (G1)

**Design: a single sync layer at the store boundary. Stores stay the API; sync is additive.**

- **B1. Create an auth/session hook** (`src/hooks/use-current-user.ts`, new): subscribes to `supabase.auth.onAuthStateChange`, exposes `{ user, status }`. Single source of "are we logged in" for the client.
- **B2. Create a sync service** (`src/lib/sync/progress-sync.ts`, new) with pure functions (return `Result` per better-result rule):
  - `hydrateFromSupabase(userId)` → reads `progress` (→ rebuild `completedLessons`), `gamification` (→ xp/level/streak/badges), `player_state` (→ story/daily), `users` (→ age_group/placement). Returns a snapshot to seed the stores.
  - `pushProgress(userId, lessonId, {bestWpm,bestAccuracy,stars,attempts})` → upsert `progress` (PK user_id+lesson_id).
  - `pushGamification(userId, {xp,level,streak,badges})` → upsert `gamification`.
  - `pushSession(userId, result)` → insert `sessions`.
  - `pushPlayerState(userId, {story,daily})` → upsert `player_state`.
  - All are **no-ops when no user** (guest) → localStorage remains the only store, unchanged.
- **B3. Wire write-through inside the v1 stores** (NOT at call sites). In each of `xp-store.ts`, `practice-history-store.ts`, `badge-store.ts`, `story-store.ts`, `daily-challenge-store.ts`, after the existing `set(...)` in the mutating actions, fire-and-forget the matching `push*` if a user is present. Specifically:
  - `xp-store.ts:87 completeLesson` → also `pushProgress`. `xp-store.ts:81 addXp` + `:107 updateStreak` → debounced `pushGamification`.
  - `badge-store.ts:31 earnBadge` → `pushGamification` (badges live in `gamification.badges`).
  - `practice-history-store.ts:58 addResult` → `pushSession`.
  - `story-store.ts` mutators (`markBeatSeen`, `unlockCharacter`, `setStoryFlag`, `recordBossResult`, `recordDialogChoice`) → debounced `pushPlayerState`.
  - `daily-challenge-store.ts:22 completeChallenge` → debounced `pushPlayerState`.
  - Use a small shared debounce (e.g. 1.5s) for high-frequency pushes (xp/story) to avoid write storms. Reading the current user inside a store: use a module-level subscription set by B1 (e.g. `setSyncUser(userId|null)`), not a React hook.
  - **better-result** for the service; `try/catch` only around the raw `supabase.from(...)` calls (3rd-party boundary), converting to `Result`.
- **B4. Hydrate on login** (`src/components/providers/app-providers.tsx:14` is the natural mount point, or a new `SyncProvider`): on `onAuthStateChange('SIGNED_IN')`, call `hydrateFromSupabase` then merge into stores via each store's setter (Zustand `setState`). **Server-side reads win on conflict** for cross-device correctness (take max(bestWpm), max(xp), union of badges/unlocked chars).
- **B5. Keep localStorage as offline cache** — Zustand `persist` stays on for all stores (already configured). On `SIGNED_OUT`, stores keep their last state (becomes the guest cache).

### Step C — Guest → account migration (the key risk; G1)

- **C1.** On `SIGNED_IN`, before/with hydrate, detect a non-empty local guest state (e.g. `useXpStore.getState().totalXp > 0` or `Object.keys(completedLessons).length > 0`).
- **C2.** If the server account is **empty/new** → push the local guest progress up (merge-up): write local `completedLessons`→`progress`, local xp/badges→`gamification`, local sessions→`sessions`, local story/daily→`player_state`. This makes "play as guest, then sign up keeps my progress" work.
- **C3.** If the server account **already has progress** → **merge, do not clobber.** Take `max` on numeric bests/xp/level/streak, union on `badges`/`unlockedCharacters`/`completedLessons` (keep the better per-lesson record). Surface a tiny non-blocking toast (`sonner` already mounted, `app-providers.tsx:18`): "התקדמות מהמכשיר הזה אוחדה לחשבון שלך".
- **C4.** Guard against double-merge: stamp a `migratedAt` marker in the merged snapshot / local store so re-login doesn't re-run merge-up.

### Step D — Curriculum: promote shortcuts into graded track (G2 slice — v1 differentiator)

*(Approved scope is "typing + shortcuts". The shortcuts module exists only as a standalone page; promote it to graded, XP-bearing lessons so v1 visibly delivers pillar 4.)*

- **D1.** Source: `src/lib/content/shortcuts.ts` / `keyboard-shortcuts.ts` (per state-plan §5). Define graded shortcut lessons mirroring `LESSONS` shape in `src/lib/content/lessons.ts` (`LessonDefinition`, `:14`), with `category: 'shortcuts'` and sequential `level`s continuing the gate model (`lesson-list-client.tsx:43-47`).
- **D2.** Ensure shortcut-lesson completion routes through the same `xpStore.completeLesson(...)` path so it persists identically (reuse `lesson-page-client.tsx:142` flow). No new persistence code — it rides Step B.
- **D3.** Use `ninja-keyboard-design` skill for UI consistency; `ninja-keyboard-battle` unaffected.

### Step E — Onboarding → placement → first lesson (G10) + persistence of track

- **E1.** Persist the chosen `age_group`, `onboarding_completed`, and `placement_result` to `users` (new columns, §3) at the end of the existing onboarding/placement components (`src/components/onboarding/placement-test.tsx`, `first-lesson-magic.tsx`) — only when authenticated; guests keep it in `consent-store.studentAge` / a local onboarding store.
- **E2.** On hydrate (B4), if `users.onboarding_completed` is true, skip first-run; else route into onboarding. Makes first-impression survive device change.

### Step F — Quality gate (G5)

- **F1.** `npm run typecheck` (must stay GREEN — was GREEN per state-plan line 156) after adding `database.ts` types + sync layer.
- **F2.** `npm run build` (was GREEN, line 157).
- **F3.** Add unit tests (Vitest) for the sync/merge logic — especially the **merge resolver** (max/union) in `progress-sync.ts` (highest-risk code). Target the guest→account merge cases from Step C.
- **F4.** Manual/agent-browser smoke: guest play → sign up → progress preserved; second device login → progress appears; lesson gate respects server state.
- **F5.** CI: `.github/` exists — add a workflow running `npm run verify` on PR.

---

## 3. SQL proposal (DO NOT APPLY — review first)

> Existing `00001/00002/00003` apply as-is. The following is a **new migration `00004_phase1_player_state.sql`**. It is additive and RLS-safe. Review against the live project before `apply_migration`.

```sql
-- 00004_phase1_player_state.sql
-- Phase 1: cross-device single-player progress (story/daily blob) + onboarding/track on user.
-- Additive only. RLS owner-scoped, consistent with 00002.

-- 1) Extend users with vision fields (spec lines 493-501) — nullable, no backfill needed.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS age_group TEXT
    CHECK (age_group IN ('shatil','nevet','geza','anaf','tzameret')),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS placement_result JSONB;  -- {level,wpm,accuracy,knownKeys[],recommendedStartLesson,...}

-- 2) One-row-per-user blob for state that has no relational grain yet:
--    story progression (acts/flags/unlocked chars/boss results/seen beats/dialog choices)
--    and daily-challenge completion map. Fast single-read hydrate.
CREATE TABLE IF NOT EXISTS public.player_state (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  story JSONB NOT NULL DEFAULT '{}',   -- mirrors src/stores/story-store.ts persisted shape
  daily JSONB NOT NULL DEFAULT '{}',   -- mirrors daily-challenge-store completedChallenges
  migrated_at TIMESTAMPTZ,             -- guest->account merge stamp (Step C4)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER player_state_updated_at
  BEFORE UPDATE ON public.player_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();  -- fn defined in 00001

ALTER TABLE public.player_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY player_state_select_own ON public.player_state
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY player_state_insert_own ON public.player_state
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY player_state_update_own ON public.player_state
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3) (Optional) teacher read of player_state for Phase 2 — DEFER. Not added in v1
--    to keep child-state private until teacher dashboard is real.
```

**Notes / decisions embedded:**
- `progress` (per-lesson) + `gamification` (totals) + `sessions` (history) are **reused unchanged** — they already match the stores. No ALTER needed there.
- Chose a `player_state` blob over overloading `progress` for story/daily (different grain). Story/daily are inherently document-shaped and read together on hydrate.
- `badges` stays in `gamification.badges JSONB` (matches `badge-store` shape) — no separate table for v1.
- All new policies mirror the owner-scoped pattern in `00002` — no RLS regression.

---

## 4. Risks & mitigations

| Risk | Why | Mitigation |
|------|-----|------------|
| **Guest→account clobber** | A new account hydrate could overwrite local guest progress (or vice-versa) | Merge resolver (max/union), server-wins-on-tie, `migrated_at` stamp, unit tests for merge (Step C, F3) |
| **RLS lockout / silent write fails** | Inserts to `users`/`gamification` require the row's `auth.uid()`; `registerParent`/`createStudentProfile` already insert `users` then `gamification` — order matters (FK + RLS). Single-player email signup currently uses `registerParent` (role=parent) — a self-serve **player** may need a `student`/`solo` path that also creates `gamification` | Confirm signup path creates `users` row before any `gamification`/`player_state` write; consider a `role='student'` self-signup or treat solo players as their own account. Test RLS with the anon key, not service-role |
| **Write storms** | `addXp`/story mutators fire often during a lesson | Debounce pushes (1.5s) at the store boundary; `progress`/`session` push only on completion |
| **`NEXT_PUBLIC_SITE_URL` undefined** | `actions.ts:35` builds OAuth redirect from it; missing in `.env.local.example` | Add to env + example (Step A2) |
| **Untyped supabase calls** | No `database.ts`; `.from('users')` is `any` → silent column typos | Generate types after schema final (Step A7), thread `Database` generic |
| **Middleware scope vs guest play** | If `/lessons` stays protected, guests can't play → kills low-friction vision | Relax `PROTECTED_ROUTES` to account-only routes (Step A5b) |
| **Partitioned `sessions`** | Table is `PARTITION BY RANGE(created_at)` with a DEFAULT partition (`00001:53-56`) — fine now, but high volume later needs partition maintenance | Acceptable for v1 (default partition catches all); note for Phase 2 |
| **Two lesson UIs** | Both `lesson-page-client.tsx` and `lesson-view.tsx` call `completeLesson` | Store-boundary sync (B3) covers both automatically — verify both paths in smoke test |
| **better-result vs Supabase throws** | Supabase client rejects/throws at boundary | Wrap raw `.from()` in try/catch → `Result` (per error-handling rule); business logic stays Result-based |

---

## 5. Ordered checklist (copy into PROGRESS.md when executing)

1. [ ] A1-A2 Provision Supabase + env (+ `NEXT_PUBLIC_SITE_URL`)
2. [ ] A3 Review & apply migrations 00001-00003 + proposed 00004
3. [ ] A4 Configure auth providers
4. [ ] A5 Decide & set `PROTECTED_ROUTES` (recommend account-only)
5. [ ] A7 `supabase gen types` → `src/types/database.ts`; thread generic
6. [ ] B1 `use-current-user` hook + module-level `setSyncUser`
7. [ ] B2 `progress-sync.ts` (Result-based push/hydrate + merge resolver)
8. [ ] B3 Write-through in 5 v1 stores (no call-site edits)
9. [ ] B4 Hydrate-on-login provider
10. [ ] C1-C4 Guest→account merge + dedupe stamp
11. [ ] D1-D3 Graded shortcuts lessons (v1 differentiator)
12. [ ] E1-E2 Persist age_group/onboarding/placement
13. [ ] F1-F5 typecheck + build + merge tests + smoke + CI

**Foundations first (A,B,C) before curriculum (D) before onboarding polish (E). Quality gate (F) continuous.**
