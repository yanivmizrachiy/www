# 2026-05-27 - Hebrew Import Headers V1

**Branch:** feat/hebrew-import-headers-v1
**Teacher Release:** NO (unchanged)
**Scope:** small polish - the Gradebook import page showed large English
"Gradebook" headers. Softened to Hebrew (keeping "Gradebook" in parentheses
once, since that is the Moodle feature name teachers recognize).

## What changed

- src/pages/GradebookImport.tsx:
  - "בחר קובץ Gradebook" -> "בחר קובץ גליון ציונים (Gradebook)"
  - button "בחר קובץ Gradebook" -> "בחר קובץ גליון ציונים"
  - "או הדבק טבלת Gradebook" -> "או הדבק את טבלת הציונים"

## Truth / safety rules honored

- Pure display text; no logic, data, Truth Engine, or server changes.
- "Gradebook" kept once in parentheses for recognition (it is the real Moodle
  feature name, not jargon to hide).
- Does not touch #170-#179 flows.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
