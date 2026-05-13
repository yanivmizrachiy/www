-- Moodle Teacher Hub — teacher_sessions + lti_launches
-- Status: REVIEWED SOURCE ONLY. Apply via Supabase Studio after human review.
-- Purpose: persist LTI 1.1 and LTI 1.3 launches so store_launches/moodle_captures
--          stop being ephemeral memory-only counters on Render.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- teacher_sessions: server-side persisted LTI sessions
-- Already referenced in src/server.js line 276 and 2461
-- but the table was never confirmed to exist in production schema.
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token     TEXT NOT NULL UNIQUE,
  course_id         TEXT,
  course_title      TEXT,
  moodle_user_id    TEXT,
  moodle_username   TEXT,
  role              TEXT,
  lti_version       TEXT,            -- '1.1' or '1.3'
  issuer            TEXT,            -- LTI 1.3: iss claim
  client_id         TEXT,            -- LTI 1.3
  deployment_id     TEXT,            -- LTI 1.3
  launched_at       TIMESTAMPTZ DEFAULT now(),
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS teacher_sessions_token_idx ON teacher_sessions(session_token);
CREATE INDEX IF NOT EXISTS teacher_sessions_course_idx ON teacher_sessions(course_id);

ALTER TABLE teacher_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- lti_launches: aggregate audit log of every launch attempt
-- Used by /api/lti/diagnostics safe_counts.store_launches
-- ============================================================
CREATE TABLE IF NOT EXISTS lti_launches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lti_version       TEXT NOT NULL,   -- '1.1' or '1.3'
  ok                BOOLEAN NOT NULL DEFAULT false,
  verification_code TEXT,
  course_id         TEXT,
  teacher_name      TEXT,            -- DISPLAY ONLY, no PII pattern
  space_title       TEXT,
  source            TEXT,            -- e.g. 'lti11', 'lti13'
  raw_keys_count    INTEGER,         -- aggregate only, never the values
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lti_launches_course_idx ON lti_launches(course_id);
CREATE INDEX IF NOT EXISTS lti_launches_created_idx ON lti_launches(created_at);

ALTER TABLE lti_launches ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Multi-teacher isolation policies (skeleton — review before apply!)
-- ============================================================
-- These policies assume service_role bypass for backend writes,
-- and prevent client-side reads of cross-teacher data.

-- Policy: backend can write everything (service role bypasses RLS by default in Supabase)
-- Policy: client cannot read teacher_sessions at all (no SELECT policy)
-- Policy: client cannot read lti_launches at all (no SELECT policy)

-- ============================================================
-- DO NOT APPLY automatically. Review and run manually in Supabase Studio:
-- 1. Open Supabase Studio for project ncoqanascubqkxfvucfz
-- 2. SQL Editor → New query → paste this file
-- 3. Run → verify both tables appear in Table Editor
-- 4. After verification, update /api/persistence/validate required_tables list
-- ============================================================
