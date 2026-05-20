# Progress — Live LTI capability probes result

Date: 2026-05-20  
Endpoint: `GET /api/automation/lti-capability-probes`  
Source: user-provided live JSON after opening Teacher Hub from Moodle.  
Privacy: sanitized / aggregate only. No student rows, emails, token values, secrets, raw grades, raw logs, or raw launch payloads are committed.  
Teacher Release: **NO**

## Verified result

The runtime endpoint added in PR #111 is live and returning a safe capability classification for the current Moodle launch.

Sanitized result:

```json
{
  "ok": true,
  "connected": true,
  "ltiSessionAvailable": true,
  "launchMode": "lti",
  "ltiVersion": "1.3_or_advantage_candidate",
  "hasContext": true,
  "course": {
    "id": "259",
    "name": "ספר המודל - חלק ג'",
    "present": true
  },
  "actor": {
    "hasUser": true,
    "hasRoles": true,
    "roleKinds": ["membership#Instructor"]
  },
  "normalizedKeys": {
    "platformKeyPresent": true,
    "deploymentKeyPresent": true,
    "contextKeyPresent": true,
    "resourceLinkKeyPresent": true,
    "userKeyPresent": true
  },
  "services": {
    "nrps": {
      "status": "missing",
      "claimPresent": false,
      "scopeCount": 0,
      "safeProbeEligible": false
    },
    "ags": {
      "status": "missing",
      "claimPresent": false,
      "scopeCount": 0,
      "safeProbeEligible": false
    },
    "moodleWebServices": {
      "status": "missing",
      "configured": false,
      "verified": false
    }
  },
  "blockerKeys": [
    "nrps_missing",
    "ags_missing",
    "webservices_missing"
  ],
  "nextBestAction": "use_manual_exports_or_request_admin_enablement",
  "teacherRelease": false
}
```

## What is now verified

- The new PR #111 runtime endpoint is live.
- Real Moodle launch still resolves correctly.
- LTI session is available.
- Course context is available.
- Course ID `259` is detected in the pilot course.
- Instructor role signal is present.
- Normalized key presence is true for platform, deployment, context, resource link, and user.
- Public response hides raw launch payloads, tokens, PII, student rows, grades, and logs.

## What this means

The next step is no longer “build claim detection.” Claim detection exists and is live.

The live result says:

- NRPS claim is missing.
- AGS claim is missing.
- Moodle Web Services are missing/not configured.

Therefore a Safe NRPS/AGS Read-Only Probe cannot be executed yet in this environment, because there is no NRPS/AGS claim to probe.

## Current blockers

1. `nrps_missing`
2. `ags_missing`
3. `webservices_missing`
4. `course_structure_or_activity_completion_full_verification`
5. `multi_teacher_or_multi_course_isolation`
6. `teacher_release_final_gate`

## Updated next best path

Because NRPS and AGS claims are missing, the next practical route is:

1. Manual Smart Import / Activity Completion route for the current context.
2. Admin enablement request for LTI Advantage services:
   - enable/send NRPS claim if allowed,
   - enable/send AGS claim if allowed,
   - confirm privacy settings for names/emails/roles.
3. Moodle Web Services route only if an authorized token/service can be configured outside GitHub and verified with a safe read-only call.

## What not to claim

- Do not claim NRPS works.
- Do not claim AGS works.
- Do not claim Moodle Web Services are connected.
- Do not claim full automatic sync.
- Do not mark Teacher Release YES.

## Recommended next Work Order

The next code/work order should focus on Course Structure / Activity Completion via Manual Smart Import for the resolved current context, while preserving the admin-enableable path for NRPS/AGS/Web Services.

Suggested title:

`Activity Completion Manual Smart Import V1`

Goal:

Turn `courseStructure=false` into true using a real Activity Completion / Progress report bound to the current LTI context, without hardcoding course `259` and without exposing student data in public diagnostics.
