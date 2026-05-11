# Automation Core Sync Status — 2026-05-11

Mode: first real Automation Core implementation.

## What changed

- Added safe aggregate endpoint `/api/sync/status`.
- Added frontend hook `useSyncStatus`.
- Added `AutomationCommandCenter`.
- Added central `סנכרן מרחב` button to Dashboard.
- Added Feature Gate behavior for main buttons.
- Added Hebrew missing-data explanations.

## Safety

- No student names returned from sync status.
- No emails returned from sync status.
- No tokens returned from sync status.
- No secrets added.
- No deploy performed.
- No private Moodle files added.

## Limitations

This is Automation Core foundation, not full persistence and not full Moodle automatic extraction.

Next implementation should add durable persistence and make sync write/read verified state.
