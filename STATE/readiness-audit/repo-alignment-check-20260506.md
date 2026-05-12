# Repo alignment check before next work — 2026-05-06

## Purpose

User requested a complete stop and renewed check before continuing. This file records whether the repo is currently updated, smart, aligned with requirements, and safe to continue from.

## Scope checked

- `README.md`
- `docs/work-plan.md`
- `src/server.js`
- `src/ui/dashboard/dashboard.html`
- `src/hooks/useLtiSession.ts`
- `src/hooks/useImports.tsx`
- `STATE/project-status.md`
- `render.yaml`
- Uploaded conversation summary file

## Findings before cleanup

### 1. README was stale

The previous README still referenced:

- `/lti/launch-1p1`
- `/dev/login`
- local/legacy dashboard path
- old generic setup text

This conflicted with the current permanent Render architecture.

### 2. Work plan was stale

`docs/work-plan.md` still listed many files as missing even though many now exist, and it described `/functions/v1/import-moodle-report` as the main import path.

This conflicted with the new strategy: Render-first Participants import, Supabase only as fallback/future persistence.

### 3. Legacy dashboard artifact was dangerous

`src/ui/dashboard/dashboard.html` existed and `src/server.js` had a `/` route that served it before the React/Vite build when present.

This could cause the legacy HTML dashboard to appear instead of the current React app.

### 4. Data path is still incomplete

The app is connected, but real data import is not verified. `postImport` still depends on Supabase Function/RPC paths. This must be fixed next.

## Cleanup performed

### Commit `6b0d75a`

Removed legacy artifact:

```text
src/ui/dashboard/dashboard.html
```

Reason: prevent stale dashboard from hijacking `/`.

### Commit `dd6115d`

Updated `README.md` to current architecture:

```text
Moodle -> Render -> /api/lti/launch
```

Removed active references to legacy Termux/Cloudflare/Supabase Gateway paths.

### Commit `771244b`

Replaced stale `docs/work-plan.md` with current Render-first plan.

## Current truth after cleanup

The repo is now much better aligned with the user's requirements.

Still not fully done:

- `src/server.js` still contains a harmless legacy fallback block that checks for the removed dashboard file. Since the file has been removed, it no longer hijacks `/`. It can be cleaned later.
- Comments inside `src/hooks/useLtiSession.ts` still mention an older Supabase Edge Function flow. This should be cleaned before broader development.
- `postImport` and data hooks still need Render-first implementation.

## Do not continue to product features yet

Next allowed technical work:

```text
Implement Render-first Participants import path.
```

But only after this alignment is accepted.

## Current readiness estimate

```text
Repo alignment: 88%-92%
Permanent Render runtime: high confidence
Direct LTI launch: user-reported connected
Participants import: not verified
Production-ready: no
```
