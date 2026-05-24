# Automation Capability Registry + Data Provenance V1

**Date:** 2026-05-24
**Branch:** feat/automation-capability-registry-v1-20260524
**Status:** PR open, not merged

## What was built

`src/lib/automationCapabilities.ts` — typed registry module (`MTH_AUTOMATION_CAPABILITY_REGISTRY_V1`)

Central Truth Engine: single source of truth for what data is available, where it came from,
whether evidence is audit/live/inferred/missing, and what the teacher should do next.

## Capability baseline encoded

| id | status | source | evidenceType | verifiedBy |
|---|---|---|---|---|
| lti_context | AUTO | LTI | audit | audit:moodle-automation |
| participants | AUTO | IMPORT | audit | audit:moodle-automation |
| gradebook | AUTO | IMPORT | audit | audit:moodle-automation |
| logs | SEMI_AUTO | IMPORT | audit | audit:moodle-automation |
| course_structure | SEMI_AUTO | IMPORT | audit | audit:moodle-automation |
| practice_time | BLOCKED | UNAVAILABLE | missing | missing |
| moodle_web_services | BLOCKED | UNAVAILABLE | missing | missing |
| nrps | BLOCKED | UNAVAILABLE | missing | missing |
| ags | BLOCKED | UNAVAILABLE | missing | missing |
| teacher_release | BLOCKED | MANUAL | missing | manual-review |

## Evidence classification rules applied

- `audit` — repo/audit command proved code readiness only. Not live-verified.
- `live` — real running endpoint or real Moodle/import action verified. NOT used here yet.
- `inferred` — not used in this version.
- `missing` — capability not verifiable. Must not be claimed as working.

## Moodle Web Services readiness criteria (all null = not yet verified)

- web_services_enabled: null
- rest_protocol_enabled: null
- external_service_configured: null
- required_functions_mapped: null
- authorized_user_has_permissions: null
- token_configured_in_environment: null
- core_webservice_get_site_info_live_verified: null

## Safety invariants enforced

- No AUTO capability has evidenceType missing
- No BLOCKED capability claims evidenceType live
- teacher_release: BLOCKED, teacherVisible: false, teacher_release_ready: false
- practice_time: BLOCKED — no duration field in Moodle logs
- moodle_web_services: BLOCKED — no live site_info verified
- No secrets. No .env. No fake data.

## Audit script added

`scripts/checks/automation-capabilities-audit.cjs`
`npm run audit:automation-capabilities`

## Next steps before upgrading any evidenceType to live

- Run a real Moodle Activity Completion import through /api/import/course-structure
- Record result in STATE/evidence-log.md
- Only then update course_structure.lastVerifiedAt and evidenceType
