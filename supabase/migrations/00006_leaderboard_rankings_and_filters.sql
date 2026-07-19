-- 00006_leaderboard_rankings_and_filters.sql
-- PENDING MANUAL APPLY: this migration is committed for review but MUST NOT be
-- applied automatically. Apply it manually after reviewing it against the live
-- Supabase schema. Migration 00005 remains the currently-live RPC until then.
--
-- Extends the existing get_leaderboard RPC (it does not create a parallel
-- service) with:
--   * XP, best-WPM, accuracy, streak, and improvement ranking
--   * age-group and class filters
--   * first-to-latest WPM/accuracy deltas for "אלופי השיפור"
--
-- Improvement is deliberately independent of raw speed: latest session WPM
-- minus first session WPM, with the accuracy delta as the tie-breaker.
-- Privacy: filters expose only the broad age group and class display name/id;
-- exact age, class join code, teacher identity, and parent data stay private.

BEGIN;

-- PostgreSQL cannot change a function's RETURNS TABLE shape with CREATE OR
-- REPLACE, so replace the 00005 one-argument signature transactionally.
DROP FUNCTION IF EXISTS public.get_leaderboard(INTEGER);

CREATE FUNCTION public.get_leaderboard(
  p_limit INTEGER DEFAULT 20,
  p_ranking TEXT DEFAULT 'xp',
  p_age_group TEXT DEFAULT NULL,
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id                   UUID,
  name                 TEXT,
  avatar_id            TEXT,
  xp                   INTEGER,
  level                INTEGER,
  streak               INTEGER,
  best_wpm             INTEGER,
  best_accuracy        NUMERIC,
  wpm_improvement      NUMERIC,
  accuracy_improvement NUMERIC,
  age_group            TEXT,
  class_id             UUID,
  class_name           TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  WITH session_metrics AS (
    SELECT
      s.user_id,
      MAX(s.wpm) FILTER (WHERE s.wpm IS NOT NULL) AS best_wpm,
      MAX(s.accuracy) FILTER (WHERE s.accuracy IS NOT NULL) AS best_accuracy,
      (ARRAY_AGG(s.wpm ORDER BY s.created_at ASC, s.id ASC)
        FILTER (WHERE s.wpm IS NOT NULL))[1] AS first_wpm,
      (ARRAY_AGG(s.wpm ORDER BY s.created_at DESC, s.id DESC)
        FILTER (WHERE s.wpm IS NOT NULL))[1] AS latest_wpm,
      (ARRAY_AGG(s.accuracy ORDER BY s.created_at ASC, s.id ASC)
        FILTER (WHERE s.accuracy IS NOT NULL))[1] AS first_accuracy,
      (ARRAY_AGG(s.accuracy ORDER BY s.created_at DESC, s.id DESC)
        FILTER (WHERE s.accuracy IS NOT NULL))[1] AS latest_accuracy
    FROM public.sessions s
    GROUP BY s.user_id
  ),
  eligible_users AS (
    SELECT
      u.*,
      COALESCE(
        u.age_group,
        CASE
          WHEN u.age BETWEEN 6 AND 7 THEN 'shatil'
          WHEN u.age BETWEEN 8 AND 9 THEN 'nevet'
          WHEN u.age BETWEEN 10 AND 11 THEN 'geza'
          WHEN u.age BETWEEN 12 AND 13 THEN 'anaf'
          WHEN u.age BETWEEN 14 AND 16 THEN 'tzameret'
          ELSE NULL
        END
      ) AS resolved_age_group
    FROM public.users u
    WHERE u.role = 'student'
  ),
  leaderboard_rows AS (
    SELECT
      u.id,
      u.display_name AS name,
      COALESCE(u.avatar_id, 'fox') AS avatar_id,
      COALESCE(g.xp, 0)::INTEGER AS xp,
      COALESCE(g.level, 1)::INTEGER AS level,
      COALESCE(g.streak_days, 0)::INTEGER AS streak,
      COALESCE(sm.best_wpm, 0)::INTEGER AS best_wpm,
      ROUND(COALESCE(sm.best_accuracy, 0), 2) AS best_accuracy,
      ROUND(COALESCE(sm.latest_wpm - sm.first_wpm, 0)::NUMERIC, 2)
        AS wpm_improvement,
      ROUND(COALESCE(sm.latest_accuracy - sm.first_accuracy, 0), 2)
        AS accuracy_improvement,
      u.resolved_age_group AS age_group,
      class_info.id AS class_id,
      class_info.name AS class_name
    FROM eligible_users u
    LEFT JOIN public.gamification g ON g.user_id = u.id
    LEFT JOIN session_metrics sm ON sm.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT c.id, c.name
      FROM public.class_members cm
      INNER JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.user_id = u.id
        AND cm.role = 'student'
        AND (p_class_id IS NULL OR c.id = p_class_id)
      ORDER BY c.name, c.id
      LIMIT 1
    ) class_info ON TRUE
    WHERE (p_age_group IS NULL OR u.resolved_age_group = p_age_group)
      AND (
        p_class_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.class_members selected_class
          WHERE selected_class.user_id = u.id
            AND selected_class.class_id = p_class_id
            AND selected_class.role = 'student'
        )
      )
  )
  SELECT
    lr.id,
    lr.name,
    lr.avatar_id,
    lr.xp,
    lr.level,
    lr.streak,
    lr.best_wpm,
    lr.best_accuracy,
    lr.wpm_improvement,
    lr.accuracy_improvement,
    lr.age_group,
    lr.class_id,
    lr.class_name
  FROM leaderboard_rows lr
  ORDER BY
    CASE LOWER(COALESCE(p_ranking, 'xp'))
      WHEN 'wpm' THEN lr.best_wpm
      WHEN 'improvement' THEN lr.wpm_improvement
      WHEN 'accuracy' THEN lr.best_accuracy
      WHEN 'streak' THEN lr.streak
      ELSE lr.xp
    END DESC,
    CASE
      WHEN LOWER(COALESCE(p_ranking, 'xp')) = 'improvement'
        THEN lr.accuracy_improvement
      ELSE lr.xp
    END DESC,
    lr.id
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 0), 100);
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(INTEGER, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER, TEXT, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER, TEXT, TEXT, UUID) TO authenticated;

COMMIT;
