# 2026-05-25 — Supabase RLS Isolation Readiness V1

**Branch:** feat/supabase-rls-isolation-readiness-v1
**Teacher Release:** NO (unchanged)
**Mode:** audit-first, static analysis only, no migrations, no DB changes

## Purpose

Database-layer isolation readiness. Complements the code-level isolation
evidence (PR #125) by statically checking the Supabase SQL layer: which
sensitive tables exist, whether RLS is enabled, and whether teacher-scoped
policies are defined. Reports missing policy enforcement as a BLOCKER.

## What was built

- `scripts/checks/supabase-rls-isolation-readiness-audit.cjs` (new)
  - Marker: MTH_SUPABASE_RLS_ISOLATION_READINESS_V1
  - Static analysis of supabase/migrations + supabase/manual_sql.
  - Per sensitive table: defined? RLS enabled? policy exists? → status.
  - Emits transparent JSON. Never runs migrations, never connects to DB,
    never reads secrets/.env, never changes truth values.
- `docs/automation/SUPABASE_RLS_ISOLATION_READINESS.md` (new) — honest
  interpretation + required next steps.
- `package.json` — adds `audit:supabase-rls-isolation-readiness`.

## Findings (current truth)

RLS is ENABLED on all 9 sensitive tables (teachers, courses, students,
grade_items, grade_results, log_events, import_batches, teacher_sessions,
lti_launches). But NO CREATE POLICY exists for any of them.

Interpretation:
- RLS-enabled + no-policy = deny-all to non-bypassing clients. Data is not
  exposed via anonymous/teacher keys today.
- All access goes through the service role, which bypasses RLS by design.
- This is safe against accidental public exposure, but does NOT prove
  teacher-scoped DB isolation, because no policy ties a row to an
  authenticated teacher.

## BLOCKER (documented honestly, not treated as success)

teacher-scoped RLS policies are not yet defined. The audit reports
SUPABASE_RLS_READINESS_BLOCKER_PRESENT while still exiting 0 (it correctly
reports the state; it does not falsely claim success).

live_rls_enforcement_verified = false (never claimed from static analysis).

## Required next steps (NOT on production)

1. Define teacher-scoped CREATE POLICY statements in a new manual_sql file.
2. Test in a disposable dev Supabase project.
3. Record live verification (cross-teacher read correctly blocked) in
   STATE/evidence-log.md.
4. Only then is DB-layer isolation considered verified.

## Protected pipelines NOT changed

- .env, deploy config, Supabase migrations — untouched (no migration run).
- src/server.js runtime — untouched.
- LTI launch, Participants/Gradebook/Logs/Course Structure pipelines —
  untouched.
- automationCapabilities.ts / governance / types — untouched.
- STATE/evidence-log.md — untouched.
- UI — untouched.
- Teacher Release — remains NO.

## Checks (sandbox + Yaniv machine)

check, doctor, typecheck, build, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
