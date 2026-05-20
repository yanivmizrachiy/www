# Progress — Moodle connection blockers

Date: 2026-05-20  
Source: user-provided diagnostic summary from the live settings/connection diagnostics page and Perplexity research handoff.  
Live runtime: `https://www-tijc.onrender.com`  
Teacher Release: **NO**

## Summary

This progress entry records the current verified/blocking connection state for Moodle Teacher Hub.

This is not a completed automation milestone. It is a blocker map for the next implementation and validation steps.

## Active blockers from connection diagnostics

| Path | Status | Reason |
|---|---|---|
| LTI 1.3 session | missing | No live Moodle LTI launch was active when the settings page was checked. |
| NRPS / AGS | unavailable | These depend on a valid LTI session and service claims. |
| `MOODLE_WS_TOKEN` | missing in Render | Required environment variable is not configured. |
| Names / emails / user IDs through NRPS | unavailable | No live LTI session and no verified web-service token. |
| Automatic Web Services sync | blocked | No verified Moodle Web Services token/API call. |

## services-status facts reported by the diagnostic handoff

The reported `services-status` endpoint showed:

```json
{
  "configured": false,
  "required_env": ["MOODLE_WS_TOKEN"],
  "base_url_host": "moodlemoe.lms.education.gov.il"
}
```

## Meaning

The Automation Control Center and settings diagnostics are doing useful work: they identify the current blockers instead of pretending that full Moodle automation is already available.

Current truth:

- LTI/NRPS/AGS remain dependent on launching the tool from a real Moodle External Tool context.
- Moodle Web Services remain blocked until `MOODLE_WS_TOKEN` is configured safely outside GitHub, for example in Render environment variables.
- Full automatic Moodle sync must not be claimed until a real live API call is verified and recorded in evidence.
- Teacher Release remains **NO**.

## Required action plan

### 1. Configure Moodle Web Services token outside GitHub

If a real token is available, configure it in Render only:

- Render Dashboard
- Service: `www-tijc`
- Environment
- Add `MOODLE_WS_TOKEN`
- Redeploy

Never commit token values to GitHub.

### 2. Obtain token from Moodle only through authorized administration

Possible Moodle path, if permissions exist:

- Site Administration
- Server
- Web Services
- Manage tokens
- Create token for the correct user/service

Minimum capabilities mentioned in the handoff:

- `core_webservice_get_site_info`
- `core_enrol_get_enrolled_users`

This is not yet verified as available to this project/user. It remains a planned/blocked path until the token exists and works.

### 3. Validate LTI path from Moodle

The tool must be opened from Moodle as an External Tool.

Without a real LTI launch:

- LTI session stays missing.
- NRPS stays unavailable.
- AGS stays unavailable.
- Teacher/course identity cannot be treated as verified.

### 4. Validate after configuration

After Render env configuration and/or LTI launch:

- Open `/settings`.
- Refresh diagnostics.
- Open `/automation`.
- Check `/api/automation/capabilities`.
- Record result in `STATE/evidence-log.md` or a dated progress file.

## What must not happen

- Do not claim Web Services automatic sync while `configured=false`.
- Do not write `MOODLE_WS_TOKEN` to GitHub.
- Do not store Moodle passwords.
- Do not scrape browser cookies or sessions.
- Do not mark Teacher Release YES.
- Do not break Participants / Gradebook / Logs / Supabase / LTI.

## Next recommended implementation step

Add/strengthen a live connection-blocker runbook and diagnostics workflow:

1. Detect `MOODLE_WS_TOKEN` presence as boolean only.
2. Detect LTI session presence as boolean only.
3. Detect NRPS/AGS availability only from real LTI claims.
4. Show safe Hebrew next actions in `/settings` and `/automation`.
5. Document evidence after every successful live check.
