# React root canonical cleanup — 2026-05-06

## Purpose

The user asked to proceed smartly and not as a demo. This cleanup removes a real architectural contradiction before continuing to Participants import.

## Problem found

`src/server.js` still had logic that could serve a legacy static dashboard on `/` if this file existed:

```text
src/ui/dashboard/dashboard.html
```

That contradicted the current source of truth:

```text
Moodle -> Render -> /api/lti/launch -> React Moodle Teacher Hub
```

## Cleanup performed

`src/server.js` was updated so:

```text
/ is no longer reserved for the legacy dashboard.
React/Vite dist is the canonical UI for /.
```

A dedicated legacy route remains:

```text
/legacy-dashboard
```

If the legacy dashboard file does not exist, this route returns a clear 404 explaining that React is the canonical UI.

## Additional hardening included

- `emptyStore()` now explicitly includes import-related arrays:
  - `importBatches`
  - `gradeItems`
  - `chapters`
  - `logEvents`
  - `completionRows`
- `/health` now reports:
  - `activeRuntime: render`
  - `reactRootIsCanonical: true`
  - `legacyRootDashboardDisabled: true`
  - `counts.importBatches`
- Shared session lookup was consolidated into a single helper.

## What was not done

No demo data was added.
No secrets were added.
No SQL was run.
No fake students/grades/logs were created.
Participants import was not implemented in this cleanup patch.

## Next recommended action

Run/verify build and Render deployment. Then implement the real next feature:

```text
Render-first Participants import path:
POST /api/import
GET /api/imports/students
```

Success must later be proven with a real Moodle Participants report and documented without storing private student data in GitHub.
