# Supabase RLS Isolation Readiness

**Status:** BLOCKER documented — teacher-scoped RLS policies not yet defined.
**Teacher Release:** NO (unchanged).
**Audit:** `npm run audit:supabase-rls-isolation-readiness`

## What this covers

Database-layer isolation readiness for multi-teacher / multi-course operation.
This complements the code-level isolation evidence (PR #125) by checking the
Supabase SQL layer.

## Current findings (from the audit, static analysis of repo SQL)

Row Level Security is ENABLED on all sensitive tables:
teachers, courses, students, grade_items, grade_results, log_events,
import_batches, teacher_sessions, lti_launches.

However, NO `CREATE POLICY` statements exist for these tables in the repo SQL.

## What this means (honest interpretation)

- With RLS enabled and no policy, the default behavior is **deny-all** for any
  client that does not bypass RLS. So data is not exposed to anonymous/teacher
  keys today.
- All current access goes through the **service role**, which bypasses RLS by
  design in Supabase. This is why imports and reads work today.
- This is safe against accidental cross-teacher exposure via the public key,
  but it does NOT yet prove **teacher-scoped** isolation at the DB layer,
  because there is no policy that ties a row to a specific authenticated
  teacher.

## Why this is a BLOCKER (not success)

For a real multi-teacher pilot where teachers might read via a scoped key,
the DB must enforce that teacher A's session can only read teacher A's rows.
That requires explicit `CREATE POLICY` definitions plus live verification.
Until then, teacher-scoped DB isolation is NOT proven.

## Required next steps (do NOT run on production)

1. Define teacher-scoped policies in a new `supabase/manual_sql/` file, e.g.
   policies that match a row's teacher_id / course_id against the
   authenticated session claims.
2. Test the policies in a disposable dev Supabase project.
3. Record a live verification (a scoped read that is correctly blocked
   cross-teacher) as evidence in STATE/evidence-log.md.
4. Only then may DB-layer isolation be considered verified — and Teacher
   Release still depends on the full release gate.

## Safety

This readiness layer is audit-only. It never runs migrations, never connects
to a database, never reads secrets or .env, never changes truth values, and
never promotes Teacher Release.
