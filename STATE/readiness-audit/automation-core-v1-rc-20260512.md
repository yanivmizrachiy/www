# Automation Core V1 Release Candidate — 2026-05-12

This creates one canonical release-candidate branch toward `main`.

Verified locally in Termux:

- npm run check
- npm run build
- local server starts
- GET /health
- GET /api/sync/status
- GET /api/persistence/status
- GET /api/release/readiness
- no fake data claim
- no fake persistence claim
- no fake release claim
- no secrets returned
- no private student rows returned

This is still not a teacher-release approval.
