# Repo contradiction cleanup — 2026-05-06

## Purpose

The user asked to proceed smartly and not as a demo. This file documents the real cleanup actions taken before any new product feature work.

## What was checked

Reviewed the current source-of-truth files and runtime files:

- `README.md`
- `docs/work-plan.md`
- `render.yaml`
- `src/server.js`
- `src/hooks/useLtiSession.ts`
- legacy dashboard references

## Confirmed improved state

### README

`README.md` now correctly documents the active route:

```text
Moodle External Tool -> Render permanent runtime -> /api/lti/launch -> React Moodle Teacher Hub
```

It also correctly marks these as inactive for the active production-like path:

```text
Termux / Cloudflare temporary URLs
Localtunnel temporary URLs
Supabase Gateway forwarding route
legacy /lti/launch-1p1
legacy /dev/login
```

### Work plan

`docs/work-plan.md` now points to the correct next technical action:

```text
Implement Render-first Participants import path.
```

### Render config

`render.yaml` is aligned with the working Render deployment:

```text
buildCommand: npm ci --include=dev && npm run build
startCommand: npm run start
APP_BASE_URL=https://www-tijc.onrender.com
```

## Cleanup performed

### `src/hooks/useLtiSession.ts`

The old comment described a stale Supabase Edge Function launch flow:

```text
Moodle -> /lti-launch edge function -> /#/lti?t=<token> -> Supabase RPC
```

It was replaced with the actual current active flow:

```text
Moodle -> Render /api/lti/launch -> /lti?t=<token> -> /api/bootstrap
```

The domain missing reasons were also improved so the UI state is more honest:

- students require Participants/Students import
- grades require Gradebook import
- activity/time require Logs import
- write-back is blocked until verified Moodle Web Services token exists

## Remaining issue found

`src/server.js` still contains a defensive root route that checks for:

```text
src/ui/dashboard/dashboard.html
```

However, a repository content check after earlier cleanup showed the file path currently returns Not Found on the active branch. Therefore the route is less dangerous now than before, but the route logic itself should still be cleaned in a later small patch so the React app is always the canonical `/` route.

## What was not changed yet

No import feature was added yet.
No student data model was changed yet.
No Supabase SQL was run.
No secrets were written.
No fake data was added.

## Recommended next cleanup patch before import work

Small safe patch:

```text
Update src/server.js so /legacy-dashboard is the only legacy HTML route if the file exists, and / always falls through to dist/index.html.
```

After that:

```text
Implement Render-first Participants import path.
```

## Current state

```text
Architecture documentation: mostly aligned
Render config: aligned
useLtiSession comments: aligned
legacy root route: still should be cleaned in src/server.js
Participants import: not yet implemented/verified
```
