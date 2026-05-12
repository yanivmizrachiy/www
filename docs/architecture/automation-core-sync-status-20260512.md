# Automation Core Sync Status — Moodle Teacher Hub

## Purpose

Start the real Automation Core implementation without rebuilding the app.

## Implemented

- `/api/sync/status`
- `/api/sync/run`
- `useSyncStatus`
- Dashboard `סנכרן מרחב` button
- Basic Feature Gate status cards
- Hebrew missing-data next actions

## Product rule

This is not a demo.

The sync endpoints return aggregate capability status only. They do not return student names, emails, grades, or private rows.

## Current limitation

This is capability detection and missing-data explanation. It does not yet perform full Moodle Web Services, AGS, or production persistence sync.

## Next

After this PR, continue with deeper Capability Detector domains and production persistence.
