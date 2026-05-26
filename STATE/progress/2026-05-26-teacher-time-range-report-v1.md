# 2026-05-26 - Teacher Time Range Report V1

**Branch:** feat/teacher-time-range-report-v1-20260526
**Teacher Release:** NO
**PR #127:** untouched
**SQL/deploy/secrets:** not touched

## Purpose

New dedicated time range report page for teachers — estimates practice time per student from Moodle logs.

## Changes

- New page: `src/pages/TimeRangeReport.tsx` at route `/times`
  - Date range selector: יום זה / 7 ימים אחרונים / מותאם אישית
  - Per-student aggregated table (total time estimate, active days, events, sessions, last activity)
  - Excel export (XLSX)
  - Clear "הערכה לפי לוגים" disclaimer — never presents estimates as verified fact
- Updated `src/components/AppSidebar.tsx`: "זמנים" → `/times` (was `/activity`)
- Updated `src/App.tsx`: added `/times` route
- Fixed `src/components/PracticeTimeSection.tsx`: replaced remaining `toLocaleTimeString` with `formatTeacherTime`, and raw day string with `formatTeacherDateDmyShort`

## Checks

- check: PASS
- build: PASS
- typecheck: PASS
- All 7 audits: PASS
