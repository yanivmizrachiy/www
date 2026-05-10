# Participants Import Persistence Connection — 2026-05-10

Mode: safe focused code PR.

## What this branch does

- Connects the Participants import route to the server-side persistence adapter.
- Keeps the existing runtime store behavior.
- Writes to Supabase only when persistence is configured on the server.
- Returns aggregate persistence status only.

## What this branch does not do

- No SQL execution.
- No database deploy.
- No secrets.
- No student data in Git.
- No forced persistence.
- No Render environment changes.

## Expected behavior

If SUPABASE_SERVICE_ROLE_KEY is missing, import still works and persistence is skipped safely.

If Supabase is configured later, import can persist teacher/course/batch/students server-side.

## Required validation

- npm run check
- npm run build
- Live import test after merge
- Aggregate-only evidence
