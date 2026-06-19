# V7 Handoff — Supabase leaderboard wired (Shabbat run N, 2026-06-19)

## Goal (from contract.json, stream N_ninja)
Finish blocked integrations. Known blocker: Supabase SERVICE_ROLE_KEY for
real persistent leaderboard scores.

## What was found

### Supabase project status
- Project URL: `https://fyccvueeneldyhlhhzte.supabase.co`
- ANON key: in `.env.local.disabled` (real value, verified format)
- SERVICE_ROLE_KEY: **blank** — was never set, never generated
- DNS resolution: **FAIL** — project is PAUSED (free tier, 12 days old, no activity)
- Vercel prod env before this session: ONLY `NEXT_PUBLIC_SITE_URL` was set

### No service role key is needed
The RLS policies (`gamification_select_own`) only allow own-user reads.
A leaderboard requires cross-user reads. Solution: a `SECURITY DEFINER`
PostgreSQL function that bypasses RLS and is callable via the anon key.
This is standard Supabase practice and does NOT require the service role.

## What was shipped (commit 815cf51)

### 1. Migration 00005 (NOT YET APPLIED — pending project unpause)
`supabase/migrations/00005_leaderboard_function.sql`
- `get_leaderboard(p_limit INTEGER DEFAULT 20)` — SECURITY DEFINER, STABLE
- Joins `users + gamification`, returns id/name/avatar_id/xp/level/streak
- GRANT EXECUTE TO anon + authenticated (callable with anon key)
- **Apply via:** Supabase Dashboard SQL editor → paste + run, OR `supabase db push`

### 2. Leaderboard service
`src/lib/leaderboard/leaderboard-service.ts`
- `fetchLeaderboard(limit)` → Result<{entries, isReal}, LeaderboardError>
- Real path: `supabase.rpc('get_leaderboard', {p_limit: N})`
- Fallbacks: env absent → mock; RPC error → mock; throws → mock; empty DB → mock
- Maps `avatar_id` string to emoji; assignRanks + sortLeaderboard applied

### 3. Leaderboard client
`src/app/(app)/leaderboard/leaderboard-client.tsx`
- Converted from pure-client `useMemo(generateMockLeaderboard)` to
  real `useEffect + fetchLeaderboard` with loading state
- Shows "demo" notice when isReal=false, "live" notice when isReal=true

### 4. Database types
`src/types/database.ts` — added `get_leaderboard` to Functions type
so `supabase.rpc('get_leaderboard', {p_limit})` is fully typed

### 5. Tests (10 new)
`tests/unit/lib/leaderboard-service.test.ts`
- no-env path, RPC error, throws, empty-DB — all fall back to mock
- real-data path: isReal=true, entry count, rank assignment, emoji mapping, p_limit

### 6. Vercel env
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to
Vercel production. Previously only `NEXT_PUBLIC_SITE_URL` was there.

## Gates (all green)
- tsc: 0 errors
- unit tests: 1368/1368 (82 files) — was 1358
- build: exit 0, all routes static/ready
- live: `https://ninja-keyboard-nine.vercel.app` → 200, `/leaderboard` → 200

## What Elad needs to do to activate real leaderboard

1. **Unpause project:** https://supabase.com/dashboard/project/fyccvueeneldyhlhhzte
   (Project Settings → Pause/Resume)

2. **Apply migration 00005:**
   Option A — Dashboard: SQL Editor → paste `supabase/migrations/00005_leaderboard_function.sql` → Run
   Option B — CLI: `npx supabase link --project-ref fyccvueeneldyhlhhzte` → `npx supabase db push`

3. **No code change needed.** Once the project is unpaused and the function exists,
   `fetchLeaderboard()` will call the RPC and `isReal` will be `true`.

## Remaining stubs (honest list)
- No service role key exists anywhere (vault, env, memory). Not needed for
  the leaderboard. If needed for other purposes: Supabase Dashboard → Settings → API → Service role.
- WPM/accuracy leaderboard: `get_leaderboard()` currently sorts by XP.
  To add WPM: extend the function with `MAX(s.wpm)` from sessions table.
- Auth in prod: ANON_KEY is now set — enable by also setting any auth-required
  routes (currently middleware skips auth when env absent — now env IS set,
  so protected routes /home /profile etc. will redirect to /login on prod).
  **ACTION NEEDED:** verify the auth UX after unpause — guests will now hit
  redirects on protected routes.
- ElevenLabs (voice) + Suno (music): paid APIs, no keys found, deferred.
- teacher/parent dashboard: still demo.

## Auth redirect warning (important for Elad)
With `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` now set in
Vercel prod, the middleware NO LONGER skips auth. Routes in `PROTECTED_ROUTES`
(`/home /progress /profile /settings`) will redirect unauthenticated visitors
to `/login`. This is the INTENDED behavior for the v1.1 auth launch — but Elad
should be aware the guest-first experience for those pages is now gone.
Routes NOT protected (`/lessons`, `/battle`, `/drill`, `/shop`, `/leaderboard`,
`/`, `/about`, etc.) remain publicly accessible.
