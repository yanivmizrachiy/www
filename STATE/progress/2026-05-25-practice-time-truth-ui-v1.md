# 2026-05-25 - Practice Time Truth UI V1

**Branch:** feat/practice-time-truth-ui-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - src/pages/ActivityPage.tsx

## Purpose

Roadmap PR 4. Make the activity/time page truthful by SEPARATING two things
that must never be conflated:
  1) Log evidence (FACT): event counts, active days, first/last activity -
     straight from imported real logs.
  2) Practice time (ESTIMATE): sessionization-derived durations. Moodle logs
     record events, not durations, so there is NO verified duration source.
     The UI now states this explicitly and never presents sessionization as
     verified practice time.

## What changed (ActivityPage.tsx only)

- Section 1 "ראיות פעילות (מתוך לוגים אמיתיים)" tagged "עובדה": real
  events_count, max active_days per student (never summed across students),
  first/last event dates (D/M/YY). Honest empty state when no logs imported.
- Section 2 "זמן תרגול" tagged "הערכה - לא מאומת": an explicit Hebrew
  disclaimer that Moodle logs record events not duration, that real practice
  time cannot be computed without a verified duration source, and that the
  numbers below are a sessionization ESTIMATE, not verified time. The existing
  PracticeTimeSection (which works) is kept but reframed honestly as an
  estimate (title "הערכת זמן תרגול יומי (sessionization)").
- Section 3 "אירועים אחרונים": real recent events with D/M/YY dates.

## Truth rules honored

- Log evidence (fact) is clearly separated from practice time (estimate).
- Sessionization is NOT presented as verified practice time; it carries an
  explicit "הערכה - לא מאומת" badge + disclaimer.
- Logs import is NOT removed. No invented duration. Missing stays missing.
- No audit claims a verified duration rule, so no verified-time claim is made.

## What was NOT touched

- src/components/PracticeTimeSection.tsx - unchanged (reused, reframed via
  title prop + surrounding disclaimer only).
- useImports parser/hooks, server.js, Truth Engine - unchanged.
- Logs import, LTI, Supabase, Auto Extraction Router, Governance, Teacher
  Release gate, PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
