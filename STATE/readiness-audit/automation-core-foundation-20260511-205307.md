# Automation Core Foundation — 20260511-205307

Mode: first real code implementation after automation-first planning.

## Added

- Shared capability model: \src/shared/capabilities.ts\
- Frontend sync hook: \src/hooks/useSyncStatus.ts\
- Aggregate backend endpoints:
  - \GET /api/sync/status\
  - \POST /api/sync/run\
- Premium dashboard command center on existing \Dashboard.tsx\

## Safety

- No secrets.
- No tokens returned.
- No student names returned from sync status.
- No emails returned from sync status.
- Aggregate-only capability data.
- No private Moodle files committed.
- No fake success.

## Product direction

The teacher should open the tool from Moodle and click \סנכרן מרחב\.
Every main button is gated by real capability status.