# Persistence Status Runtime Smoke Fixed — 2026-05-12

Runtime smoke test passed locally in Termux.

The first check was too strict because it rejected the safe field name `supabase_service_role_configured`.

This fixed smoke test verifies:

- npm run check
- npm run build
- local server starts
- GET /health
- GET /api/persistence/status
- GET /api/sync/status includes persistence
- no secret values returned
- no student rows returned
- no fake persistence claim
- safe boolean config field names are allowed
