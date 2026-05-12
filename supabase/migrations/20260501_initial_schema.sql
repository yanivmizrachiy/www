-- Moodle Teacher Hub reviewed minimal schema
-- Status: REVIEWED SOURCE ONLY. Do not run on production Supabase before a final human review.
-- Purpose: support verified LTI sessions and Manual Real Data Import batches without demo data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS moodle_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT,
  site_name TEXT,
  lti_consumer_key TEXT UNIQUE,
  lti_consumer_secret TEXT,
  consumer_guid TEXT,
  ws_token_status TEXT DEFAULT 'unavailable',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id),
  session_token TEXT UNIQUE NOT NULL,
  course_id TEXT,
  course_title TEXT,
  moodle_user_id TEXT,
  moodle_username TEXT,
  role TEXT,
  launched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE teacher_sessions ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES moodle_sites(id);
ALTER TABLE teacher_sessions ADD COLUMN IF NOT EXISTS moodle_user_id TEXT;
ALTER TABLE teacher_sessions ADD COLUMN IF NOT EXISTS launched_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE teacher_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours');

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id TEXT NOT NULL,
  session_id UUID REFERENCES teacher_sessions(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('students', 'grades', 'logs', 'completion', 'unknown')),
  source_kind TEXT NOT NULL CHECK (source_kind IN ('upload', 'paste')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'partial', 'pending')),
  row_count INTEGER NOT NULL DEFAULT 0,
  file_name TEXT,
  file_size_bytes BIGINT,
  detection_confidence DOUBLE PRECISION,
  column_mapping JSONB,
  warnings JSONB DEFAULT '[]'::jsonb,
  imported_by_username TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS launch_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_key TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'blocked')),
  reason TEXT,
  course_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE moodle_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_attempts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE moodle_sites IS 'Real Moodle sites/spaces configuration. No demo data.';
COMMENT ON TABLE teacher_sessions IS 'Verified Moodle LTI teacher sessions. Must not be created from unverified LTI requests.';
COMMENT ON TABLE import_batches IS 'Real Moodle report import batches. Row-level parsed data comes in later migrations only after review.';
COMMENT ON TABLE launch_attempts IS 'LTI launch audit trail without storing secrets.';
