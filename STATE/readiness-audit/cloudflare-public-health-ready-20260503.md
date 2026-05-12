# Cloudflare Public Health Ready — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User pasted Windows PowerShell output from Salon PC:

```powershell
curl.exe -i --max-time 20 "https://transaction-ranger-producer-gmbh.trycloudflare.com/health"
```

## Verified result

Cloudflare Tunnel public URL returned:

```text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Server: cloudflare
```

Response headers included Moodle iframe CSP allowlist:

```text
content-security-policy: frame-ancestors 'self' https://moodlemoe.lms.education.gov.il https://*.lms.education.gov.il;
```

Response JSON included:

```json
{
  "ok": true,
  "service": "moodle-teacher-hub",
  "canonicalLtiEndpoint": "/api/lti/launch",
  "oauthVerification": "required",
  "supabaseConfigured": false,
  "readyForMoodleUse": true,
  "counts": {
    "launches": 5,
    "teachers": 2,
    "spaces": 2,
    "students": 0,
    "tasks": 0,
    "grades": 0,
    "activitySessions": 0,
    "moodleCaptures": 3
  }
}
```

## Current truth

```text
Cloudflare public tunnel: verified reachable
Node server through Cloudflare: verified reachable
readyForMoodleUse: true
Moodle iframe CSP: present in response headers
APP_BASE_URL currently aligned to Cloudflare URL for local server process
Supabase runtime connection: false
Real Moodle launch through Cloudflare: next step
Production-ready: no
```

## Next required action

Update the Moodle external tool URL to exactly:

```text
https://transaction-ranger-producer-gmbh.trycloudflare.com/api/lti/launch
```

Then save Moodle settings and open the tool from inside Moodle.

Expected next evidence:

- If successful: connected dashboard / verified session.
- If failed: exact OAuth or frontend error from Console/server logs.

## Note

`supabaseConfigured:false` remains. This does not block the immediate LTI launch/iframe test, but Supabase persistence is not verified until runtime is started with Supabase service env and schema/RPC compatibility is checked.
