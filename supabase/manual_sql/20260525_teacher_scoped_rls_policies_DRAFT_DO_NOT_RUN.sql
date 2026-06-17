-- ============================================================================
-- MTH_TEACHER_SCOPED_RLS_POLICIES_DRAFT_V1
-- supabase/manual_sql/20260525_teacher_scoped_rls_policies_DRAFT_DO_NOT_RUN.sql
-- ============================================================================
--
-- STATUS: DRAFT_DO_NOT_RUN
--
-- This is a DRAFT proposal for teacher/course-scoped Row Level Security
-- policies. It MUST NOT be run on production. It MUST be reviewed by a human,
-- tested in a disposable dev Supabase project, and only then considered for
-- controlled application with recorded evidence.
--
-- WHY THIS FILE EXISTS:
-- PR #126 found that RLS is ENABLED on all sensitive tables but NO CREATE
-- POLICY exists. Today all access goes through the service role (which
-- bypasses RLS by design), so data is not exposed to anonymous/teacher keys
-- (default-deny). These draft policies are the proposed path to prove
-- teacher-scoped isolation at the DB layer IF/WHEN scoped (non-service-role)
-- access is ever introduced.
--
-- IMPORTANT SAFETY NOTES:
-- - This file contains ONLY CREATE POLICY statements (additive, non-destructive).
-- - There is NO DROP, NO DELETE, NO TRUNCATE, NO ALTER ... DISABLE here.
-- - The service role continues to bypass RLS; these policies constrain only
--   scoped/authenticated access paths.
-- - The exact claim mechanism (how the authenticated teacher identity reaches
--   Postgres, e.g. a JWT claim or a request-local GUC like
--   current_setting('request.jwt.claims') or a custom app.current_teacher_id)
--   MUST be finalized during review. The policies below are written against a
--   placeholder GUC `app.current_teacher_moodle_user_id` and
--   `app.current_course_id` to make the scoping intent explicit and reviewable.
--   These placeholders are NOT wired to anything in production.
--
-- DO NOT RUN. DRAFT ONLY. Teacher Release remains NO.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper intent (review note, not executed logic):
-- A scoped teacher session must expose, to Postgres, at least:
--   app.current_teacher_moodle_user_id  -> matches teachers.moodle_user_id
--   app.current_course_id               -> matches *.course_id / courses.moodle_course_id
-- The reviewer must decide the real transport (JWT claim vs GUC) before any run.
-- ----------------------------------------------------------------------------

-- === teachers ===============================================================
-- A teacher row is visible only to that teacher (by moodle_user_id).
CREATE POLICY mth_teachers_scoped_select ON public.teachers
  FOR SELECT
  USING (
    moodle_user_id = current_setting('app.current_teacher_moodle_user_id', true)
  );

-- === courses ================================================================
-- A course is visible only when it matches the teacher's current course scope.
CREATE POLICY mth_courses_scoped_select ON public.courses
  FOR SELECT
  USING (
    moodle_course_id = current_setting('app.current_course_id', true)
  );

-- === import_batches =========================================================
-- A batch is visible only when it belongs to the teacher's current course.
CREATE POLICY mth_import_batches_scoped_select ON public.import_batches
  FOR SELECT
  USING (
    course_id = current_setting('app.current_course_id', true)
  );

-- === students ===============================================================
-- Students are visible only through batches in the teacher's current course.
CREATE POLICY mth_students_scoped_select ON public.students
  FOR SELECT
  USING (
    import_batch_id IN (
      SELECT id FROM public.import_batches
      WHERE course_id = current_setting('app.current_course_id', true)
    )
  );

-- === grade_items ============================================================
CREATE POLICY mth_grade_items_scoped_select ON public.grade_items
  FOR SELECT
  USING (
    course_id = current_setting('app.current_course_id', true)
  );

-- === grade_results ==========================================================
CREATE POLICY mth_grade_results_scoped_select ON public.grade_results
  FOR SELECT
  USING (
    course_id = current_setting('app.current_course_id', true)
  );

-- === log_events =============================================================
CREATE POLICY mth_log_events_scoped_select ON public.log_events
  FOR SELECT
  USING (
    course_id = current_setting('app.current_course_id', true)
  );

-- === teacher_sessions =======================================================
-- A session row is visible only to the teacher who owns it.
CREATE POLICY mth_teacher_sessions_scoped_select ON public.teacher_sessions
  FOR SELECT
  USING (
    moodle_user_id = current_setting('app.current_teacher_moodle_user_id', true)
  );

-- === lti_launches ===========================================================
-- A launch row is visible only to the teacher who owns it (by moodle_user_id).
CREATE POLICY mth_lti_launches_scoped_select ON public.lti_launches
  FOR SELECT
  USING (
    moodle_user_id = current_setting('app.current_teacher_moodle_user_id', true)
  );

-- ============================================================================
-- END OF DRAFT. DO NOT RUN. Review + dev-test + record evidence before any use.
-- Teacher Release remains NO until live RLS verification is recorded.
-- ============================================================================
