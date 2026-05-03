# Moodle iframe loaded, app not connected — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User screenshot from real Ministry Moodle after opening the external tool `Moodle Teacher Hub`.

## Verified from screenshot

- Moodle page successfully displays the embedded Moodle Teacher Hub UI inside the Moodle external tool area.
- The previous `503 - Tunnel Unavailable` blocker is no longer visible in the screenshot.
- The previous Chrome `X-Frame-Options: SAMEORIGIN` blocker is no longer the visible blocker.
- The app UI is Hebrew/RTL and shows a navigation sidebar with real buttons such as:
  - `מרכז המורה`
  - `ייבוא נתונים`
  - `תלמידים`
  - `משימות`
  - `פרקים`
  - `ציונים`
  - `פעילות / זמנים`
  - `דוחות`
  - `ייצוא`
  - `הגדרות`
  - `התקנה / חיבור Moodle`
- The app status visible in the screenshot is `לא מחובר`.
- The main panel message indicates the app is still waiting for / has not completed an authenticated Moodle/LTI launch session.

## Current interpretation

The public tunnel and iframe embedding path are now far enough for the React app to render inside Moodle. However, the app does not yet recognize a verified LTI session. This means the next blocker is session/launch handling, not basic reachability.

Likely possibilities to investigate:

1. Moodle opened the app by GET/static route instead of sending a POST to `/api/lti/launch`.
2. Moodle POST reached `/api/lti/launch`, but OAuth verification failed and the frontend fell back to the dashboard.
3. Moodle POST succeeded, but redirect/token route is mismatched.
4. Cookie/session did not persist inside iframe due to SameSite/Secure/cross-site behavior.
5. React side expects token/context in one path while server redirects to a different path.

## Current truth

```text
Moodle embedded app display: verified
Iframe blocker: no longer visible
Tunnel blocker: not visible in latest screenshot
Frontend Hebrew RTL navigation: visible
LTI connected state: not connected
Real OAuth success: not yet proven
Supabase persistence: not configured in runtime health / not proven
Production-ready: no
```

## Next required evidence

Capture the Node server console output around the Moodle launch attempt. Specifically, after clicking the tool in Moodle, read the last server log/PowerShell lines. If no log appears, add temporary safe logging around `/api/lti/launch` in the server.

The next useful proof is whether the request reached:

```text
POST /api/lti/launch
```

and whether the result was:

```text
OAUTH_VERIFIED
BAD_OAUTH_SIGNATURE
BAD_CONSUMER_KEY
MISSING_OAUTH_SIGNATURE
STALE_OAUTH_TIMESTAMP
```

## Next technical focus

Do not add features. Fix the LTI session flow:

```text
Moodle POST /api/lti/launch -> OAuth verified -> session token created -> redirect to React /lti -> token stored -> dashboard connected
```
