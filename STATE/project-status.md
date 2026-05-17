# Project Status — Moodle Teacher Hub

Updated: 2026-05-17
Canonical branch: `main`
Live runtime: `https://www-tijc.onrender.com`
Teacher release: **NO**

## Verified

- Automation Core V1 merged into `main`.
- Live release readiness endpoint works.
- Live persistence validation endpoint works.
- Supabase persistence is production-ready:
  - `PRODUCTION_PERSISTENCE_READY=True`
  - `MISSING_TABLES_COUNT=0`
  - `BLOCKER=None`
- Participants import: students=62
- Real Gradebook import: grade_items_written=243, grade_results_written=1693
- Real Moodle Logs import: log_events_written=89995, skipped_rows=0
- Practice-time truth gate: practice_time_available=false, blocker_key=NO_DURATION_FIELD
  - Moodle Logs report contains no explicit duration field.
  - Timestamp-window estimation is disabled (window_estimation_enabled=false).
  - No fake or invented practice time (fake_time=false).

## Not done yet

- Multi-teacher or multi-course isolation validation.
- Teacher release final gate.
- Real Moodle launch validation with second teacher/course.
- Reports and export full flow.
- Teacher release runbook.

## Remaining blockers before Teacher Release YES

1. `multi_teacher_or_multi_course_isolation`
2. `teacher_release_final_gate`

## Current percentages

- Repo Cleanup & Finalization Plan: 18%
- Automation Core + Live + Supabase: 92%
- Teacher product readiness: 82%
- Teacher release: NO
