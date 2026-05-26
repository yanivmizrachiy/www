# 2026-05-26 - Teacher Date Time Duration Format V1

**Branch:** feat/teacher-date-time-duration-format-v1-20260526
**Teacher Release:** NO
**PR #127:** untouched
**SQL/deploy/secrets:** not touched

## Purpose

Unified, consistent date/time/duration formatting across all teacher-facing pages.

## Changes

### src/lib/teacherDateFormat.ts
- Added `formatTeacherTime(value)` → "20:31" (24h, padStart)
- Added `formatTeacherDateTime(value)` → "5/3/26 20:31"
- Added `formatTeacherDateFull(value)` → "יום שני, 25/05/2026"

### src/lib/duration.ts
- Fixed `formatDuration()` for Hebrew singular: "שעה" not "1 שעות", "דקה" not "1 דקות", with ו־ connectors
- Fixed `secondsToHebrewHms()` same singular fix

### Pages updated (all replaced toLocaleString/toLocaleDateString with central helpers)
- src/pages/StudentProfile.tsx (3 locations)
- src/pages/reports/DayReport.tsx
- src/pages/reports/StudentReport.tsx
- src/components/PracticeTimeSection.tsx (CSV export times)
- src/pages/SettingsPage.tsx
- src/components/LaunchDiagnostics.tsx
- src/pages/IsolationStatus.tsx
- src/pages/CapabilityProbe.tsx
- src/pages/IsolationLiveCheck.tsx (replaced local fmtDate)
- src/pages/Automation.tsx
- src/pages/ActivityPage.tsx (replaced local fmtDate)

## Checks

- check: PASS
- build: PASS
- typecheck: PASS
- doctor: pre-existing FAIL on main (secret_value_in_PROJECT_RULES.md) — not introduced here
- All audits: PASS

## What was NOT touched

- No runtime/server code
- No .env, SQL, deploy
- Teacher Release: NO
- PR #127: untouched
- All imports preserved
