# 2026-05-27 - Activities Chapters Teacher Flow V1

**Branch:** feat/activities-chapters-teacher-flow-v1-20260526
**Teacher Release:** NO
**PR #127:** untouched
**SQL/deploy/secrets:** not touched

## Purpose

Clean teacher flow: פעילויות → פרקים → משימות עם סוג, אייקון, ו-completion מאומת.

## Changes

- `src/components/AppSidebar.tsx`: "פעילויות" nav → `/chapters` (מורה רואה פרקי הקורס, לא לוגים)
- `src/pages/ChapterDetail.tsx`:
  - `due_date` מוצג בפורמט `D/M/YY` (formatTeacherDateDmyShort)
  - completion counts (כמה השלימו / לא השלימו / לא ידוע) מ-completion_summary אם קיים
  - אייקונים ✓/✗/? רק אם יש נתון אמיתי

## Checks

- check: PASS
- build: PASS
- typecheck: PASS
- All audits: PASS
