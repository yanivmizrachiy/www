# 2026-05-25 - Isolation Live Check V1

**Branch:** feat/isolation-live-check-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new IsolationLiveCheck page + route + IsolationStatus link

## Purpose

The real, teacher-run two-space isolation test that was the last gap before
Teacher Release. Yaniv has two separate Moodle spaces, so the teacher can prove
isolation directly: open the tool from space A, snapshot it (course_id + title
+ live counts); open from space B, snapshot it; the tool compares and confirms
each space shows ONLY its own data, with no bleed-through.

## What was built

- src/pages/IsolationLiveCheck.tsx (new):
  - Reads the real session (course_id, course_title, teacher) + the real
    imports-overview counts for the CURRENT space.
  - "צלם מצב מרחב זה" saves a snapshot; persists via the artifact storage API
    so it survives re-launching from the other space. Keeps at most 2 distinct
    courses (replaces same-course snapshots).
  - Verdict: two DISTINCT course_ids with their own counts = isolation proven
    (the app is scoped per space); one course = needs a second space. The
    teacher visually confirms each card's numbers match the right space.
  - Honest: only real session data; nothing invented; Teacher Release stays NO
    until the check is completed and manually confirmed.
- src/App.tsx: /isolation-check route.
- src/pages/IsolationStatus.tsx: a card linking to the live check.

## Truth / safety rules honored

- Snapshots are real session + real counts only. No invented data.
- Same course twice is explicitly NOT treated as a valid two-space test.
- Persistence is optional (artifact storage); in-memory still works per session.
- Teacher Release stays NO; explicit closed-gate note.

## What was NOT touched

- server.js, useImports/useLtiSession (read-only), Truth Engine - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
