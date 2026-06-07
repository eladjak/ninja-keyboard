# Ninja Keyboard — Phase 1 Implementation Report

**Date:** 2026-06-07
**Branch:** `feat/phase1-persistence` (NOT merged, NOT pushed)
**Source of truth:** `docs/NINJA-PHASE1-BLUEPRINT-2026-06-07.md`
**Build state:** `npm run typecheck` GREEN · `npm run build` GREEN (exit 0) · 1197 tests pass (68 files)

> Implemented the store-boundary write-through + guest→account merge persistence layer, the additive migration, and hand-authored DB types. **No live Supabase project required** to compile or to run as guest — every sync call no-ops when env/user is absent, and the app stays on localStorage.

---

## What changed (files)

### New — schema & types
- `supabase/migrations/00004_phase1_player_state.sql` — **additive, NOT applied anywhere.** ALTERs `users` (adds `age_group` CHECK-constrained, `onboarding_completed` default false, `placement_result JSONB`); creates `player_state` (one row/user: `story JSONB`, `daily JSONB`, `migrated_at`, timestamps) with owner-scoped RLS (select/insert/update on `user_id = auth.uid()`) mirroring `00002`, and reuses the `update_updated_at` trigger from `00001`.
- `src/types/database.ts` — hand-authored `Database` type covering all 7 existing tables + `player_state`, including the 3 new `users` columns. Matches the migrations exactly; no `supabase gen types` needed against a live DB.

### New — sync layer (`src/lib/sync/`)
- `sync-user.ts` — module-level current-user holder. `isSupabaseConfigured()` (env check), `setSyncUser()` (set by provider), `getSyncUserId()` (returns null = skip sync when guest OR no env). This is the single gate that keeps guests on localStorage.
- `snapshot.ts` — the serializable `ProgressSnapshot` (xp/level/streak/lessons/badges/story/daily) + `emptyProgressSnapshot()` + `hasProgress()` heuristic.
- `merge.ts` — pure guest→account merge resolver: **max** on numeric bests/totals, **union** on lessons/badges/characters/flags/daily, server-wins-on-tie, summed attempts, stamps `migratedAt`.
- `merge.test.ts` — 8 Vitest cases for the merge resolver (the highest-risk code).
- `progress-sync.ts` — better-result service. `pushProgress`/`pushGamification`/`pushSession`/`pushPlayerState`/`pushUserTrack` (each a **no-op when no user/env**), `hydrateFromSupabase` (rebuilds `completedLessons` from `progress` rows), `pushSnapshot` (whole-snapshot merge-up). Raw `.from(...)` calls wrapped in try/catch → `Result` (3rd-party boundary).
- `debounce.ts` — per-key `debouncedPush` (1.5s) + `fireAndForget` (logs, never throws) for store write-throughs.

### New — hooks & providers
- `src/hooks/use-current-user.ts` — subscribes to `supabase.auth.onAuthStateChange`; immediately reports `guest` when env absent (no network).
- `src/components/providers/sync-provider.tsx` — on `SIGNED_IN`: hydrate; if server empty → push local guest progress up; if both have data → merge → apply to stores → push merged back → toast "התקדמות מהמכשיר הזה אוחדה לחשבון שלך". `migratedAt` ref guards double-merge per load. Mounted in `app-providers.tsx`.

### Edited — write-through wiring (zero call-site edits)
- `src/stores/xp-store.ts` — `completeLesson` → `pushProgress`; `addXp`/`updateStreak` → debounced `pushGamification` (pulls latest badges).
- `src/stores/badge-store.ts` — `earnBadge` → debounced `pushGamification` (badges live in the `gamification` row).
- `src/stores/practice-history-store.ts` — `addResult` → `pushSession` (append-only insert).
- `src/stores/story-store.ts` — all 7 mutators → debounced `pushPlayerState({story})` (key `player_state.story`).
- `src/stores/daily-challenge-store.ts` — `completeChallenge` → debounced `pushPlayerState({daily})` (key `player_state.daily`, distinct from story so they don't overwrite each other).

### Edited — clients, middleware, env
- `src/lib/supabase/{client,server,middleware}.ts` — threaded `<Database>` generic (calls were previously untyped `any`).
- `src/middleware.ts` — relaxed `PROTECTED_ROUTES` to account-only `['/home','/progress','/profile','/settings']` (removed `/lessons`,`/battle`) so guests can play. Unchanged env guard means auth is still enforced only when Supabase env is present.
- `.env.local.example` — added `NEXT_PUBLIC_SITE_URL` (was referenced at `actions.ts:35` but missing → OAuth redirect would be `undefined/callback`).

---

## Design notes / decisions

- **Single sync boundary = zero call-site edits.** All 9+ `addXp`/`completeLesson`/`addResult`/`earnBadge` call sites (both lesson UIs, practice, speed-test, shortcuts, games, onboarding) write-through automatically.
- **Circular import (xp↔badge store)** is safe: each only calls the other via `getState()` inside an action (runtime), never at module init.
- **Story/daily share `player_state` but use distinct debounce keys** so a story push and a daily push within 1.5s don't drop one another (`pushPlayerState` is a partial upsert).
- **better-result** at the service surface; `try/catch` only around raw `supabase.from(...)`.

## Not wired (deliberately, per DO scope)
- **Step D (graded shortcuts lessons)** — curriculum content addition; rides Step B persistence with no new sync code. Not in the DO list (items 1–8 were persistence/migration/merge). Left for a follow-up.
- **Step E (persist age_group/onboarding/placement)** — `pushUserTrack()` is implemented and hydrate reads the 3 fields, but the onboarding/placement components are not yet calling it. Ready to wire when those flows are touched.

---

## Activation steps (once a real Supabase project exists)

1. **Create the Supabase project**; get URL + anon key + service-role key.
2. **Set env** in `.env.local` (and Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, **`NEXT_PUBLIC_SITE_URL`**.
3. **Apply migrations in order**: `00001` → `00002` → `00003` → `00004` (review `00004` against the live project first; it is additive & RLS-safe).
4. **Configure Auth providers**: email/password ON; Google OAuth optional with redirect `${NEXT_PUBLIC_SITE_URL}/callback`.
5. **(Optional) regenerate types**: `supabase gen types typescript --project-id <id> > src/types/database.ts` and confirm it stays compatible (the hand-authored file already matches the migrations).
6. **Done.** Once env is present: middleware enforces auth on account-only routes, sync write-through activates, and login triggers hydrate + guest→account merge automatically. Guests (no login) continue on localStorage exactly as before.

No app run or migration apply was performed in this task.
