# 2026-05-25 - Import Loop Completion V1

**Branch:** feat/import-loop-completion-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI wiring only - moodleReportLinks.ts + MissingData.tsx

## Purpose

Completes the maximum-ease import loop. After PR #135 (direct Moodle report
links) and PR #137 (smart import auto-detect), this PR connects them so the
whole flow is seamless and lands in ONE place:

  "מה חסר" -> "פתח דוח ב-Moodle" (exact report) -> download -> drag into
  "ייבוא חכם" -> auto-detected + imported -> screens update.

## What changed (wiring only)

- src/lib/moodleReportLinks.ts: every report's importPath now points to
  /smart-import (was /import, /gradebook-import, /logs-import). Since the smart
  importer auto-detects the type, all "העלה לכאן" buttons can land in one place.
- src/pages/MissingData.tsx: the domain "עבור לייבוא דוח" button and the
  working-principle "ייבוא דוח Moodle" button now go to /smart-import.

## Truth / safety rules honored

- No new data paths, no demo data. Pure navigation wiring to the existing
  smart importer (which itself only imports real, confidently-detected files).
- The old per-type import pages remain functional and routed; nothing removed.
- Teacher Release stays NO.

## What was NOT touched

- SmartImport page logic, /api/import, moodleImport.ts parser - unchanged.
- server.js, useImports, Truth Engine, LTI, Supabase, Auto Extraction Router,
  Governance, Teacher Release gate, PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
