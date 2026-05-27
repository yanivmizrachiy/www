# 2026-05-27 - Dashboard Balanced Hero V1

**Branch:** feat/dashboard-balanced-hero-v1
**Teacher Release:** NO (unchanged)
**Scope:** Yaniv reported "giant text in a small frame" - the dashboard used
text-7xl for the hero title and text-5xl for the four action cards, which made
content feel cramped and oversized. This rebalances the proportions.

## What changed

- src/pages/Dashboard.tsx:
  - Hero title: text-5xl/lg:text-7xl -> text-3xl sm:text-4xl lg:text-5xl
  - Hero subtitle: text-lg/lg:text-xl -> text-base lg:text-lg
  - Action card title (template): text-5xl -> text-2xl sm:text-3xl
  - Action card padding: p-8 -> p-6, icon h-14 w-14 -> h-10 w-10
  - Action card value badge: text-base px-5 py-2 -> text-sm px-4 py-1.5
  - "כל השאר" card: same balanced sizing as the other cards
  - Rounded corners: rounded-[2rem] -> rounded-3xl (consistent token)

## Why this is safe

- Pure presentation; no data, no invented state, no Truth Engine touch.
- All cards still link to the same routes; only typography/spacing changed.
- No server/auth/LTI/governance changes.
- Does not touch the recent #170/#171/#172/#173 work.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Result

The hero and action cards now have reasonable proportions: a clear title that
does not dominate the screen, action cards that fit nicely on a row without
text overflowing their frames. Combined with the fullscreen layout from #172
(max-w 1600px), the dashboard now uses the screen properly.

## Note on "Moodle Teacher Hub - LTI 1.3 Test"

The label seen at the very top of Yaniv's screenshot ("Moodle Teacher Hub -
LTI 1.3 Test") is Moodle's own external-tool name from its admin settings, not
text rendered by this codebase. Our HTML title is already "המודל החכם". To
change the top-bar label, the LTI tool name needs to be updated in Moodle's
admin settings.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
