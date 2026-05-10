# Participants Import Persistence Connection — 2026-05-10

Mode: real focused code PR.

## What changed

- Participants import now calls the optional Supabase persistence adapter after runtime import.
- Existing runtime store behavior remains.
- If Supabase is not configured, persistence is skipped safely.
- Added aggregate-only last-attempt endpoint.

## Endpoints

- GET /api/persistence/status
- GET /api/persistence/last-attempt

## Safety

- No SQL executed.
- No database deployed.
- No secrets added.
- No student data committed.
- No student names/emails returned from persistence evidence.

## Next

After merge and Render deploy, test Participants import and verify last_attempt.skipped=true while SUPABASE_SERVICE_ROLE_KEY is missing.
