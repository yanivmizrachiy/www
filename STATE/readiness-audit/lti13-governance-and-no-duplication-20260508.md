# LTI 1.3 governance and no-duplication boundary — 2026-05-08

## Purpose

This file records the safe continuation boundary for Moodle Teacher Hub.

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`
Runtime: `https://www-tijc.onrender.com`

## Do not restart

- Do not rebuild from zero.
- Do not create a new repository.
- Do not delete existing code.
- Do not replace the existing LTI 1.0/1.1 route.
- Do not use Supabase Gateway as the active launch route.
- Do not return to Localtunnel or Cloudflare as a production path.
- Do not commit secrets or private Moodle/student data.
- Do not show fake students, grades, activity, practice time, success messages, or demo data.

## Protected existing route

The existing canonical LTI route remains:

```text
/api/lti/launch
```

It must remain intact until LTI 1.3 is fully verified with real evidence.

## Separate LTI 1.3 test routes

LTI 1.3 work is separate:

```text
/api/lti13/status
/api/lti13/config
/api/lti13/jwks
/api/lti13/login
/api/lti13/launch
/api/lti13/services-status
```

These routes do not by themselves prove automatic students, grades, activity, or production readiness.

## Evidence boundary

Existing evidence records that LTI 1.3 diagnostic endpoints were reported live on Render on 2026-05-07.

Not yet proven:

- Render LTI 1.3 configured=true.
- Real automatic student roster fetch.
- Real grade sync.
- Moodle Web Services access.
- Daily practice-time calculation.
- Production readiness for all teachers.

## Next safe order

1. Verify governance and STATE.
2. Verify git status and latest commits.
3. Verify live Render endpoints.
4. If LTI 1.3 status is not configured, finish Render environment setup outside Git and without exposing secrets.
5. If LTI 1.3 is configured, reopen the separate Moodle LTI 1.3 test tool.
6. Inspect services-status for a live session and real service claims.
7. Only after real roster-service evidence, continue to automatic student import.
8. Only after real students exist, continue to grades, activity, daily practice time, reports and exports.

## Daily practice time boundary

Daily practice time is a central requirement but is not implemented yet.

It must only come from official Moodle duration or real Moodle logs. If data is missing, show that data is missing. Do not invent minutes and do not confuse zero minutes with missing data. Daily calculations must use Asia/Jerusalem.

## Service map

- Render: public app/server runtime.
- GitHub: source code, docs, STATE and evidence.
- Moodle: launch context and real data source.
- Supabase: possible future persistence, not active LTI route.
- Termux: phone-side checks and git/curl/build commands.
- PowerShell: Windows-side management.
- Localtunnel/Cloudflare: temporary experiments only.

## Status

Documentation/governance only. No runtime code changed. No new product capability is proven by this file alone.
