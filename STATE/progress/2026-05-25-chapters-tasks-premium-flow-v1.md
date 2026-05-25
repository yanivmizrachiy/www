# 2026-05-25 - Chapters Tasks Premium Flow V1

**Branch:** feat/chapters-tasks-premium-flow-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - Chapters.tsx + ChapterDetail.tsx

## Purpose

Roadmap PR 3. Turn the empty chapter stubs into a real premium flow:
פרקים ופעילויות -> click a chapter -> the real tasks in that chapter.
Real data only, honest empty states, reuses the PR 2 task visual classifier.

## What changed

- src/pages/Chapters.tsx (was a 1-line stub): premium Hebrew RTL list of real
  chapters from useCourseStructure. Each chapter is a clickable card linking to
  /chapters/:id, sorted by position, showing a real task count per chapter
  ("N משימות בפרק"). Clear empty state with an import CTA when no structure
  exists. Never invents chapters.
- src/pages/ChapterDetail.tsx (was a stub): shows the REAL tasks belonging to
  the clicked chapter (filtered by chapter_id), each rendered with the
  classified visual (icon + Hebrew label + color) from src/lib/taskTypeVisuals.
  Sorted by position, shows due_date when present. Back link to all chapters.
  Honest empty states: chapter not found, or no tasks linked to the chapter.

## Truth rules honored

- Only real chapters/tasks from useCourseStructure. No invented structure.
- Task counts computed only from tasks that carry a real chapter_id.
- Empty/missing states are explicit and honest, with import fallback CTA.
- Course Structure import + useCourseStructure hook preserved (read-only use).

## What was NOT touched

- useImports parser/hooks, server.js, taskTypeVisuals.ts (read-only reuse).
- Course Structure import endpoint - unchanged.
- LTI, Supabase, Truth Engine, Auto Extraction Router, Governance, Teacher
  Release gate, PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
