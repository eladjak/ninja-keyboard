-- 00005_leaderboard_function.sql
-- A SECURITY DEFINER function that returns the top-N leaderboard rows.
-- Because it runs as the function owner (not the calling role), it bypasses
-- the RLS owner-scoped policies on gamification/users without needing the
-- service-role key. The anon key can call it via PostgREST RPC.
-- Safe: it SELECT-only, and exposes only display_name + avatar_id + aggregated
-- gamification stats. No PII, no email, no parent/class data.

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id        UUID,
  name      TEXT,
  avatar_id TEXT,
  xp        INTEGER,
  level     INTEGER,
  streak    INTEGER
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    u.id,
    u.display_name  AS name,
    COALESCE(u.avatar_id, 'fox') AS avatar_id,
    COALESCE(g.xp, 0)           AS xp,
    COALESCE(g.level, 1)        AS level,
    COALESCE(g.streak_days, 0)  AS streak
  FROM public.users u
  LEFT JOIN public.gamification g ON g.user_id = u.id
  ORDER BY COALESCE(g.xp, 0) DESC
  LIMIT p_limit;
$$;

-- Revoke direct execute from anon/public (PostgREST re-grants via its own
-- service role), then grant explicitly to the anon role so the RPC is reachable.
-- (Supabase automatically does this for public schema functions — kept explicit
-- for clarity and so the migration is idempotent on re-apply.)
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO authenticated;
