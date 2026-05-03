# Salon PC Public Health Ready — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User pasted Windows PowerShell output after running local and public `/health` checks.

## Verified command shape

```powershell
$Port=3000
$PublicUrl='https://nasty-rabbits-wait.loca.lt'
(Invoke-WebRequest "http://127.0.0.1:$Port/health" -UseBasicParsing -TimeoutSec 10).Content
(Invoke-WebRequest "$PublicUrl/health" -UseBasicParsing -TimeoutSec 20).Content
```

## Verified local health

Local health returned JSON:

```json
{
  "ok": true,
  "service": "moodle-teacher-hub",
  "canonicalLtiEndpoint": "/api/lti/launch",
  "oauthVerification": "required",
  "supabaseConfigured": false,
  "readyForMoodleUse": true,
  "counts": {
    "launches": 3,
    "teachers": 2,
    "spaces": 2,
    "students": 0,
    "tasks": 0,
    "grades": 0,
    "activitySessions": 0,
    "moodleCaptures": 1
  }
}
```

## Verified public health

Public Localtunnel health returned the same app JSON from:

```text
https://nasty-rabbits-wait.loca.lt/health
```

with:

```text
ok: true
canonicalLtiEndpoint: /api/lti/launch
oauthVerification: required
readyForMoodleUse: true
```

## Current truth

```text
Salon PC Node server: verified working
Public Localtunnel reachability: verified working
Moodle Tool URL target: reachable
LTI secret/key present in current server process: yes, as indicated by readyForMoodleUse:true
Supabase runtime connection: still false in health output
Real Moodle launch: ready to test now
Production-ready: no
```

## Next required evidence

Open the Moodle external tool from inside the real Moodle course. Do not open the URL directly.

Capture:

1. Browser/Moodle result screen.
2. Last Node server logs around the click.
3. If successful, evidence of redirect/dashboard session.
4. If failed, exact error code such as `BAD_OAUTH_SIGNATURE`, `BAD_CONSUMER_KEY`, `STALE_OAUTH_TIMESTAMP`, or iframe/CSP error.

## Important note

`supabaseConfigured:false` means the current runtime still does not write to Supabase. This is acceptable for the next LTI OAuth/iframe test, but Supabase env must be added later before claiming session persistence in Supabase.
