# 2026-05-25 - Clean Visible Markers + English Dev-Text V1

**Branch:** feat/clean-markers-and-english-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI display only - remove internal/dev text leaking to users.

## Context (from the mega repo research)

Yaniv asked to remove all demo/explainer/"story"/English text site-wide. The
research found three concrete leaks of internal/developer text into the user UI:
1. Three import pages rendered a visible {MARKER} (grey MTH_..._V1 string at the
   bottom of the page).
2. The Automation page showed raw English nextTechnicalStep notes
   ("Do not refactor", "Use grade_items as fallback", etc.) under "השלב הבא:".
3. Demo/explainer subtitles ("קורא מה-Truth Engine. לא ממציא יכולות...",
   long Automation description).

## What changed

- src/pages/GradebookImport.tsx, src/pages/LogsImport.tsx: removed the visible
  {MARKER} <div> at the bottom. The invisible data-version attribute is kept.
- src/components/AutomationStatusPanel.tsx: no longer renders the raw English
  cap.nextTechnicalStep ("השלב הבא: ...") to the user; removed the explainer
  subtitle. The Truth Engine data itself is unchanged - only its on-screen
  display was removed.
- src/pages/Automation.tsx: shortened the page description to one clean line.

## Truth / safety rules honored

- Display-only edits. No capability data, governance, or Truth Engine source
  changed; automationCapabilities.ts itself untouched.
- All automation audits pass (capabilities, capability-contract, evidence-log,
  auto-extraction-source-router).
- Teacher Release stays NO.

## What was NOT touched

- automationCapabilities.ts, automationCapabilityGovernance.ts (Truth Engine
  source), server.js, hooks - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
