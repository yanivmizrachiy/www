# Progress State — 2026-05-21 — Activity Completion / Manual Smart Import Readiness

## What was built

This update adds a non-runtime readiness layer for Activity Completion / Progress Manual Smart Import:

- Technical import readiness spec.
- Hebrew teacher guide for exporting the right Moodle report.
- Hebrew Moodle admin enablement request.
- Audit script for readiness and safety guardrails.
- npm script: `audit:activity-completion-import`.
- Claude Work Order for the next implementation stage.

## What was not built

This update does not build:

- NRPS live probe.
- AGS live probe.
- Moodle Web Services connector.
- Runtime importer.
- Database schema migration.
- Fake/demo completion data.
- Automatic sync.
- Teacher Release YES.

## Protected areas

The following must remain protected:

- Participants import.
- Gradebook import.
- Logs import.
- LTI launch flow.
- Private configuration values.
- Teacher Release gate.

## Current truth

- LTI live launch works.
- Current Moodle context/course is detected dynamically.
- Course 259 is pilot evidence only.
- NRPS is missing.
- AGS is missing.
- Moodle Web Services is missing.
- `courseStructure=false`.
- Teacher Release remains **NO**.

## Next best action

The next PR should implement a narrow validation/preview contract for Activity Completion / Progress reports:

- validate endpoint
- sanitized preview
- context binding
- import_batch_id
- source_provenance
- no raw student rows
- no fake state changes
