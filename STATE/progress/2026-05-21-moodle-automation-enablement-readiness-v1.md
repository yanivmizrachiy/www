# Progress — Moodle Automation Enablement Readiness V1

Date: 2026-05-21

## What changed

This branch advances the automation-first path for Moodle Teacher Hub.

It adds:

- Automation enablement readiness specification.
- Moodle admin enablement checklist in Hebrew.
- Automation enablement audit script.
- GitHub Actions workflow for Moodle automation safety checks.

## Why this matters

The product goal is still maximum real automation:

- Teacher opens Moodle Teacher Hub from Moodle.
- The tool detects the current Moodle context.
- The system pulls as much as possible through official Moodle/LTI paths.
- Manual import remains fallback only.

## Current verified state

- LTI launch works.
- Current Moodle course/context can be detected dynamically.
- Course 259 is pilot evidence only.
- NRPS is currently missing.
- AGS is currently missing.
- Moodle Web Services are currently missing/not verified.
- Teacher Release remains NO.

## What was not built

This branch does not build:

- A fake sync button.
- Runtime Moodle data pull.
- NRPS live call.
- AGS live call.
- Moodle Web Services connector.
- Manual import as the main product route.
- Teacher Release YES.

## Protected pipelines

No intended changes to:

- Participants import.
- Gradebook import.
- Logs import.
- LTI launch flow.
- Supabase persistence.

## Next recommended step

After review, the next separate PR should implement a safe server-side Web Services readiness endpoint that reports configuration status as booleans only and, when configuration exists, performs only the safe first probe: `core_webservice_get_site_info`.
