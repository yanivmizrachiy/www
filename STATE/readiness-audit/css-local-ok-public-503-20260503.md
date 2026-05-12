# CSS local OK, public tunnel 503 — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence

User ran a PowerShell check for the exact CSS asset requested by the Moodle-embedded app:

```text
assets/index-Ba-IsUbH.css
```

## Result

Local server result:

```text
LOCAL_STATUS=200 LENGTH=27267
```

Public Localtunnel result:

```text
PUBLIC_FAILED: Response status code does not indicate success: 503 (Service Unavailable)
```

## Interpretation

The Vite build and Node static serving are correct locally. The CSS file exists and is served by the local server.

The failure is in the public Localtunnel layer, not in the app code, not in Moodle, and not in the CSS build output.

## Current truth

```text
Local CSS asset: verified OK
Public CSS asset through Localtunnel: failing 503
Local Node app: serving static assets correctly
Temporary tunnel reliability: not good enough for current Moodle testing
Moodle app render: partial because assets may fail through tunnel
Production-ready: no
```

## Next decision

Stop spending time debugging app code for this symptom. Replace or stabilize the public tunnel. The recommended next path is to use a more stable temporary tunnel/deployment URL, then update both:

```text
Moodle Tool URL
APP_BASE_URL used by the Node server
```

The two URLs must match exactly for LTI OAuth signature validation.
