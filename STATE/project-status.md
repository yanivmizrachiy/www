# Project Status — Moodle Teacher Hub

Updated: 2026-05-17
Canonical branch: `main`
Live runtime: `https://www-tijc.onrender.com`
Teacher release: **NO**

## Verified real data

- Participants import succeeded: `students=62`.
- Real wide Gradebook import succeeded: `grade_items_written=243`, `grade_results_written=1693`.
- Real Moodle Logs import succeeded: `log_events_written=89995`, `skipped_rows=0`.
- Practice-time truth gate completed safely:
  - `practice_time_available=false`.
  - `blocker_key=NO_DURATION_FIELD`.
  - The Logs report contains no explicit official duration field.
  - Timestamp-window estimation is disabled: `window_estimation_enabled=false`.
  - No fake or invented practice time: `fake_time=false`.

## Verified infrastructure

- Canonical branch: `main`.
- Live release readiness endpoint works.
- Live persistence validation endpoint works.
- Supabase persistence is production-ready.
- Public diagnostics must remain aggregate-only.
- No student rows, grade rows, raw logs, secrets, Moodle exports, or private runtime files may be committed.

## Not done yet

- Multi-teacher or multi-course isolation validation.
- Teacher release final gate.
- Real Moodle launch validation with second teacher/course.
- Final teacher release runbook.

## Remaining blockers before Teacher Release YES

1. `multi_teacher_or_multi_course_isolation`
2. `teacher_release_final_gate`

## Current percentages

- Repo / code / automation / documentation: 99%
- Real-data pipeline: 98%
- Teacher release: **NO**
- Overall verified completion: 98%

## Next action

Do not change Participants, Gradebook, or Logs import code unless a verified bug appears.

Next work must focus only on:

1. Isolation evidence for a second teacher or second Moodle course.
2. Final release gate after isolation evidence exists.

Teacher Release must remain **NO** until these two gates pass.
