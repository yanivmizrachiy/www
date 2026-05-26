# 2026-05-27 - Smart Zero States V1

**Branch:** fix/smart-zero-states-v1-20260527
**Teacher Release:** NO
**PR #127:** untouched

## Purpose

Distinguish "אפס אמיתי" (real zero from loaded data) from "לא נטען" (loading) and "חסר מקור" (no session/no data).

## Changes

- `src/pages/Dashboard.tsx`: `v()` helper now returns "..." while loading, "—" when no session or no data, and the real number (including 0) when loaded
- `src/pages/Grades.tsx`: when a grade cell has no corresponding row at all (`grade === undefined`), shows "אין נתון" instead of a blank/0

## Checks

- check: PASS
- build: PASS
- typecheck: PASS
