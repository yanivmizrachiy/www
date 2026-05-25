# 2026-05-25 - Premium Dashboard Teacher Counts V1

**Branch:** feat/premium-dashboard-teacher-counts-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - src/pages/Dashboard.tsx

## Purpose

Roadmap PR 5. The dashboard was already a strong premium Hebrew RTL Action Hub
(teacher name, space name, D/M/YY date, connection status, real counts of
students/grade-items/grades/chapters/activities/logs). The only gap vs the
Work Order was teacher count + teacher names. This PR adds that, safely.

## What changed (Dashboard.tsx only)

- Added a small self-contained useDashboardTeachers() hook that fetches the
  existing /api/lti13/nrps-preview endpoint (same one the Participants page
  uses). It exposes a real Instructor count and real instructor names only.
- Hero info grid: new "מורים במרחב" line showing teacher count + names ONLY
  when NRPS returns a real Instructor source; honest Hebrew message when the
  count exists without names, or when there is no real source. Never invents.
- Bottom stat grid: added a "מורים במרחב" StatCard (count when ready, else —).

## Truth rules honored

- Teacher count/names only from a real NRPS Instructor source.
- No invented teacher names; honest fallback messages.
- All existing real counts and the Action Hub layout preserved.
- Import fallback remains available (ייבוא דוחות) but not central.

## What was NOT touched

- useImports parser/hooks, server.js, Truth Engine - unchanged.
- The NRPS endpoint is only read, not modified.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
