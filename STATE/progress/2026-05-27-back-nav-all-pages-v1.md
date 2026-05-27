# 2026-05-27 - Back Navigation On All Pages V1

**Branch:** feat/back-nav-all-pages-v1
**Teacher Release:** NO (unchanged)
**Scope:** Yaniv reported that the app lacks a consistent way to navigate back
from any page. PR #172 added the mechanism (SafePage backTo) and applied it to
StudentProfile; this PR applies it to the remaining 13 pages so every screen
has a clear way back.

## What changed

Main navigation pages (back to dashboard "חזרה למרכז המורה"):
- Students.tsx, Grades.tsx, Tasks.tsx, Chapters.tsx, ActivityPage.tsx,
  Reports.tsx, TimeRangeReport.tsx

Sub-pages (back to previous, "חזרה"):
- ChapterDetail.tsx (back to /chapters - "חזרה לכל הפרקים")
  Also consolidated the previous inline back-link into SafePage backTo and
  cleaned up unused Link/ArrowRight imports.
- CapabilityProbe.tsx, IsolationStatus.tsx, IsolationLiveCheck.tsx,
  SettingsPage.tsx, Automation.tsx, Export.tsx, SmartImport.tsx
- MissingData.tsx (does not use SafePage; added an inline back button at the top)

## Truth / safety rules honored

- Pure navigation/presentation; no data, no invented state, no Truth Engine touch.
- No routes deleted; no server/auth/LTI/governance changes.
- Does not touch the auto-sync logic (#170/#175), scoped counts (#159), or any
  capability/audit logic.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Result

Every page in the teacher view now has a clear, consistent back button:
- Main nav pages return to "מרכז המורה"
- Sub-pages return to the previous screen
- Student profile returns to the students list
- Chapter detail returns to the chapters list
- The MissingData page (custom layout) gets an inline back button at the top.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
