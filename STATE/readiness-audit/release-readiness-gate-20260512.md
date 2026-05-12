# Release Readiness Gate — 2026-05-12

Added a real release-readiness gate.

Verified intent:

- one endpoint tells whether the product is ready for teachers
- the endpoint must not claim fake readiness
- it lists blockers in Hebrew
- it includes sync and persistence summaries
- it returns no secret values
- it returns no private student rows

Endpoint:

- `/api/release/readiness`

Still not broad teacher release.
