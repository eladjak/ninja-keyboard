CREATE INDEX idx_sessions_user_created ON public.sessions(user_id, created_at DESC);
CREATE INDEX idx_gamification_xp ON public.gamification(xp DESC);
CREATE INDEX idx_classes_code_active ON public.classes(code) WHERE is_active = true;
CREATE INDEX idx_progress_user ON public.progress(user_id);
CREATE INDEX idx_class_members_user ON public.class_members(user_id);
CREATE INDEX idx_users_parent ON public.users(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_consents_parent ON public.consents(parent_id);
