# 2026-05-26 - Premium Pages Audit V1

**Branch:** feat/premium-pages-audit-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI - remove remaining "אמת/אמיתי/אמיתיים/מומצא" filler from all main
pages; shorten ActivityPage sessionization warning.

## Context

After PRs #156 and #157, a sweep of all main pages found residual "truth"
filler words ("האמיתית", "אמיתי", "נתוני אמת מ-Moodle", "מנתוני אמת בלבד",
"sessionization" jargon, "אמיתיים"). This PR removes them all.

## What changed (pure presentation — no logic, data, or server touched)

- src/pages/Students.tsx: "האמיתית" removed from description.
- src/pages/Dashboard.tsx: subtitle "נתוני אמת מ-Moodle" → "לוח הבקרה של המורה".
- src/pages/Grades.tsx: "אמיתי" removed from description; EmptyDomain
  description shortened.
- src/pages/ActivityPage.tsx:
  - h2 "לוגים אמיתיים" → "לוגים".
  - 2× "Logs אמיתי" → "Logs" in EmptyTruth messages.
  - Sessionization amber warning: 3-line explanation → 1 concise line (keeps
    the honest "הערכה" label — does NOT change practice-time truth gate).
- src/pages/reports/StudentReport.tsx: "מנתוני אמת בלבד" removed from
  description.
- src/pages/reports/GapReport.tsx: "ללא השלמות מומצאות" → cleaner Hebrew.

## What was NOT touched

- No logic, endpoints, Truth Engine, LTI/NRPS/auth, governance, or server
  changes. Practice-time truth gate unchanged (still BLOCKED). Teacher Release
  stays NO.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
