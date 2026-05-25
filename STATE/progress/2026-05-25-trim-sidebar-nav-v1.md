# 2026-05-25 - Trim Sidebar Navigation V1

**Branch:** feat/trim-sidebar-nav-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - AppSidebar navigation grouping

## Purpose

Yaniv asked for fewer buttons - only the big ones that lead to the information
he needs. The sidebar had 14 mixed items (info pages + many import actions).
This regroups them so the main nav shows only the 7 information pages, with
tools/imports moved to a separate collapsed group.

## What changed

- src/components/AppSidebar.tsx:
  - navItems (main "ניווט"): now only the 7 info destinations - מרכז המורה,
    תלמידים, ציונים, פרקים, משימות, פעילות / זמנים, דוחות.
  - new toolItems group ("כלים"): ייבוא חכם, ייצוא, אוטומציה ממודל, הגדרות.
    (The individual import pages /import, /gradebook-import, /logs-import,
    /course-structure-import remain routed and reachable via ייבוא חכם; they're
    just removed from the always-visible main list.)
  - supportItems ("תמיכה") unchanged: התקנה / חיבור Moodle.

## Truth / safety rules honored

- Pure navigation grouping; no pages removed, all routes still exist.
- No data, endpoints, or Truth Engine touched.
- Teacher Release stays NO.

## What was NOT touched

- All pages and routes remain; server.js, hooks, Truth Engine - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
