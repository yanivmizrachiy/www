# Termux Runtime and Tunnel Evidence — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User pasted Termux output after running the local runtime script.

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

## Important correction

The script printed `TUNNEL_OK`, but the public health check actually timed out:

```text
curl: (28) Operation timed out after 15002 milliseconds with 0 bytes received
```

Therefore public Localtunnel reachability is **not verified**. Treat the printed `TUNNEL_OK` as a false positive from the script logic, not as evidence that the tunnel works.

## Current truth

```text
Local Node server: verified working
LTI secret loaded into local process: yes, from user terminal output
readyForMoodleUse in local health: true
Supabase configured in local runtime: false
Public tunnel health: failed / timed out
Moodle launch through tunnel: not verified
Real OAuth verification from Moodle: not verified
```

## Security note

A real LTI shared-secret-like value was pasted into the chat during troubleshooting. Do not commit it, do not repeat it in docs, and rotate the Moodle external tool shared secret before any real or production use.

## Next technical action

Fix tunnel reachability first. Do not test Moodle launch until `https://nasty-rabbits-wait.loca.lt/health` returns the local health JSON.

Potential next options:

1. Check `~/moodle-hub-logs/tunnel.log` for the actual Localtunnel URL or error.
2. Use a different temporary tunnel provider if Localtunnel does not work reliably on Termux.
3. Use a stable deployment host instead of phone-hosted Termux for LTI testing.
4. After tunnel works, update Moodle Tool URL and APP_BASE_URL to match exactly.
