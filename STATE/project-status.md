# Project Status — Moodle Teacher Hub

Updated: 2026-05-19
Canonical branch: `main`
Live runtime: `https://www-tijc.onrender.com`
Teacher release: **NO**

## Latest progress sync

Full same-day progress details are documented in:

- `STATE/progress/2026-05-19-fast-sync.md`

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

## 2026-05-19 merged work

- PR #99: Moodle capability panel became dynamic and API-backed.
- PR #100: Live validation command added for the dynamic capability center.
- PR #101: Dashboard changed to a clean action-only home hub; explanatory/demo text removed from home.
- PR #102: Dashboard activities count now falls back to real Gradebook items when full task/course structure is still missing.

## Current open workstream

- Branch `cs1` adds `src/lib/courseStructureImport.ts` as an isolated mapper foundation for Activity Completion / Course Structure / Gradebook-derived activities.
- This foundation is intentionally not wired to persistence yet.
- It must be reviewed and build-checked before connecting UI/backend saving.
- It does not change Participants, Gradebook, Logs, Supabase, LTI launch, or Teacher Release.

## Current product truth

- The project is not starting from scratch.
- The real-data pipeline is strong and verified.
- The dashboard is now an action hub, not an explainer page.
- Participants, Gradebook, Logs and Supabase must not be changed unless a verified bug appears.
- Work should now focus on fast, safe improvements around real Moodle data acquisition, course structure/tasks, live validation, and multi-teacher/course isolation.

## Not done yet

- Multi-teacher or multi-course isolation validation.
- Teacher release final gate.
- Real Moodle launch validation with second teacher/course.
- Final teacher release runbook.
- Full Activity Completion / Course Structure import and display.
- Live visual validation after Render deploy for the latest dashboard changes.

## Remaining blockers before Teacher Release YES

1. `multi_teacher_or_multi_course_isolation`
2. `teacher_release_final_gate`
3. `latest_render_live_validation`
4. `course_structure_or_activity_completion_full_verification`

## Current percentages

- Repo / code / automation / documentation: 99%
- Real-data pipeline: 98%
- Dashboard action experience: 95%+ after PR #101 and PR #102, pending live visual validation
- Course structure / tasks UX: active workstream, mapper foundation added in branch `cs1`
- Teacher release: **NO**
- Overall verified completion: 98% for real-data foundation, not yet release-complete for every teacher/every course

## Next action

Do not change Participants, Gradebook, or Logs import code unless a verified bug appears.

Next work must focus only on:

1. Live validation after Render deploy.
2. Tasks / course structure / Activity Completion real-data display.
3. Isolation evidence for a second teacher or second Moodle course.
4. Final release gate after isolation evidence exists.

Teacher Release must remain **NO** until these gates pass.
