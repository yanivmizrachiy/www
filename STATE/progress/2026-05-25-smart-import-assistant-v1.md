# 2026-05-25 - Smart Import Assistant V1

**Branch:** feat/smart-import-assistant-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new SmartImport page + route + dashboard links

## Purpose

Maximum-ease, no-admin, no-token, no-scraping import. The teacher drags ANY
real Moodle export (one file or several at once) into a single drop zone; the
app auto-detects the report type and routes each file to the correct importer
automatically. This removes the need for the teacher to know which of the four
type-specific import pages to use. It reuses 100% of existing infrastructure -
no new parsing, no new server endpoint.

## How it works (reuses existing infra)

- Uses the EXISTING src/lib/moodleImport.ts: parseMoodleFile() (CSV/XLSX/ODS)
  + detectReportType() (already classifies students/grades/logs/completion
  from real headers, with a confidence score).
- Posts to the EXISTING /api/import endpoint with the detected report_type and
  the parsed payload - the same endpoint the per-type pages already use.
- Confidence gate: files detected as "unknown" or below 60% confidence are
  flagged honestly and NOT imported (no wrong data).
- Supports multiple files at once; each shows its own status (detected type,
  confidence, rows, imported count, or an honest error) and a "צפה" link to
  the right screen on success.

## What was built

- src/pages/SmartImport.tsx (new): single drag-and-drop zone, per-file result
  cards, confidence gate, honest unknown/error states, and a pointer to
  /missing-data for the direct Moodle report links.
- src/App.tsx: /smart-import route.
- src/pages/Dashboard.tsx: hero "ייבוא חכם" button + "ייבוא חכם (מומלץ)" in the
  secondary menu (the old /import page is kept and still linked).

## Truth / safety rules honored

- No demo data, no fake rows. Only real parsed files are imported.
- Detection uses the existing real header-based detector; uncertain files are
  NOT imported (confidence gate), with an honest Hebrew message.
- No scraping, no stored session, no token. The teacher downloads their own
  file and drops it; the app only parses + posts to the existing endpoint.
- Per-file evidence (type, confidence, rows, imported count, errors) shown.
- Teacher Release stays NO.

## What was NOT touched

- src/server.js (/api/import reused as-is), src/lib/moodleImport.ts (reused),
  useImports, Truth Engine - unchanged.
- The four existing import pages remain functional and linked.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
