# Persistence Live Validation — 2026-05-12

Adds a safe live validation endpoint:

`/api/persistence/validate`

Purpose:
- verify Supabase production persistence from the live server
- check required table accessibility
- return aggregate counts only
- return no student rows
- return no secret values

Teacher release remains blocked until persistence, Moodle E2E, and multi-teacher validation pass.
