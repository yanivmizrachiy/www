# 2026-05-27 - Fullscreen Layout + Consistent Back Navigation V1

**Branch:** feat/page-header-back-nav-v1
**Teacher Release:** NO (unchanged)
**Scope:** two design fixes Yaniv reported from live use — (1) the app did not
use the full screen on large displays, and (2) there was no consistent way to
navigate back from a sub-page (e.g. a student profile back to the list).

## What changed

- src/components/AppLayout.tsx: widened the main content container from
  max-w-7xl (1280px) to max-w-[1600px] and added xl:p-10, so large screens are
  used properly instead of leaving the content cramped in a narrow center column.
- src/components/SafePage.tsx: added an optional back button. Pass backTo="/route"
  to go to a specific page, or backTo="-1" to go to the previous page. New
  BackButton subcomponent with a consistent RTL style (ArrowRight + label).
  Title sizing made responsive (text-2xl sm:text-3xl).
- src/components/PageHeader.tsx (new): a standalone reusable header (title +
  description + back button + optional actions) for pages that do not use
  SafePage, so back-navigation can be consistent everywhere.
- src/pages/StudentProfile.tsx: added backTo="/students" (label "חזרה לתלמידים")
  on the profile and its empty state, so the teacher can always return to the
  students list — the exact gap Yaniv hit.

## Truth / safety rules honored

- Pure presentation/navigation; no data, no invented state, no "automatic" claims.
- No server logic, Truth Engine, auth, LTI, or governance changes.
- Does not touch NRPS auto-sync (#170), scoped counts (#159), or source-status
  panel (#171).
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Next design steps (planned)

Apply backTo to the remaining sub-pages, reduce the oversized dashboard hero text
(text-7xl -> responsive), and unify button/card sizing — continuing the full
design plan.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
