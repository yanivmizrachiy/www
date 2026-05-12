# LTI routing recovery state — 2026-05-06

## Purpose

Document the focused recovery work for the issue where Moodle Teacher Hub opened with a valid LTI session but the React UI showed `העמוד לא נמצא`.

## Root cause under investigation

Evidence from DevTools showed:

```text
/api/bootstrap?t=... returned a verified LTI session
/api/imports/overview?t=... returned 200
React UI still showed NotFound
```

This indicates the core LTI session is working, while the frontend route after launch can still land on an API-like path or a route React does not treat as a normal app page.

## Current code state verified from branch

`src/App.tsx` now contains a React rescue route:

```text
/api/lti/launch -> /import
```

This prevents the React SPA from showing `NotFound` if the browser/iframe lands on the backend launch URL as a frontend route.

`src/pages/LtiBootstrap.tsx` now:

```text
reads t from query or hash
reads next from query or hash
blocks unsafe /api/* next paths
defaults to /import
navigates quickly to /import after token save
```

## Remaining server-side hardening

A focused script exists:

```text
scripts/fix-lti-routing-redirect-cache.cjs
```

It is intended to harden the server side by adding:

```text
GET /api/lti/launch rescue
303 redirect after POST launch
no-store headers for bootstrap/import APIs
```

This still needs local build verification and push if not already applied to `src/server.js`.

## What is not yet complete

```text
Real Participants import: not yet verified
Students page real names: not yet verified
Grades/logs/completion: intentionally not started
Supabase persistence: not configured in Render health
```

## Next minimal verification

After Render deploys the current React recovery code, open the Moodle external tool again.

Success means:

```text
No `העמוד לא נמצא`
The teacher lands on `/import` or a valid app screen
Bootstrap remains verified
```

Then continue to the first real Participants import test.
