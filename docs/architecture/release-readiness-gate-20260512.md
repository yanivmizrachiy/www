# Release Readiness Gate

Adds `/api/release/readiness`.

This is the central readiness gate before teacher release.

It combines:

- Automation Core sync status
- Persistence status
- missing Moodle data blockers
- live/deploy validation blocker
- multi-teacher validation blocker
- real Moodle end-to-end blocker

The endpoint is intentionally conservative and does not say the product is ready until the remaining production blockers are resolved.
