# 2026-05-25 — Supabase RLS Teacher-Scoped Policies V1 (DRAFT ONLY)

**Branch:** feat/supabase-rls-policy-draft-v1
**Teacher Release:** NO (unchanged)
**Mode:** DRAFT_DO_NOT_RUN, audit-first, no SQL executed, no DB changes

## Purpose

Closes the BLOCKER surfaced by PR #126 (RLS enabled on 9 sensitive tables but
no teacher-scoped policy exists) — by proposing the policies as a reviewable
DRAFT, without running anything on production.

## What was built

- `supabase/manual_sql/20260525_teacher_scoped_rls_policies_DRAFT_DO_NOT_RUN.sql`
  (new): 10 CREATE POLICY statements (additive, non-destructive) covering
  teachers, courses, import_batches, students, grade_items, grade_results,
  log_events, teacher_sessions, lti_launches. Scoped by placeholder GUCs
  app.current_teacher_moodle_user_id and app.current_course_id (the real
  claim transport must be finalized in human review). Clearly marked
  DRAFT_DO_NOT_RUN with explicit "DO NOT RUN" warnings.
- `scripts/checks/supabase-rls-policy-draft-audit.cjs` (new): verifies the
  draft exists, is marked DRAFT_DO_NOT_RUN, contains no destructive SQL
  (strips comments first to avoid false positives on "NO DROP" prose), no
  secrets, defines CREATE POLICY for all required tables, expresses
  teacher/course scoping, never claims live RLS, never flips Teacher Release.
  Marker MTH_SUPABASE_RLS_POLICY_DRAFT_AUDIT_V1.
- `package.json`: adds audit:supabase-rls-policy-draft.

## Important safety design

- The draft contains ONLY CREATE POLICY (additive). No DROP / DELETE /
  TRUNCATE / ALTER ... DISABLE / GRANT ALL.
- The service role continues to bypass RLS by design; these policies would
  constrain only scoped/authenticated (non-service-role) access if/when that
  path is ever introduced.
- The claim transport (JWT claim vs request-local GUC) is intentionally a
  placeholder, to be finalized during human review before any run.

## What this does NOT do

- Does NOT run SQL. Does NOT modify production DB. Does NOT change migrations.
- Does NOT claim RLS is live/enforced/verified.
- Does NOT change Teacher Release (stays NO).
- Does NOT touch .env, secrets, deploy config, LTI, import pipelines, server
  runtime, or UI.

## Required next steps (NOT on production)

1. Human review of the policy logic and the real claim transport.
2. Apply + test in a disposable dev Supabase project only.
3. Record live verification (a scoped cross-teacher read correctly blocked)
   in STATE/evidence-log.md.
4. Only then consider controlled application. Teacher Release still depends on
   the full release gate.

## Checks (sandbox + Yaniv machine)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness,
audit:supabase-rls-policy-draft.
