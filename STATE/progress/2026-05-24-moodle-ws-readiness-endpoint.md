# Progress — 2026-05-24: Moodle Web Services Readiness Endpoint

## What was done

Added `GET /api/automation/moodle-webservices/readiness` to server.js.

This is a safe, read-only probe endpoint for Moodle Web Services.

## Files changed

- `src/server.js` — added `buildMoodleWsReadinessResponse()`, `probeMoodleWsSiteInfo()`, and the route
- `scripts/checks/moodle-webservices-readiness.cjs` — new audit script (15 checks)
- `package.json` — added `audit:moodle-webservices-readiness` script
- `.env.example` — documented `MOODLE_WS_TOKEN` and `MOODLE_WS_BASE_URL`
- `docs/automation/MOODLE_WS_READINESS_V1.md` — full documentation
- `STATE/progress/2026-05-24-moodle-ws-readiness-endpoint.md` — this file

## Checks run and passed

```
npm run check               → OK
npm run doctor              → REPO_DOCTOR_OK
npm run typecheck           → 0 errors
npm run audit:moodle-webservices-readiness → 15/15 OK
npm run audit:multi-teacher-safety → OK
```

## What this endpoint does

- Returns `status: "missing_env"` when `MOODLE_WS_TOKEN` is not configured (current state)
- Returns `status: "verified_site_info"` when token is present and `core_webservice_get_site_info` succeeds
- Returns failure categories for all error cases (invalid token, webservices disabled, timeout, network error)
- Documents exact admin steps for Moodle administrator to enable Web Services
- Never returns: token, password, student rows, grades, emails, user IDs, raw Moodle response

## Current live status

`status: "missing_env"` — `MOODLE_WS_TOKEN` not configured in Render.

## Protected pipelines — unchanged

- Participants import ✓ unchanged
- Gradebook import ✓ unchanged
- Logs import ✓ unchanged
- LTI launch ✓ unchanged
- Supabase migrations ✓ not touched
- Teacher Release ✓ remains NO

## What the Moodle admin needs to do

To advance from `missing_env` to `verified_site_info`:

1. Enable Web Services in Moodle admin
2. Enable REST protocol
3. Create a token with `core_webservice_get_site_info` capability
4. Set `MOODLE_WS_TOKEN` in Render environment variables

## Next step after `verified_site_info`

Record evidence in `STATE/evidence-log.md`, then expand token capabilities for:
- `core_enrol_get_enrolled_users` — auto participants
- `gradereport_user_get_grade_items` — auto grades
- Background sync infrastructure

## Teacher Release

Remains **NO**.
