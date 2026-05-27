# 2026-05-27 - Next Best Action Smart Guidance V1

**Branch:** feat/next-best-action-v1
**Teacher Release:** NO (unchanged)
**Scope:** strategic UX upgrade - turn the dashboard from "shows data" into
"tells the teacher what to do next". Based on what's already loaded vs what's
available from Moodle, recommend the single most useful next step with a
direct action button.

## What changed

- src/pages/Dashboard.tsx:
  - New computeNextAction() decision logic over the existing overview counts
    (students/grades/chapters/tasks/logs) and source statuses (AGS/NRPS).
    Returns the single most useful next step, never inventing one.
  - New NextBestActionPanel renders that recommendation with tone (info /
    action / success), title, description, and a direct CTA link.
  - Wired into the dashboard, between the hero and the source-status panel.
    useMemo so it only recomputes when underlying data changes.

## Recommendation rules (truthful, evidence-driven)

- No students -> "פתח את הכלי מתוך Moodle" (info, no CTA - happens automatically)
- Students but no grades + AGS available -> "הציונים בדרך, רענן" (info)
- Students but no grades + no AGS -> "ייבא Gradebook" + CTA to /smart-import
- Students+grades but no chapters -> "ייבא מבנה קורס" + CTA
- Students+grades+chapters but no logs -> "ייבא לוגי פעילות" + CTA
- Everything present -> "המידע מוכן, צור דוחות" + CTA to /reports

## Why this is the right strategic move

The teacher saw "59 תלמידים, 0 ציונים, 0 משימות" and had no idea what to do
next. The truthful source-status panel (#171) tells them WHAT is automatic vs
manual, but not what action to take. This panel answers the actual question:
"What should I do right now?"

It also reinforces honesty: when AGS is available, it tells them to wait; when
it's not, it tells them to import - no fake "loading forever" or empty zeros.

## Truth / safety rules honored

- No invented work; recommendations come from real counts + real capability
  statuses. No "auto" claims unless the source is actually available.
- Pure decision/presentation logic; no Truth Engine, capability, or server
  changes.
- Does not touch the existing flows from #170-#177.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
