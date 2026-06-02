# 2026-06-01 — Supabase RLS Plan-Only V1 (PR 20)

**Branch:** supabase-rls-plan-only-v1
**Teacher Release:** NO (unchanged)
**Mode:** plan-only / draft SQL. SQL NOT run. No DB changes. No production touch.

## Purpose

Prepare a reviewable DRAFT of teacher-scoped and course-scoped Row Level
Security policies for all sensitive tables. This is a plan, not a migration.
It builds on the existing readiness audit
(`audit:supabase-rls-isolation-readiness`) which reports that RLS is ENABLED
on all sensitive tables but NO policy exists (service-role-only / default-deny).

## What was added

- `supabase/manual_sql/teacher_scoped_rls_policies_draft_DO_NOT_RUN.sql` (new,
  draft only). Covers all 9 tables: students, courses, teachers, grade_items,
  grade_results, log_events, import_batches, teacher_sessions, lti_launches.
  - Documents two candidate scoping strategies (teacher-direct, course-membership).
  - All `CREATE POLICY` text is commented out; the file is plan/illustration only.
  - Assumptions are marked TODO and `לא אומת` rather than claimed as certain.
- This STATE progress note.

### Filename note (important for honesty)

The task named the file `teacher_scoped_rls_policies_draft.sql`. The readiness
audit treats any file whose name matches `DO_NOT_RUN` as a non-authoritative
draft and skips its content from enforcement. To avoid a draft FALSELY flipping
a table to "RLS_WITH_POLICY" / reducing the blocker count, the file carries the
`DO_NOT_RUN` marker: `teacher_scoped_rls_policies_draft_DO_NOT_RUN.sql`. This
keeps the audit's reported state honest (BLOCKER still present).

## SQL was NOT run

- No SQL executed in any environment. No migration applied.
- No connection to any database. No secrets/.env read. No live project IDs.
- No rows inserted. No fake/demo data.

## Live / manual review checklist (before this becomes a real migration)

- [ ] Confirm a teacher-authenticated read path actually exists (else reads stay
      service-role-only and policies add no runtime behavior). `לא אומת`.
- [ ] Confirm exact JWT/claim shape for teacher identity. `לא אומת`.
- [ ] Confirm/design course-ownership mapping (teacher_courses or verified
      courses.teacher_id) — separate reviewed migration. `לא אומת`.
- [ ] Decide per audit table whether any client SELECT is exposed (default: none).
- [ ] Apply only in a DISPOSABLE dev Supabase project first.
- [ ] Record live cross-teacher read-blocked verification in
      STATE/evidence-log.md before claiming DB-layer isolation. `לא אומת`.

## Not changed (protected)

- Applied Supabase schema migrations — untouched (no migration run).
- src/server.js runtime, env/secrets, Render settings — untouched.
- LTI launch flow / allowlist, manual import fallback, evidence logs,
  student sync behavior — untouched.
- PR #127 — untouched.
- Teacher Release — remains NO.

## How this avoids breaking the 216 synced learners

This PR adds only a commented-out draft `.sql` file and this doc. No SQL runs,
no schema/policy is applied, the service-role access path is unchanged, and the
import/sync pipelines are not touched. The 216 synced learners' data path is
identical before and after this PR.

## Checks

node --check src/server.js; npm run check; npm run build; npm run doctor;
npm run typecheck; audit:moodle-automation; audit:automation-capabilities;
audit:automation-capability-contract; audit:automation-evidence-log;
audit:auto-extraction-source-router; audit:multi-teacher-isolation-evidence;
audit:supabase-rls-isolation-readiness.

## Progress

Supabase teacher-scoped RLS track: ~25% (plan/draft documented; live policy
definition, dev testing, and live verification still pending). Teacher Release
remains NO.
