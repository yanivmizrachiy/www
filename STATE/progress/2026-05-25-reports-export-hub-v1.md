# 2026-05-25 - Reports Export Hub V1

**Branch:** feat/reports-export-hub-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - src/pages/Reports.tsx

## Purpose

Roadmap PR 6 (last UI PR). Turns the Reports stub (a flat row of buttons) into
a premium Hebrew RTL reports hub, and surfaces the existing Export page.

## What changed (Reports.tsx only)

- Premium hub: 4 described report cards (students, tasks, days, gaps) each
  linking to the existing real-data report pages
  (/reports/students, /reports/tasks, /reports/days, /reports/gaps).
- Each card has a Hebrew title + description explaining what real data it
  shows, with premium gradient styling consistent with the dashboard.
- Added an Export section linking to the existing /export page.

## Truth rules honored

- No fake reports, no fake filters, no fake rows. The cards only link to the
  existing report pages, which already render real-data-only.
- "חסר נשאר חסר" stated in the gaps card description.

## What was NOT touched

- src/pages/reports/* (StudentReport, TaskReport, DayReport, GapReport) -
  unchanged (they already work on real data).
- src/pages/Export.tsx - unchanged (only linked to).
- useImports parser/hooks, server.js, Truth Engine - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
