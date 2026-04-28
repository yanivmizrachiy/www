-- Reconstructed Schema for Moodle Teacher Hub
-- Generated from src/integrations/supabase/types.ts

-- Enums
CREATE TYPE moodle_domain AS ENUM ('students', 'grades', 'completion', 'logs');
CREATE TYPE domain_status AS ENUM ('proven', 'missing', 'blocked', 'calculated', 'imported');

-- Sites
CREATE TABLE moodle_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL UNIQUE,
  site_name TEXT,
  lti_consumer_key TEXT,
  lti_consumer_secret TEXT,
  ws_token TEXT,
  ws_token_status TEXT DEFAULT 'pending',
  consumer_guid TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE teacher_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id),
  session_token TEXT UNIQUE NOT NULL,
  course_id INTEGER NOT NULL,
  course_title TEXT,
  moodle_user_id INTEGER,
  moodle_username TEXT,
  role TEXT,
  launched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Import Batches
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  session_id UUID REFERENCES teacher_sessions(id),
  report_type TEXT NOT NULL,
  source_kind TEXT NOT NULL, -- 'file' or 'paste'
  status TEXT DEFAULT 'pending', -- 'completed', 'failed'
  row_count INTEGER DEFAULT 0,
  file_name TEXT,
  file_size_bytes BIGINT,
  detection_confidence FLOAT,
  column_mapping JSONB,
  warnings JSONB,
  imported_by_username TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Students
CREATE TABLE imported_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  external_id TEXT, -- Moodle user id
  external_username TEXT,
  first_seen_batch UUID REFERENCES import_batches(id),
  last_seen_batch UUID REFERENCES import_batches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, course_id, external_id)
);

-- Chapters
CREATE TABLE imported_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  chapter_name TEXT NOT NULL,
  position INTEGER,
  first_seen_batch UUID,
  last_seen_batch UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE imported_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  chapter_id UUID REFERENCES imported_chapters(id),
  task_name TEXT NOT NULL,
  task_type TEXT,
  position INTEGER,
  due_date TIMESTAMPTZ,
  first_seen_batch UUID REFERENCES import_batches(id),
  last_seen_batch UUID REFERENCES import_batches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, course_id, task_name)
);

-- Task Completion
CREATE TABLE imported_task_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  student_id UUID REFERENCES imported_students(id) NOT NULL,
  task_id UUID REFERENCES imported_tasks(id) NOT NULL,
  status TEXT, -- 'complete', 'incomplete'
  completed_at TIMESTAMPTZ,
  is_complete BOOLEAN DEFAULT false,
  raw_value TEXT,
  batch_id UUID REFERENCES import_batches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, task_id)
);

-- Grade Items
CREATE TABLE imported_grade_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT,
  max_grade FLOAT,
  first_seen_batch UUID REFERENCES import_batches(id),
  last_seen_batch UUID REFERENCES import_batches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, course_id, item_name)
);

-- Grades
CREATE TABLE imported_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  student_id UUID REFERENCES imported_students(id) NOT NULL,
  grade_item_id UUID REFERENCES imported_grade_items(id) NOT NULL,
  numeric_value FLOAT,
  raw_value TEXT,
  is_missing BOOLEAN DEFAULT false,
  batch_id UUID REFERENCES import_batches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, grade_item_id)
);

-- Log Events
CREATE TABLE imported_log_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES moodle_sites(id) NOT NULL,
  course_id INTEGER NOT NULL,
  student_id UUID REFERENCES imported_students(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  event_name TEXT,
  component TEXT,
  event_context TEXT,
  description TEXT,
  ip_address TEXT,
  origin TEXT,
  affected_user TEXT,
  raw_user_full_name TEXT,
  raw_user_username TEXT,
  batch_id UUID REFERENCES import_batches(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Views for Safe Access
CREATE VIEW moodle_sites_safe AS
SELECT id, site_url, site_name, consumer_guid, created_at, updated_at, 
       (ws_token IS NOT NULL) as ws_configured,
       (lti_consumer_key IS NOT NULL) as lti_configured,
       ws_token_status
FROM moodle_sites;
