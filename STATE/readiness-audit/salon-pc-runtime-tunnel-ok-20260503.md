# Salon PC Runtime Tunnel Success — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`
Local runtime folder used on Windows Salon PC: `C:\Users\yaniv\Desktop\MoodleHub-runtime`

## Evidence source

User pasted PowerShell output from the Salon PC runtime command.

## Verified from output

- The repository was cloned into `C:\Users\yaniv\Desktop\MoodleHub-runtime`.
- Branch checked out: `gemini/ai-studio-sync-20260428-193953`.
- Head observed: `f1bfe37 Update Termux tunnel evidence with alive log`.
- `npm install` completed successfully.
- `npm run build` completed successfully with Vite 5.4.21.
- Local server health returned JSON successfully.
- The output ended with:

```text
TUNNEL_OK - עכשיו פתח את Moodle Teacher Hub מתוך מודל
https://nasty-rabbits-wait.loca.lt/api/lti/launch
```

## Current truth

```text
Windows Salon PC runtime: working
Build on Salon PC: verified passing
Local health on Salon PC: verified passing
Public Localtunnel URL: verified by command output as TUNNEL_OK
Current Moodle Tool URL target: https://nasty-rabbits-wait.loca.lt/api/lti/launch
Real Moodle launch after TUNNEL_OK: not yet verified
Real OAuth1 HMAC-SHA1 result: not yet verified
Supabase runtime connection: still not confirmed in pasted output
Production-ready: no
```

## Next required evidence

Open the external tool from inside the real Ministry Moodle course, not directly from the URL. Capture:

1. The browser screen after clicking `Moodle Teacher Hub` in Moodle.
2. The last lines from the Node server PowerShell window around the launch attempt.

Expected useful outcomes:

- Success: app dashboard opens through `/lti` / session token flow.
- OAuth failure: exact code such as `BAD_OAUTH_SIGNATURE`, `BAD_CONSUMER_KEY`, `MISSING_LTI_SHARED_SECRET`, or `STALE_OAUTH_TIMESTAMP`.
- Reachability failure: 503/timeout, which would mean the tunnel went down again.

## Safety note

Do not paste or commit the LTI shared secret. The secret was exposed earlier in chat and should be rotated before real/production use.
