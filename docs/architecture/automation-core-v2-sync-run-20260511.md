# Automation Core V2 — Sync Run

## Purpose

This adds a real sync-run layer above the initial sync status foundation.

## Added

- `POST /api/sync/run`
- `GET /api/persistence/status`
- prioritized Hebrew next actions
- teacher-action minimization
- UI connection from the central `סנכרן מרחב` button to sync-run
- aggregate-only persistence status

## Safety

- No deploy.
- No secrets.
- No student names returned.
- No emails returned.
- No tokens returned.
- Aggregate status only.

## Product impact

The dashboard button `סנכרן מרחב` now performs an actual sync-run check and tells the teacher the next exact action, instead of merely showing generic status.
