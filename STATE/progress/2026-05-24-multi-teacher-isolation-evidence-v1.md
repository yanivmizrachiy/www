# 2026-05-24 — Multi-teacher / Multi-course Isolation Evidence V1

**Branch:** feat/multi-teacher-isolation-evidence-v1
**Teacher Release:** NO (unchanged)
**Mode:** audit-first, static analysis only, no UI, no runtime changes

## Purpose

Before any pilot with a second teacher, prove — from the actual server code —
that the isolation invariants required for safe multi-teacher / multi-course
operation are PRESENT, and report the remaining LIVE blockers honestly.

This is the privacy gate: teacher A must never see teacher B's data; course A
must never mix with course B.

## What was built

- `scripts/checks/multi-teacher-isolation-evidence-audit.cjs` (new)
  - Marker: MTH_MULTI_TEACHER_ISOLATION_EVIDENCE_V1
  - Static analysis of src/server.js. Verifies 7 code-level invariants and
    emits a transparent JSON evidence report. Never reads secrets or rows.
- `package.json` — adds `audit:multi-teacher-isolation-evidence`.

## Code-level invariants verified (all PRESENT)

1. session_per_request — sessionFromRequest(req) resolves a unique session per
   request from token/cookie; no global shared state.
2. teacher_identity_scoped — ensureTeacher derives a stable teacherId from the
   session's Moodle user id / username (stableUuidFromText("teacher|" + ...)).
3. course_identity_scoped — ensureCourse creates/updates a course from the
   session courseId.
4. imports_scoped_to_batch — every import creates an import_batch tied to the
   session's teacherResult + courseResult; every row carries import_batch_id.
5. grades_course_scoped_ids — each grade_result stable id is derived from
   courseId, so two courses cannot collide.
6. no_hardcoded_pilot_identity — no hardcoded course 259 / pilot teacher in
   server.js.
7. diagnostics_aggregate_only — diagnostic endpoints declare
   no_raw_student_rows and no_raw_grade_rows.

## Remaining LIVE blockers (honest — not yet proven by this PR)

- live_two_teacher_test: run two real LTI launches from different
  teachers/courses and confirm queries return only the correct teacher's data.
- rls_enforcement: verify Supabase Row Level Security blocks cross-teacher
  reads at the DB layer, not only in code.
- teacher_release_gate: Teacher Release stays NO until the live test + RLS
  enforcement are recorded as evidence.

## How this advances the pilot

- Establishes the code-level isolation baseline as durable, checkable evidence.
- Defines exactly what the live two-teacher test must prove next.
- Keeps Teacher Release honestly NO until the live gate passes.

## Protected pipelines NOT changed

- Participants / Gradebook / Logs / Course Structure import — untouched.
- LTI launch (1.1 / 1.3) — untouched.
- Supabase migrations — untouched.
- automationCapabilities.ts / governance / types — untouched.
- STATE/evidence-log.md — untouched.
- Teacher Release gate — remains NO.
- No UI changed. No .env, no secrets, no deploy config touched.

## Checks (to run on Yaniv's machine + sandbox)

check, doctor, typecheck, build, audit:multi-teacher-safety,
audit:moodle-webservices-readiness, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence.
