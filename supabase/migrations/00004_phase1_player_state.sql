-- 00004_phase1_player_state.sql
-- Phase 1: cross-device single-player progress (story/daily blob) + onboarding/track on user.
-- Additive only. RLS owner-scoped, consistent with 00002.
-- DO NOT apply blind — review against the live project before apply_migration.

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
