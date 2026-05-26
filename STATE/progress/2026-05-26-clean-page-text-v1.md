# 2026-05-26 - Clean Page Text V1

**Branch:** feat/clean-page-text-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI - remove verbose "אמת/דמו/מומצא/הסברים ארוכים" from 8 pages.

## Context

Pages still had long explanatory text ("הדף הזה לא מציג דמו", "מנתוני אמת בלבד",
"לא מוצגות משימות מומצאות", "האפליקציה לא ניגשת לנתונים בעצמה" etc.) that
clutters the teacher UI. This PR removes/shortens all of them to one clean line.

## What changed (pure presentation — no data/logic touched)

- src/pages/SettingsPage.tsx: description shortened; "סטטוס אמת חי" → "סטטוס חיבור";
  long orange "מסקנה מקצועית" block → one concise line.
- src/pages/Reports.tsx: description shortened; removed "מנתוני אמת בלבד" and
  "לפי נתוני אמת" from card descs; export card text shortened.
- src/pages/MissingData.tsx: hero subtitle shortened; direct-link text shortened;
  "עיקרון עבודה" card → "ייבוא דוח Moodle" with one-line description.
- src/pages/CapabilityProbe.tsx: title/description shortened; long automation
  paragraph → one concise sentence.
- src/pages/IsolationStatus.tsx: description shortened.
- src/pages/IsolationLiveCheck.tsx: description shortened; footer note shortened.
- src/pages/ChapterDetail.tsx: description shortened; no-tasks empty state → two
  short lines (removed "לא מוצגות משימות מומצאות").
- src/pages/SmartImport.tsx: description shortened; drop zone hint shortened.
- src/pages/Tasks.tsx: EmptyDomain description shortened.

## Truth / safety rules honored

- Pure presentation only; no data, endpoints, Truth Engine, or governance changes.
- Teacher Release stays NO.
- All buttons still lead to real flows; empty states still appear when no data.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
