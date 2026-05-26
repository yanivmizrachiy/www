# fix: Scoped Imports Overview V1

**Date:** 2026-05-26
**Branch:** fix/scoped-imports-overview-v1-20260526
**Status:** PR open, not merged

## Problem

`GET /api/imports/overview` returned global store counts (all teachers, all courses):

```javascript
res.json({
  students_count: store.students.length,                              // GLOBAL
  grade_items_count: store.gradeItems.length || store.tasks.length,  // GLOBAL
  grades_count: store.grades.length,                                  // GLOBAL
  chapters_count: store.chapters.length,                              // GLOBAL
  tasks_count: store.tasks.length,                                    // GLOBAL
  log_events_count: store.logEvents.length || store.activitySessions.length, // GLOBAL
  batches: [...store.importBatches].reverse()                         // GLOBAL
});
```

## Fix

Switched to `importSessionFromRequest` (full token support) and applied the `inSpace` filter
already established by `/api/imports/grades-matrix` and `/api/student-detail`:

```javascript
const spaceId = session.spaceId || "unknown-space";
const inSpace = (row) => !row || (!row.space_id && !row.course_id) || row.space_id === spaceId || row.course_id === spaceId;
```

Students filtered by `space_id` (matching `/api/imports/students` pattern).
All other arrays filtered by `inSpace`.
`batches` returns `[]` — per-session batch list handled separately in a follow-up.

## Files changed

- `src/server.js` — `GET /api/imports/overview` replaced with scoped version
  - Marker: `MTH_SCOPED_IMPORTS_OVERVIEW_V1`

## Checks passed (11/11)

- `node --check src/server.js` — SYNTAX_OK
- `npm run build` — built in ~4.5s
- `npm run typecheck` — no errors
- `npm run doctor` — REPO_DOCTOR_OK
- `npm run audit:moodle-automation` — OK
- `npm run audit:multi-teacher-safety` — MTH_MULTI_TEACHER_SAFETY_AUDIT_OK
- `npm run audit:automation-capabilities` — CAPABILITY_REGISTRY_AUDIT_OK
- `npm run audit:deep-launch-context` — MTH_DEEP_LAUNCH_CONTEXT_AUDIT_OK
- `npm run audit:lti-probes` — DYNAMIC_LTI_PROBES_SANITY_OK
- `npm run audit:multi-teacher-isolation-evidence` — MTH_ISOLATION_EVIDENCE_AUDIT_OK
- `npm run audit:supabase-rls-isolation-readiness` — SUPABASE_RLS_READINESS_AUDIT_OK

## Safety invariants

- Teacher Release: NO — unchanged
- No fake data introduced
- No .env touched
- No migrations run
- No deploy triggered
- No student rows printed
