# Render canonical root verified — 2026-05-06

## Purpose

Document the user's Termux verification after the repository cleanup that made the React/Vite app the canonical root UI.

## Verified from user Termux output

Latest observed commits included:

```text
3bcd7e4 Document React root canonical cleanup
3d667e7 Make React app canonical root route
774131d Add focused Render-first participants import patch script
dbbe35a Record local clean build check
63e18f0 Document repo contradiction cleanup
9fe68e0 Align LTI session documentation with Render flow
```

The Termux check confirmed:

```text
OK: legacy dashboard file not present
OK: no explicit legacy root route found
node --check src/server.js completed without error
```

Remote Render health returned:

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
  }
}
```

## Truth status

```text
Render runtime reachable: verified
React app canonical root: verified by /health marker
Legacy dashboard root takeover: fixed/verified absent
Server syntax: verified by node --check
Moodle/LTI readiness env: readyForMoodleUse true
Supabase persistence: not configured in Render health
Students/imports: still 0 and not yet verified
Production-ready: no
```

## Next allowed action

Proceed only to the focused Render-first Participants import path:

```text
POST /api/import
GET /api/imports/students
postImport -> Render first
useImportedStudents -> Render first
```

No grades/logs/activity-completion work should be started before the first real Participants import succeeds and is documented.
