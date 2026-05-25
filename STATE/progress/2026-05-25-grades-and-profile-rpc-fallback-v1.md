# 2026-05-25 - Grades + Student Profile Node Fallback V1

**Branch:** fix/grades-rpc-fallback-v1
**Teacher Release:** NO (unchanged)
**Scope:** fix two "Could not find the function ..." Supabase RPC errors by
adding Node endpoints + Node-first fallback (the same pattern the students list
already uses).

## The bugs (both seen live by Yaniv)

1. Grades page: "Could not find the function public.lti_get_grades_matrix in the
   schema cache" - useGradesMatrix called a Supabase RPC that doesn't exist in
   the live DB, surfaced the raw error.
2. Student profile page: "Could not find the function
   public.lti_get_student_profile(...)" - same root cause in useStudentProfile,
   plus a weak grey raw-error design.

## Root cause

useImportedStudents already does Node-first (/api/imports/students) then falls
back to Supabase. useGradesMatrix and useStudentProfile skipped Node and went
straight to a non-existent RPC, so they always errored.

## What changed

- src/server.js: two new read endpoints, both with the same import-session +
  space-isolation guard as /api/imports/students, built from the in-memory store
  (no DB, no invented data):
  - GET /api/imports/grades-matrix -> { ok, students, items, grades }
  - GET /api/imports/student-profile?student_id=... -> { ok, student, grades,
    completion, activity }  (STUDENT_NOT_FOUND when absent)
- src/hooks/useImports.tsx:
  - useGradesMatrix: tries the Node endpoint first; on any failure sets empty
    arrays (not an error string) so the page shows its clean "אין נתוני ציונים"
    empty state instead of a raw RPC error.
  - useStudentProfile: tries the Node endpoint first; on failure sets data=null
    so the page shows a friendly empty state.
- src/pages/Grades.tsx: shortened the demo description.
- src/pages/StudentProfile.tsx: replaced the raw-error EmptyTruth with a clean
  Hebrew empty message.

## Truth / safety rules honored

- Endpoints return only real store data, space-isolated; missing stays missing.
- No invented grades/students/activity; numeric_value null => is_missing true.
- node --check + doctor secret-scan pass; all isolation/automation audits pass.
- Teacher Release stays NO.

## What was NOT touched

- Truth Engine, LTI auth/session/verification, Supabase writes, Auto Extraction
  Router, Governance, Teacher Release gate, PR 127 RLS draft, .env, deploy.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
