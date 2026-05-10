# Participants Import Persistence Connection — 2026-05-10

Mode: real focused code PR.

## What changed

- Participants import calls optional persistence after upsertImportedStudents.
- Runtime store behavior remains.
- Added /api/persistence/last-attempt for aggregate-only evidence.

## Safety

- No SQL executed.
- No database deployed.
- No secrets.
- No student data committed.
- If Supabase is not configured, persistence is skipped safely.

## Required validation

- npm run check
- npm run build
- Live import test after merge.
- Check /api/persistence/last-attempt returns aggregate-only evidence.
