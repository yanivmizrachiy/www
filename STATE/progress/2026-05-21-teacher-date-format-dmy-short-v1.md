# Progress — Teacher Date Display Format D/M/YY

Date: 2026-05-21

## Requirement

All dates visible to teachers must be displayed as `D/M/YY`, for example `5/3/26`.

## What changed

- Added permanent rule to `RULES.md`.
- Added permanent rule to `PROJECT_RULES.md`.
- Added documentation in `docs/rules/TEACHER_DATE_DISPLAY_DMY_SHORT_V1.md`.
- Added central UI helper: `src/lib/teacherDateFormat.ts`.
- Updated dashboard teacher-facing date display to use the helper.
- Added audit script: `audit:teacher-date-format`.

## Boundaries

This is a UI/presentation rule only.

Do not change database storage, API payloads, evidence files, STATE files, technical logs or internal timestamps.
