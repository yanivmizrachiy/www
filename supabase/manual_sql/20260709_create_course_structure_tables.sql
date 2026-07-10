-- ✅ APPLIED to the live DB on 2026-07-09 (verified via cowork: all three
--    tables now appear in information_schema.tables).
-- Create the three course-structure tables the app depends on but the live DB
-- is missing. Confirmed absent 2026-07-09 via a full information_schema.columns
-- snapshot of project ncoqanascubqkxfvucfz (the tables course_sections /
-- course_tasks / task_completions returned zero rows there).
--
-- Impact of them being missing today:
--   * The "Course structure import" (POST /api/import/course-structure) write
--     FAILS (PGRST205 relation-not-found), so chapters/tasks/completion never
--     persist.
--   * The read endpoints /api/imports/course-structure, /task-completion,
--     /student-reports and /student-profile query these tables, catch the
--     missing-table error, and fall back to empty — so Chapters, Tasks,
--     ChapterDetail and the task-completion reports show "no data" for every
--     teacher regardless of what was imported.
--
-- Column names/types below match EXACTLY what src/server.js writes
-- (buildCourseStructureImport -> writeCourseStructureToSupabase, upsert
-- onConflict "id"), so no code change is needed once these exist.
--
-- Safety: additive only (CREATE TABLE IF NOT EXISTS). Touches no existing
-- table or data. RLS is enabled with the SAME course-scoped policy shape the
-- existing grade_items / grade_results / import_batches tables already use
-- (public role sees only rows for current_setting('app.current_course_id');
-- the server uses the service_role key, which bypasses RLS, for all real work).
--
-- Run manually in the Supabase SQL Editor for project ncoqanascubqkxfvucfz,
-- then re-run a course-structure import to verify rows land.

-- 1. Chapters / sections of the course.
CREATE TABLE IF NOT EXISTS public.course_sections (
  id              UUID PRIMARY KEY,
  course_id       TEXT,
  import_batch_id UUID,
  chapter_name    TEXT,
  position        INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tasks / activities, each optionally under a section.
CREATE TABLE IF NOT EXISTS public.course_tasks (
  id              UUID PRIMARY KEY,
  course_id       TEXT,
  import_batch_id UUID,
  chapter_id      UUID,
  task_name       TEXT,
  task_type       TEXT,
  position        INTEGER,
  due_date        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Per-student × per-task completion state.
CREATE TABLE IF NOT EXISTS public.task_completions (
  id                 UUID PRIMARY KEY,
  course_id          TEXT,
  import_batch_id    UUID,
  task_id            UUID,
  chapter_id         UUID,
  student_id         UUID,
  student_full_name  TEXT,
  student_identifier TEXT,
  is_complete        BOOLEAN,
  status             TEXT,
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes for the course-scoped reads.
CREATE INDEX IF NOT EXISTS course_sections_course_idx   ON public.course_sections(course_id);
CREATE INDEX IF NOT EXISTS course_tasks_course_idx       ON public.course_tasks(course_id);
CREATE INDEX IF NOT EXISTS task_completions_course_idx    ON public.task_completions(course_id);
CREATE INDEX IF NOT EXISTS task_completions_student_idx   ON public.task_completions(student_id);

-- RLS — mirror the existing teacher_own_course_* pattern.
ALTER TABLE public.course_sections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_own_course_sections ON public.course_sections;
CREATE POLICY teacher_own_course_sections ON public.course_sections
  FOR ALL TO public
  USING (course_id = current_setting('app.current_course_id'::text, true));

DROP POLICY IF EXISTS teacher_own_course_tasks ON public.course_tasks;
CREATE POLICY teacher_own_course_tasks ON public.course_tasks
  FOR ALL TO public
  USING (course_id = current_setting('app.current_course_id'::text, true));

DROP POLICY IF EXISTS teacher_own_course_task_completions ON public.task_completions;
CREATE POLICY teacher_own_course_task_completions ON public.task_completions
  FOR ALL TO public
  USING (course_id = current_setting('app.current_course_id'::text, true));

-- Verify after running:
--   select table_name from information_schema.tables
--   where table_schema='public'
--     and table_name in ('course_sections','course_tasks','task_completions');
--   (expect all three rows)
