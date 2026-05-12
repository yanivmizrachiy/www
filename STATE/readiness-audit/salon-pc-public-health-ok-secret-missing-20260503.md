# Salon PC Public Health OK, LTI Readiness Missing — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User pasted Windows PowerShell output from the Salon PC:

```powershell
Invoke-WebRequest "https://nasty-rabbits-wait.loca.lt/health" -UseBasicParsing -TimeoutSec 20
```

## Verified result

- Public Localtunnel URL responded with HTTP 200 OK.
- Public response content starts with JSON health from the app:

```json
{"ok":true,"service":"moodle-teacher-hub","canonicalLtiEndpoint":"/api/lti/launch","oauthVerification":"required",...}
```

- Therefore the public tunnel is now connected to the local Node server.

## Important issue

The health response also showed:

```text
supabaseConfigured: false
readyForMoodleUse: false
```

This means the currently running Node server process is reachable, but it was started without all required runtime environment variables. In particular, `readyForMoodleUse:false` means `LTI_SHARED_SECRET` and/or `LTI_CONSUMER_KEY` is missing from that running process.

## Current truth

```text
Public tunnel reachability: verified OK
Local Node server behind tunnel: verified OK
Canonical endpoint: /api/lti/launch
LTI secret in current server process: missing/not active
Ready for Moodle use: false
Supabase runtime connection: false
Real Moodle LTI launch: should wait until readyForMoodleUse:true
```

## Next action

Keep the Localtunnel window open. Restart only the Node server on the Salon PC with the correct local-only LTI secret and `LTI_CONSUMER_KEY=yaniv-lti-tool`. Then verify:

```text
https://nasty-rabbits-wait.loca.lt/health
```

must show:

```text
readyForMoodleUse: true
```

Only then open the external tool from inside Moodle.

## Safety note

The LTI shared secret was exposed earlier in chat and must be rotated before any real/production use. Do not commit it or paste it again.
