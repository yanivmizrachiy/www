# 2026-06-01 - Activity And Chapters Real Flow V1

**Branch:** activity-and-chapters-real-flow-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - ChapterDetail.tsx + CourseTask type in useImports.tsx

## Purpose

Roadmap PR 17. Turn chapters/activities into a real, source-backed flow:
פרקים ופעילויות -> click a chapter -> the real activities in that chapter,
each surfacing TYPE, STATUS, and a real Moodle LINK — truthfully.

## What changed

- src/pages/ChapterDetail.tsx: each activity row now explicitly surfaces three
  facts, every one of them truthful and never invented:
  - TYPE: classified visual (icon + Hebrew label + color) from the existing
    task visual classifier. When the source carries no usable type signal the
    classifier already returns "סוג לא ידוע" (neutral) — no invented type.
  - STATUS: derived ONLY from the real per-task completion summary
    (complete/incomplete/unknown). Shown as a short Hebrew label
    ("הושלם" / "טרם הושלם" / "הושלם חלקית (n/total)"). When the source has no
    completion data for the task it reads "אין נתון" — never invented.
  - MOODLE LINK: rendered as a real "פתח ב-Moodle" link ONLY when the source
    actually provides an absolute http(s) URL (safeMoodleUrl rejects relative /
    empty / non-http values). When absent it reads "אין קישור Moodle". We never
    generate or guess a URL.
- src/hooks/useImports.tsx: CourseTask interface gained OPTIONAL `moodle_url`
  and `status` fields so a real URL/status flows through if the source/RPC ever
  provides it. They are usually absent today (the Activity Completion import
  does not carry them), so the UI shows the honest fallbacks above.

## Truth rules honored

- No fake links: a URL is shown only if it is a real absolute http(s) value.
- No invented type/status: explicit "סוג לא ידוע" / "אין נתון" fallbacks.
- Only real chapters/tasks from useCourseStructure; counts/status from the real
  completion summary. No hard-coded 216/222/6, no demo content.
- Hebrew RTL preserved; premium card styling kept.

## What was NOT touched

- server.js endpoints, course-structure import parser, Supabase RPC/migrations.
- LTI launch/allowlist, student sync (216 synced learners unaffected — read-only
  UI change), Teacher Release gate, PR #127 RLS draft, manual import fallback,
  evidence logs, .env / Render / deploy.
- Chapters.tsx, Tasks.tsx, ActivityPage.tsx, routes/sidebar — unchanged.

## Live Moodle check (לא אומת)

- Whether the live course-structure RPC ever returns a real `moodle_url` per
  task: לא אומת. With no URL the UI correctly shows "אין קישור Moodle".
- Real per-task status against a live imported Activity Completion report: לא
  אומת in this sandbox (no live session here).

## Checks

- node --check src/server.js — PASS
- npm run check — PASS
- npm run build — PASS
- npm run doctor — PASS (REPO_DOCTOR_OK)
- npm run typecheck — 4 PRE-EXISTING errors in GradebookImport.tsx (unrouted,
  not touched); zero new errors from changed files (verified via git stash).
- npm run audit:moodle-automation — PASS
- npm run audit:automation-capabilities — PASS
- npm run audit:automation-capability-contract — PASS
- npm run audit:automation-evidence-log — PASS
- npm run audit:auto-extraction-source-router — PASS
- npm run audit:multi-teacher-isolation-evidence — PASS
- npm run audit:supabase-rls-isolation-readiness — PASS (RLS blocker documented,
  Teacher Release stays NO)

## Progress

Chapters/activity real-flow surface: ~90% (UI truthfully renders type/status/
link from real data with honest fallbacks). Remaining ~10% depends on the
source/RPC actually carrying per-task Moodle URLs + granular type — לא אומת.
