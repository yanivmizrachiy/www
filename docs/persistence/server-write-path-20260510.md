# Persistence Write Path — Moodle Teacher Hub

## Purpose

This branch adds the first safe server-side persistence adapter.

## Safety model

The adapter writes to Supabase only when both environment variables exist on the server:

- VITE_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

If they are missing, the app continues using the existing runtime store.

## Added endpoint

GET /api/persistence/status

This endpoint returns configuration status only. It does not return secrets or student data.

## Current connection level

This branch adds:

- src/persistence/supabasePersistence.js
- /api/persistence/status
- safe server-side persistence utilities

The Participants import endpoint was not patched automatically because the exact safe insertion pattern was not found. That is intentional and safer than a risky patch.

## What this branch does not do

- Does not execute SQL.
- Does not deploy database changes.
- Does not add secrets.
- Does not add student data.
- Does not expose service-role keys.
- Does not remove the runtime-store fallback.

## Next

After this PR is reviewed and merged:

1. Verify /api/persistence/status on Render.
2. Patch Participants import in a separate focused PR.
3. Configure Supabase only in Render environment after approval.
4. Execute schema manually only after approval.
5. Verify persistence with aggregate-only evidence.
