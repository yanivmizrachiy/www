-- Supabase Migration: 00_initial_schema.sql
-- Description: Core tables for Moodle LTI Integration

-- 1. Create Moodle Sites table
CREATE TABLE IF NOT EXISTS public.moodle_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL,
    lti_consumer_key TEXT UNIQUE NOT NULL,
    lti_consumer_secret TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Teacher Sessions table
CREATE TABLE IF NOT EXISTS public.teacher_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES public.moodle_sites(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    course_id BIGINT,
    course_title TEXT,
    moodle_username TEXT,
    role TEXT CHECK (role IN ('teacher', 'student')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Row Level Security) - Basic Setup
ALTER TABLE public.moodle_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Initial Security Policy (Admin only for creation, teachers manage their sessions)
-- Note: These policies should be refined as the project moves to production
CREATE POLICY "Enable read for authenticated users" ON public.moodle_sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable session access by token" ON public.teacher_sessions FOR SELECT USING (true);
