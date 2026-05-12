# Cloudflare health with LTI readiness false — 2026-05-04

## Evidence

Current Cloudflare quick tunnel URL:

```text
https://symbols-reaching-statewide-copies.trycloudflare.com
```

Public health returned HTTP 200 through Cloudflare, but the JSON body showed:

```text
readyForMoodleUse:false
supabaseConfigured:false
```

## Interpretation

Cloudflare public reachability works, but the currently running Node server process was started without the required LTI runtime variables, especially `LTI_SHARED_SECRET` and/or `LTI_CONSUMER_KEY`.

The LTI session bridge code is already pushed on the branch, with commit `1164bb7`, and the local repo is at `c6c7723`. The next step is not code editing. The next step is restarting the Node process in a way that guarantees the environment variables are present in that exact process.

## Next action

Keep the cloudflared window open. Kill the old Node process on port 3000. Start `npm run start` in the same PowerShell window after setting:

```text
APP_BASE_URL=https://symbols-reaching-statewide-copies.trycloudflare.com
LTI_CONSUMER_KEY=yaniv-lti-tool
LTI_SHARED_SECRET=<local only>
COOKIE_SECURE=true
```

Then verify `/health` must show `readyForMoodleUse:true` before testing Moodle.
