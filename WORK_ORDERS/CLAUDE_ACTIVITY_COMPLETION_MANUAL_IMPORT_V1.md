# Claude Work Order — Activity Completion / Manual Smart Import Readiness V1

## Objective

Open one PR only:

`feat/activity-completion-manual-smart-import-readiness-v1`

Title:

`feat: Activity Completion / Manual Smart Import Readiness V1`

## Current truth

- Moodle Teacher Hub.
- LTI live works from Moodle.
- Current context/course detected dynamically.
- Course 259 is pilot only.
- NRPS missing.
- AGS missing.
- Moodle Web Services missing.
- `courseStructure=false`.
- Participants / Gradebook / Logs imports exist and are protected.
- Teacher Release must remain NO.

## Build only

Create/update:

- `docs/imports/ACTIVITY_COMPLETION_MANUAL_IMPORT_V1.md`
- `docs/moodle/MOODLE_TEACHER_ACTIVITY_COMPLETION_EXPORT_GUIDE_HE.md`
- `docs/moodle/MOODLE_ADMIN_ENABLEMENT_REQUEST_HE.md`
- `scripts/checks/activity-completion-import-audit.cjs`
- `STATE/progress/<date>-activity-completion-manual-import-readiness.md`
- `WORK_ORDERS/CLAUDE_ACTIVITY_COMPLETION_MANUAL_IMPORT_V1.md`
- `package.json` script:
  - `audit:activity-completion-import`

## Do not build

- No runtime NRPS work.
- No runtime AGS work.
- No Moodle Web Services connector.
- No scraping.
- No fake data.
- No Teacher Release change.
- No Participants / Gradebook / Logs changes.
- No LTI launch changes.
- No secrets.

## Audit must check

- Import readiness doc exists.
- Teacher guide exists.
- Admin request exists.
- No hardcoded course 259 in relevant src files.
- No Teacher Release YES.
- No fake/demo completion rows.
- No hardcoded `courseStructure=true`.
- `package.json` includes `audit:activity-completion-import`.

## Required commands

- `npm run audit:activity-completion-import`
- `npm run audit:moodle-automation`
- `npm run audit:multi-teacher-safety`
- `npm run audit:deep-launch-context`
- `npm run audit:lti-probes`
- `npm run check`
- `npm run build`
- `npm run doctor`

## Stop condition

Create one PR only and stop.

## Final report format

1. Branch
2. Files changed
3. Script added
4. Audit result
5. Commands run
6. Risks/blockers
7. Exact next step
