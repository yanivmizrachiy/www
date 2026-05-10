# Participants Import Persistence Connection — 2026-05-10

Mode: focused code PR.

## What changed

- Participants import attempts optional Supabase persistence through the existing adapter.
- Existing runtime store behavior remains.
- Returned persistence evidence is aggregate-only.

## Safety

- No SQL executed.
- No database deployed.
- No secrets added.
- No student data committed.
- If Supabase is not configured, persistence is skipped safely.

## Next

After merge and Render deploy, test Participants import and verify persistence.skipped=true while SUPABASE_SERVICE_ROLE_KEY is missing.
