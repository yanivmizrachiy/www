# Termux Runtime and Tunnel Evidence — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User pasted Termux output after running the local runtime script and then pasted the tunnel log.

## Verified from output

- Runtime script executed: `start-moodle-hub-runtime-now.sh`.
- User entered an LTI shared secret locally into the Termux prompt.
- The script accepted the secret and reported a non-zero length. The secret value itself must not be stored in GitHub.
- Node server started successfully.
- Local health endpoint succeeded: `http://127.0.0.1:3000/health`.
- Local health output:
  - `ok: true`
  - `service: moodle-teacher-hub`
  - `canonicalLtiEndpoint: /api/lti/launch`
  - `oauthVerification: required`
  - `supabaseConfigured: false`
  - `readyForMoodleUse: true`
- Server log shows:
  - `moodle-teacher-hub running on port 3000`
  - `canonical LTI endpoint: /api/lti/launch`
- Tunnel log now shows repeated alive messages for:
  - `https://nasty-rabbits-wait.loca.lt`
  - timestamps around `2026-05-03T13:59:15Z` through `2026-05-03T14:03:15Z`.

## Important correction

The earlier script printed `TUNNEL_OK`, but the public health check actually timed out:

```text
curl: (28) Operation timed out after 15002 milliseconds with 0 bytes received
```

Later tunnel logs show the Localtunnel process is alive and holding the expected URL, but public HTTP health is still not verified until `https://nasty-rabbits-wait.loca.lt/health` returns JSON from the local Node server.

## Current truth

```text
Local Node server: verified working
LTI secret loaded into local process: yes, from user terminal output
readyForMoodleUse in local health: true
Supabase configured in local runtime: false
Localtunnel process: alive according to tunnel log
Public tunnel health JSON: not verified yet
Moodle launch through tunnel: not verified
Real OAuth verification from Moodle: not verified
```

## Security note

A real LTI shared-secret-like value was pasted into the chat during troubleshooting. Do not commit it, do not repeat it in docs, and rotate the Moodle external tool shared secret before any real or production use.

## Next technical action

Verify public tunnel reachability directly. If `https://nasty-rabbits-wait.loca.lt/health` returns the local server health JSON, then the next step is a real Moodle launch attempt. If it returns a Localtunnel password/interstitial page or times out, the tunnel layer is still the blocker.
