# 2026-05-27 - Honest Source Status Panel on Dashboard V1

**Branch:** feat/honest-source-status-dashboard-v1
**Teacher Release:** NO (unchanged)
**Scope:** add a truthful "where does the data come from" panel to the dashboard,
so the teacher sees which data is automatic now vs which needs a Moodle report
import. Step A1 of the full data+design plan.

## Context

Yaniv observed that only students sync automatically (via NRPS), while grades,
chapters, tasks, and activity stay at 0. Reason: NRPS only provides the roster
(names). Grades need AGS or a Gradebook import; chapters/tasks/logs need Web
Services or a manual import. This panel makes that honest and visible - the
first step before deciding how to automate the rest.

## What changed

- src/pages/Dashboard.tsx:
  - New useSourceStatus() hook reads /api/capabilities/status (the existing live
    capability detector) and maps nrps/ags/gradebook/logs/moodle_ws statuses.
  - New SourceRow component renders each source with an honest badge:
    "אוטומטי" (available/configured), "חלקי" (partial), "ממתין ל-Moodle"
    (unknown), or "דרוש ייבוא" (missing).
  - New panel "מאיפה מגיעים הנתונים" lists: students+teachers (NRPS), grades
    (AGS or Gradebook import), chapters+tasks (import), activity+logs (Logs
    import), full automation (Web Services).

## Truth / safety rules honored

- Pure read of the existing capability detector; no invented "automatic" claims
  - each source shows its real status.
- No server logic, Truth Engine, auth, or governance changes.
- Does not touch the working NRPS auto-sync (#170) or scoped counts (#159).
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Why this is step A1

This panel reveals, on Yaniv's real launch, whether AGS is actually available
(ags_status = "available") - which determines whether automatic grade fetching
is possible without an external Web Services token. The next steps in the plan
depend on what this shows.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
