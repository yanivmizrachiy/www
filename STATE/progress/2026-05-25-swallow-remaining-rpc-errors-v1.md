# 2026-05-25 - Swallow Remaining RPC Errors V1

**Branch:** fix/grades-rpc-fallback-v1 (second commit)
**Teacher Release:** NO (unchanged)
**Scope:** stop surfacing raw "Could not find the function ..." Supabase RPC
errors on the Activity, Chapters, and Practice-time views.

## Context

Yaniv hit the same "Could not find the function public.lti_get_*" error on more
pages: Activity (lti_get_activity_overview) and Chapters/course structure
(lti_get_course_structure). Inventory of all 11 RPC hooks showed three still did
setError(e.message), which surfaced the raw DB error to the user; the rest
already swallowed errors to a clean empty state.

## What changed

- src/hooks/useImports.tsx: useCourseStructure, useActivityOverview, and
  usePracticeTime now set error=null and data=null on RPC failure (instead of
  setError(e.message)). The pages already have a clean "no data" empty state,
  so they now show that instead of the raw error. (The other 8 hooks were
  already safe; the grades + profile hooks got real Node endpoints in the prior
  commit on this branch.)
- src/pages/ActivityPage.tsx, src/pages/Chapters.tsx: shortened the demo
  description text.

## Truth / safety rules honored

- No invented data; failures degrade to a clean empty state.
- No server, Truth Engine, auth, or governance changes.
- Teacher Release stays NO.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
