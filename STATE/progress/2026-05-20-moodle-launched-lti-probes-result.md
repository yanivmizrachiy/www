# Progress — Moodle-launched LTI Capability Probes result

Date: 2026-05-20  
Endpoint: `GET /api/automation/lti-capability-probes`  
Context: user opened Teacher Hub from Moodle and then fetched the live endpoint.  
Teacher Release: **NO**

## Result

The live Moodle-launched probe succeeded and confirmed a valid LTI context for the pilot course.

Verified safe status:

- `connected=true`
- `ltiSessionAvailable=true`
- `launchMode=lti`
- `ltiVersion=1.3_or_advantage_candidate`
- `hasContext=true`
- course id detected: `259`
- course name detected: `ספר המודל - חלק ג'`
- actor has user: true
- actor has role: true
- role kind includes instructor signal
- normalized platform/deployment/context/resource/user keys are present

## Service decision

The endpoint also confirmed that advanced LTI services are **not currently available** in this live launch:

| Service | Status | Meaning |
|---|---|---|
| NRPS | `missing` | No Names and Role Provisioning Service claim was present. Do not build NRPS read-only probe yet. |
| AGS | `missing` | No Assignment and Grade Services claim was present. Do not build AGS read-only probe yet. |
| Moodle Web Services | `missing` | No verified/configured `MOODLE_WS_TOKEN` in Render/runtime evidence. |

Blockers:

- `nrps_missing`
- `ags_missing`
- `webservices_missing`

## Engineering decision

Do **not** proceed now with Safe NRPS / AGS Read-Only Probe V1, because the live Moodle-launched response does not expose eligible NRPS/AGS claims.

Next best path:

1. Continue with `Activity Completion / Course Structure` via Manual Smart Import for the current context.
2. Keep Moodle Web Services as a future path only if an authorized token/service is configured outside GitHub and verified with a safe read-only probe.
3. Ask a Moodle administrator whether LTI Advantage services (NRPS/AGS) can be enabled for this external tool.

## Product meaning

This is a significant product decision:

- LTI context works.
- Dynamic launch/context key detection works.
- NRPS/AGS are not exposed by the current Moodle launch.
- Therefore full roster/grade automation through LTI Advantage is not available yet in this environment.
- The product must continue with a fallback ladder: Manual Smart Import first, Moodle Web Services only when authorized, and NRPS/AGS only if enabled by Moodle admin.

## Privacy and safety

This evidence stores only status/aggregate capability information.

It does not commit:

- raw launch payload
- ID token
- access token
- cookies
- secrets
- student rows
- student names
- emails
- raw grades
- raw logs

Teacher Release remains **NO**.
