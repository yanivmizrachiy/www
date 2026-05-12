# Automation Core V1 Release Candidate

This is the canonical branch that gathers the current Automation Core V1 stack into one review path toward `main`.

It includes:

- Sync status API
- Sync run API
- useSyncStatus hook
- Dashboard sync button
- Dashboard feature gates
- Missing data page
- Automation Core V1 metadata
- Runtime smoke checks
- Persistence status API
- Persistence runtime smoke
- Release readiness gate
- Release readiness runtime smoke

The release gate still blocks teacher release until production persistence, live deploy validation, real Moodle E2E validation, and multi-teacher validation pass.
