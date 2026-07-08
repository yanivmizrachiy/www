-- Supabase Migration: 20260708_admin_users.sql
-- Description: Admin identity for Yaniv's private Control Center (/admin-hub).
-- This migration ONLY prepares the table, function and RLS. It does NOT insert
-- any admin — the first admin must be seeded manually once a real auth.users.id
-- exists (see the note at the bottom). No user is hardcoded.

-- 1. Admin users table — links a Supabase Auth user to an admin role.
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. is_admin(): true when the current authenticated user is an admin.
-- SECURITY DEFINER so it can read admin_users regardless of the caller's RLS,
-- with a locked search_path to avoid hijacking.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. RLS — no public read. Only an admin can read the admin_users table.
-- No INSERT/UPDATE/DELETE policy is defined on purpose: seeding the first admin
-- is done via the Supabase SQL editor / service role, never from the client.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins can read admin_users" ON public.admin_users;
CREATE POLICY "admins can read admin_users"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 4. Manual seeding (run once, in Supabase SQL editor, after Yaniv has an Auth user):
--   insert into public.admin_users (user_id, email, role)
--   values ('<AUTH_USERS_ID_OF_YANIV>', 'yanivmiz77@gmail.com', 'owner');
-- Until this row exists, is_admin() returns false for everyone and /admin-hub
-- shows "no admin permission" — no open admin, by design.
