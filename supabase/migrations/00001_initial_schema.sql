-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  display_name TEXT NOT NULL,
  avatar_id TEXT DEFAULT 'fox',
  age INTEGER CHECK (age >= 4 AND age <= 120),
  auth_method TEXT NOT NULL DEFAULT 'email' CHECK (auth_method IN ('email', 'google', 'class_code', 'pin')),
  parent_id UUID REFERENCES public.users(id),
  pin_hash TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  code CHAR(6) UNIQUE NOT NULL,
  grade TEXT,
  max_students INTEGER DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Class members
CREATE TABLE public.class_members (
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'assistant')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (class_id, user_id)
);

-- Typing sessions (for analytics)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  wpm INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  key_stats JSONB DEFAULT '{}',
  emotional_flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progress tracking
CREATE TABLE public.progress (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  best_wpm INTEGER DEFAULT 0,
  best_accuracy NUMERIC(5,2) DEFAULT 0,
  stars INTEGER DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- Gamification
CREATE TABLE public.gamification (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  last_active DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Parental consents
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.users(id),
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_collection', 'progress_sharing', 'communication')),
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER progress_updated_at BEFORE UPDATE ON public.progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER gamification_updated_at BEFORE UPDATE ON public.gamification FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
