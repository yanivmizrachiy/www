-- URGENT SECURITY FIX — run in Supabase SQL Editor (project ncoqanascubqkxfvucfz)
-- Confirmed 2026-07-09: the live `teacher_sessions` table has a policy
--   "Allow select by session_token" ... SELECT USING (true)
-- which means ANY holder of the public anon key can read every row of this
-- table — every teacher's session_token, course_id, and moodle_username,
-- for every course, with zero authentication. A session_token is a bearer
-- credential: anyone who reads it here can call /api/bootstrap and
-- impersonate that teacher's session.
--
-- This SELECT-by-anyone policy was never actually needed: no client-side
-- code anywhere in the app queries teacher_sessions directly (verified by
-- grep across src/ — zero real usage, only auto-generated type defs).
-- All legitimate session verification happens server-side in src/server.js
-- using SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely and is
-- unaffected by this change.
--
-- This fix only REMOVES an overly-permissive read policy. It does not
-- delete data, does not change any column, and cannot break the running
-- server (which never used the anon key for this table).

DROP POLICY IF EXISTS "Allow select by session_token" ON public.teacher_sessions;

-- After running, verify no SELECT policy remains for the public/anon role:
-- select policyname, roles, cmd from pg_policies
-- where schemaname='public' and tablename='teacher_sessions';
-- (Expect: no row with roles={public} and cmd=SELECT.)
