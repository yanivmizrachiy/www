# fix: Teacher Sidebar Final Workflow V1

**Date:** 2026-05-26
**Branch:** fix/teacher-sidebar-final-workflow-v1-20260526
**Status:** PR open, not merged

## What changed

`src/components/AppSidebar.tsx` — reorganized nav groups (MTH_TEACHER_SIDEBAR_FINAL_WORKFLOW_V1)

### Before

**ניווט (7 items):** מרכז המורה, תלמידים, ציונים, פרקים, משימות, פעילות/זמנים, דוחות
**כלים (4 items):** ייבוא חכם, ייצוא, אוטומציה, הגדרות
**תמיכה (1 item):** התקנה

### After

**ניווט (6 items):** מרכז המורה, תלמידים, ציונים, פעילויות, זמנים, דוחות
**כלים (8 items):** פרקים, משימות, ייבוא חכם, ייצוא, אוטומציה, אבחון(/missing-data), בידוד נתונים(/isolation), בדיקת יכולות(/capabilities)
**תמיכה (2 items):** הגדרות, התקנה

### Routes — no routes deleted

All routes remain in App.tsx. אבחון/בידוד/בדיקת יכולות were existing routes not previously linked in the sidebar.

## Checks (11/11)

- typecheck — OK
- build — OK
- doctor, moodle-automation, multi-teacher-safety, automation-capabilities — OK
- deep-launch-context, lti-probes, auto-extraction-source-router — OK
- multi-teacher-isolation-evidence, supabase-rls, capability-contract, evidence-log — OK
