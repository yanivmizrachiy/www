# Moodle Web Services Readiness Endpoint — V1

## Version marker
`MTH_MOODLE_WS_READINESS_V1`

## Endpoint
```
GET /api/automation/moodle-webservices/readiness
```

## Purpose

Safe, read-only readiness probe for Moodle Web Services.

Answers one question: **is the system ready to make a real Moodle Web Services call?**

Does NOT pull students, grades, logs, or any personal data. Will never do so in V1.

## Response shape

```json
{
  "ok": true,
  "version": "MTH_MOODLE_WS_READINESS_V1",
  "configured": false,
  "verified": false,
  "status": "missing_env",
  "host": "moodlemoe.lms.education.gov.il",
  "function_checked": "core_webservice_get_site_info",
  "checkedAt": "...",
  "failure_category": null,
  "moodle_release": null,
  "functions_available_count": null,
  "required_env": ["MOODLE_WS_TOKEN"],
  "required_admin_steps": ["..."],
  "safety": {
    "no_token_returned": true,
    "no_student_rows": true,
    "no_grades": true,
    "no_emails": true,
    "no_user_ids": true,
    "no_raw_moodle_response": true
  }
}
```

## Status values

| status | meaning |
|---|---|
| `missing_env` | `MOODLE_WS_TOKEN` not set in Render. Endpoint is read-only, no probe attempted. |
| `configured_not_verified` | Token set but probe not yet run (this state should not appear in V1 — probe always runs when token exists). |
| `verified_site_info` | `core_webservice_get_site_info` call succeeded. Moodle Web Services are working. |
| `invalid_token` | Token present but Moodle rejected it. Token may be expired or have wrong capabilities. |
| `blocked_by_admin_enablement` | Moodle returned "Web services disabled" error. Admin action required. |
| `http_error` | Moodle server returned non-200 HTTP status. |
| `network_error` | DNS/connection failure reaching Moodle. |
| `timeout` | Moodle did not respond within 8 seconds. |
| `json_parse_error` | Moodle returned non-JSON response. |
| `moodle_error` | Moodle returned an error code not otherwise categorized. |
| `runtime_error` | Server-side fetch API not available (should not happen on Node 18+). |

## What is NEVER returned

- Token value
- Password
- Cookies
- Raw Moodle response body
- Student rows
- Grade data
- Log events
- Email addresses
- User IDs
- Any PII

## What IS returned when verified

- `moodle_release` — Moodle version string only (e.g. "4.3.2 (Build: ...)")
- `functions_available_count` — integer count of available WS functions

## Probe security

The token is sent via HTTP POST body (not URL query string) to avoid appearing in access logs. The token is read from `process.env` and used only within the request lifetime. It is never logged, stored, or returned.

## What this enables

When status is `verified_site_info`, the next safe steps are:

1. Expand the token's capabilities in Moodle to include additional functions.
2. Probe `core_enrol_get_enrolled_users` — participants without manual import.
3. Probe `gradereport_user_get_grade_items` — grade items without manual Gradebook import.
4. Build automated background sync (requires verified token + expanded capabilities + Teacher Release gate).

Each expansion step must be verified and recorded in `STATE/evidence-log.md` before proceeding.

## Required Moodle admin steps

To enable this endpoint to succeed:

1. **Enable Web Services**
   `Site Administration > Advanced features > Enable web services: YES`

2. **Enable REST protocol**
   `Site Administration > Plugins > Web services > Manage protocols > Enable 'REST protocol'`

3. **Create a web service user** with appropriate Moodle capabilities

4. **Create a token**
   `Site Administration > Plugins > Web services > Manage tokens > Add token`
   Assign at minimum: `core_webservice_get_site_info`

5. **Set env var in Render** (never in GitHub)
   `MOODLE_WS_TOKEN=<token value>`

## Audit

```bash
npm run audit:moodle-webservices-readiness
```

Checks (static, read-only):
- Endpoint exists in server.js
- Version marker present
- Safety object fields present
- Probe body does not call data-extraction functions
- Token not returned in response
- `required_admin_steps` documented
- Teacher Release stays false
- `.env.example` documents the vars

## Teacher Release gate

This endpoint does NOT change Teacher Release. Teacher Release remains `NO` regardless of this endpoint's status.
