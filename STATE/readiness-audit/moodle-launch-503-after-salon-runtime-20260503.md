# Moodle Launch 503 After Salon Runtime — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User screenshots from Chrome/Moodle after opening the Moodle external tool again.

## Screenshot evidence

Chrome DevTools Console shows:

```text
Starting Moodle session timeout warning.
Failed to load resource: the server responded with a status of 503 (Service Unavailable)
https://nasty-rabbits-wait.loca.lt/api/lti/launch
```

The Moodle embedded tool area shows:

```text
503 - Tunnel Unavailable
```

## Interpretation

This is not a Supabase error and not yet an OAuth error. It means Moodle is reaching the Localtunnel service, but the Localtunnel public URL is not connected to the local Node server at that moment.

Current path:

```text
Moodle -> https://nasty-rabbits-wait.loca.lt/api/lti/launch -> Localtunnel returns 503 before Node server handles the request
```

Therefore the request did not reach `src/server.js` for OAuth verification.

## Current truth

```text
Moodle external tool URL: correct current target
Node server on Salon PC: previously verified running locally
Public Localtunnel connection: currently failing with 503
Real OAuth verification: not reached
Supabase session insert: not reached
Dashboard: not reached
Production-ready: no
```

## Next action

Keep the Node server window open, then restart only the Localtunnel process on the Salon PC and verify public health before trying Moodle again:

```text
https://nasty-rabbits-wait.loca.lt/health must return JSON before Moodle launch can work.
```

If Localtunnel keeps returning 503, replace it with a more stable tunnel/deployment path instead of changing application code.
