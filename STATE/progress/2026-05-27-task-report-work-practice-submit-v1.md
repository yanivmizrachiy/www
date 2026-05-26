# 2026-05-27 - Task Report Work Practice Submit V1

**Branch:** feat/task-report-work-practice-submit-v1-20260527
**Teacher Release:** NO
**PR #127:** untouched

## Purpose

Upgraded task completion report with truthful distinction between "אין נתון" / "לא הושלם" / "הושלם", Excel export, and per-task completion dates.

## Changes

- `src/pages/reports/TaskReport.tsx` — full rewrite:
  - `is_complete === null` → "אין נתון" (HelpCircle icon, grey) — no source data
  - `is_complete === false` → "לא הושלם" (XCircle, red) — explicit false from real data
  - `is_complete === true` → "הושלם" (CheckCircle2, green) + completion date
  - Sorted alphabetically by student name (Hebrew)
  - Excel export (XLSX) with clear Hebrew labels
  - Legend at bottom explaining each symbol

## Checks

- check: PASS
- build: PASS
- typecheck: PASS
