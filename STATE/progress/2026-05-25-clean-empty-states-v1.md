# 2026-05-25 - Clean Empty States + Export/Chapters/Grades V1

**Branch:** feat/clean-empty-states-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI - shorten verbose empty-state and card text on the pages Yaniv
photographed (Chapters, Grades-via-EmptyDomain, Export).

## Context

Yaniv sent screenshots showing long "story" text: the Chapters empty box, the
Grades "איך להשיג את הנתונים?" help card (EmptyDomain), and the Export page's
"כלל אמת לייצוא" block plus long per-card descriptions and disabled reasons.

## What changed

- src/pages/Chapters.tsx: empty state reduced from a long orange paragraph to a
  short dashed box: "אין עדיין פרקים להצגה." + a single "ייבוא מבנה קורס" button
  (now to /smart-import).
- src/components/EmptyDomain.tsx (shared by grades/students/completion/logs):
  removed the verbose "איך להשיג את הנתונים?" help card; now shows the icon, the
  title, the short per-domain instruction, and one "ייבוא נתונים" button (to
  /smart-import). Dropped the unused description prop from the render + unused
  Card/HelpCircle imports.
- src/pages/Export.tsx: shortened the page description; removed the "כלל אמת
  לייצוא" explainer box; tightened each ExportCard description and disabled
  reason to a short line; removed the unused Info import.

## Not done in this PR (intentional)

- The Automation page cards (image 3) draw their text from
  automationCapabilities.ts (the audited Truth Engine). That needs a careful
  separate pass so the automation audits stay green - deferred.

## Truth / safety rules honored

- Pure presentation; empty states still appear when there's no data; buttons
  still lead to the real import flow.
- No server, Truth Engine, auth, or governance changes.
- Teacher Release stays NO.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
