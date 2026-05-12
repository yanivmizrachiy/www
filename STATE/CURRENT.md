# CURRENT — Moodle Teacher Hub

Updated: 2026-05-12
Repository: `yanivmizrachiy/www`
Canonical branch: `main`
Live runtime: `https://www-tijc.onrender.com`
Teacher release: **NO**

## Verified

- Automation Core V1 is merged into `main`.
- Render should deploy from `main`.
- Live `/health` returns JSON.
- Live `/api/release/readiness` returns JSON.
- Live `/api/persistence/validate` returns JSON.
- Supabase production persistence validation passed.
- Required Supabase tables are accessible.
- No secret values are returned.
- No student rows are returned.

## Still not verified

- Real Moodle launch after latest live changes.
- Real Moodle import end-to-end.
- Multi-teacher / multi-course isolation.
- Final teacher runbook.

## Percentages

- Repo Cleanup & Finalization Plan: 18%
- Automation Core + Live + Supabase: 92%
- Teacher product readiness: 72%
- Teacher release: NO
