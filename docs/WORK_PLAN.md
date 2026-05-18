# Moodle Teacher Hub — Work Plan

Updated: 2026-05-18

## Current state

Done:
- PROJECT_RULES.md is the source of truth.
- Dashboard homepage is complete and premium Hebrew RTL.
- Participants import UI was cleaned.
- Real Participants import works.
- Real Gradebook import works.
- Real Moodle Logs import works.
- Supabase persistence exists.
- Practice time is blocked when no official Moodle duration field exists.
- Teacher Release remains NO.

Not done:
- Full automatic Moodle sync is not verified.
- Multi-teacher / multi-course isolation is not fully verified.
- Capability status screen is not complete.
- Unified smart import wizard is not complete.
- Premium UI is not unified across all screens.

## Best next improvements

1. Keep PROJECT_RULES.md updated.
2. Keep STATE/current-capabilities.json updated.
3. Add a Moodle connection/capability status screen.
4. Clean GradebookImport.tsx UI without changing import logic.
5. Clean LogsImport.tsx UI without changing import logic.
6. Build a unified smart import wizard.
7. Investigate LTI / NRPS / AGS / Moodle Web Services automatic sync.
8. Validate second teacher or second Moodle course isolation.

## Execution rules

- One small PR at a time.
- Do not change Supabase unless explicitly required.
- Do not change working import logic unless explicitly required.
- Do not change Teacher Release to YES.
- No demo data.
- No fake grades.
- No fake logs.
- No invented practice time.

## Current percentages

Homepage UI: 100%
Participants import UI: 100%
Real data imports: 100%
Automatic full Moodle sync: 20%-30%
Capability truth layer: after PR #97 is complete about 55%
Repository organization depth: after PR #97 is complete about 65%
Premium UI unification across all screens: about 45%
Teacher Release: NO
