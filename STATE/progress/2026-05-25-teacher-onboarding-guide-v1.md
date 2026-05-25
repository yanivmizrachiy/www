# 2026-05-25 - Teacher Onboarding Guide V1

**Branch:** feat/teacher-onboarding-guide-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new TeacherOnboarding component + Dashboard wiring

## Purpose

Maximum-ease completion: a first-run guide so a teacher who just opened the
tool (or has no data yet) knows EXACTLY what to do. This is the last mile of
"easy" - not just easy tools, but a teacher who succeeds without help. No
ministry dependency, no token, no scraping.

## What was built

- src/components/TeacherOnboarding.tsx (new): a 3-step guide card matching the
  exact flow we built - (1) "מה חסר" to see what's missing + direct Moodle
  report links, (2) download the exact report from Moodle, (3) drag into
  "ייבוא חכם" which auto-detects and imports. Each step links into the real
  page. Honest note that only real data is shown and uncertain files are not
  imported.
- src/pages/Dashboard.tsx: shows the onboarding card right after the hero when
  there is no real data yet (no session, or all counts are zero). Once any
  real data exists, the card disappears automatically.

## Truth / safety rules honored

- Pure navigational guidance into existing real pages. No demo data, no fake
  counts, no invented state.
- Detects "empty" only from real imports-overview counts (students, grades,
  grade_items, tasks, logs). Disappears once real data exists.
- Teacher Release stays NO.

## What was NOT touched

- server.js, useImports (read-only), Truth Engine - unchanged.
- All existing dashboard sections preserved; onboarding is purely additive.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
