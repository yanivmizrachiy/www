# Render health after Participants import v3 — 2026-05-06

## Purpose

Document user-provided PowerShell verification after pushing Render-first Participants import path.

## Verified from user PowerShell output

Command:

```powershell
Invoke-RestMethod "https://www-tijc.onrender.com/health" -TimeoutSec 30 | ConvertTo-Json -Depth 10
```

Render response:

```json
{
  "ok": true,
  "service": "moodle-teacher-hub",
  "canonicalLtiEndpoint": "/api/lti/launch",
  "activeRuntime": "render",
  "reactRootIsCanonical": true,
  "legacyRootDashboardDisabled": true,
  "oauthVerification": "required",
  "supabaseConfigured": false,
  "readyForMoodleUse": true,
  "counts": {
    "launches": 2,
    "teachers": 1,
    "spaces": 1,
    "students": 0,
    "tasks": 0,
    "grades": 0,
    "activitySessions": 0,
    "moodleCaptures": 0,
    "importBatches": 0
  },
  "now": "2026-05-06T14:08:00.235Z"
}
```

## Truth status

```text
Render service reachable: verified
Render active runtime marker: verified
React canonical root marker: verified
Legacy dashboard disabled marker: verified
LTI readiness env: verified true
Students/importBatches counts: still 0, expected before real Participants import
Actual /api/import route deployment: still needs endpoint-level check
Actual Participants report import: not yet verified
Students page real names: not yet verified
```

## Next verification

Run endpoint-level checks:

```text
GET /api/imports/students should return 401 NO_VERIFIED_MOODLE_SESSION without LTI token if route exists.
POST /api/import should return 401 NO_VERIFIED_MOODLE_SESSION without LTI token if route exists.
```

After that, perform real import test from Moodle Teacher Hub UI.
