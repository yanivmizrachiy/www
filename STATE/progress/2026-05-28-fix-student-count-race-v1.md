# 2026-05-28 - Fix Student Count Race Condition V1

**Branch:** feat/fix-student-count-race-v1
**Teacher Release:** NO (unchanged)
**Scope:** root-cause fix for the recurring "59 students -> 0 students" bug.
The dashboard student count was fetched once on mount, before the auto-sync
finished saving the roster, and never refreshed - so it stayed at 0 until a
manual page refresh.

## Root cause (race condition)

1. Dashboard mounts -> useImportsOverview() fetches counts = 0 (roster not saved yet).
2. In parallel -> useAutoSyncStatus() POSTs the NRPS roster to /api/imports/nrps-sync.
3. The sync succeeds and 59 students are saved server-side.
4. BUT the overview count was already read as 0 and nothing told it to re-fetch.
5. Result: dashboard shows 0 until the teacher manually refreshes -> the
   "59 -> 0" pattern Yaniv kept seeing.

## What changed

- src/pages/Dashboard.tsx:
  - useAutoSyncStatus(onSuccess?) now accepts a success callback and calls it
    when the sync returns ok. The dashboard passes refresh from
    useImportsOverview, so the counts re-fetch immediately after the roster is
    saved. This removes the race.
  - Students card shows "מסנכרן…" instead of a misleading "0" while auto-sync
    is still running with a 0 count. Once sync succeeds and refresh() runs, the
    real number appears. (A real 0 after sync completes still shows as 0.)

## Truth / safety rules honored

- No invented data; "מסנכרן…" only shows during an actual in-flight sync, and a
  genuine post-sync 0 still shows as 0.
- Pure client data-flow fix; no Truth Engine, capability, auth, or server
  changes; the sync payload is unchanged.
- Builds on #170/#175/#177 (same auto-sync flow); does not alter their logic.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Expected result

Open the tool from Moodle -> students card briefly shows "מסנכרן…" -> then 59
(or the real count) WITHOUT a manual refresh. No more "59 -> 0".

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
