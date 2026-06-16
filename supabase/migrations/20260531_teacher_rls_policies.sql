-- MTH_RLS_TEACHER_POLICIES_V1
-- Teacher-scoped RLS policies for all sensitive tables
-- SAFE: read-only analysis was done first. Run only after review.

-- students
CREATE POLICY "teacher_own_space_students" ON students
  FOR ALL USING (space_id = current_setting('app.current_space_id', true));

-- grade_items  
CREATE POLICY "teacher_own_space_grade_items" ON grade_items
  FOR ALL USING (space_id = current_setting('app.current_space_id', true));

-- grade_results
CREATE POLICY "teacher_own_space_grade_results" ON grade_results
  FOR ALL USING (space_id = current_setting('app.current_space_id', true));

-- log_events
CREATE POLICY "teacher_own_space_logs" ON log_events
  FOR ALL USING (space_id = current_setting('app.current_space_id', true));

-- import_batches
CREATE POLICY "teacher_own_space_imports" ON import_batches
  FOR ALL USING (space_id = current_setting('app.current_space_id', true));

-- teacher_sessions
CREATE POLICY "teacher_own_sessions" ON teacher_sessions
  FOR ALL USING (space_id = current_setting('app.current_space_id', true));

-- lti_launches
CREATE POLICY "teacher_own_launches" ON lti_launches
  FOR ALL USING (space_id = current_setting('app.current_space_id', true));
