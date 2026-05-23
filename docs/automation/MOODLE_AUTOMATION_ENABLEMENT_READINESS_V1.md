# Moodle Automation Enablement Readiness V1

## Goal

Advance Moodle Teacher Hub toward maximum real automation, not manual-report workflow.

The product goal remains: a teacher opens the tool from Moodle and the system pulls as much data as possible through official, safe, read-only integration paths.

Manual import remains a fallback only.

## Current verified truth

- Live Moodle LTI launch works.
- Current Moodle course/context can be detected dynamically.
- Course `259` is pilot evidence only and must not become a product hardcode.
- NRPS is currently missing.
- AGS is currently missing.
- Moodle Web Services are currently missing/not verified.
- Teacher Release remains **NO**.

## Automation-first order of work

1. LTI launch/context detection — already live.
2. LTI Advantage service detection — NRPS/AGS claim detection exists, current result is missing.
3. Moodle Web Services readiness — detect configuration as booleans only, never expose secret values.
4. Safe Moodle Web Services probe — first call only `core_webservice_get_site_info` if server configuration exists.
5. Only after safe verification, implement read-only pulls in this order:
   - `core_course_get_contents`
   - `core_enrol_get_enrolled_users`
   - `core_completion_get_activities_completion_status`
   - grade functions
   - log functions if available and approved
6. Multi-course and multi-teacher isolation validation.
7. Teacher Release gate review.

## Required status model

Automation diagnostics should distinguish:

- `missing_env` — required server configuration is absent.
- `configured_not_verified` — configuration is present but no successful safe probe is recorded.
- `verified_site_info` — safe site-info probe passed.
- `read_only_pull_ready` — at least one real read-only Moodle data function is verified.
- `blocked_by_admin_enablement` — official Moodle administration must enable the service.

## What the product must not claim

- Do not claim automatic sync while Web Services are missing or unverified.
- Do not claim NRPS works when the claim is missing.
- Do not claim AGS works when the claim is missing.
- Do not mark Teacher Release YES.
- Do not build fake sync buttons.
- Do not treat manual import as the main product path.

## Safe Web Services probe

The first safe probe must be limited to:

- `core_webservice_get_site_info`

The response exposed to the UI may include only:

- configured: boolean
- verified: boolean
- status key
- host only
- function checked
- timestamp
- failure category

The response must not include:

- secret values
- raw request headers
- raw response bodies if they contain user details
- student rows
- grade rows
- log rows

## Admin enablement focus

The admin request must ask for official read-only access only, preferably scoped per institution/deployment/service account, not broad global access.

## CI / repository automation

Every PR that affects Moodle automation should run:

- `npm run audit:moodle-automation`
- `npm run audit:multi-teacher-safety`
- `npm run audit:deep-launch-context`
- `npm run audit:lti-probes`
- `npm run audit:automation-enablement`
- `npm run check`
- `npm run build`
- `npm run doctor`

## Definition of Done for this readiness step

- Automation-first path is documented.
- Manual import is documented as fallback only.
- Admin enablement request exists.
- CI workflow exists for safety checks.
- New audit exists and passes.
- No runtime fake success is added.
- Protected Participants / Gradebook / Logs pipelines are untouched.
- Teacher Release remains **NO**.
