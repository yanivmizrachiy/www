# Cloudflare Quick Tunnel Created — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User pasted Windows PowerShell output after running:

```powershell
cloudflared tunnel --url http://127.0.0.1:3000
```

## Verified from output

Cloudflare quick tunnel was created:

```text
https://transaction-ranger-producer-gmbh.trycloudflare.com
```

Cloudflared output showed:

```text
Registered tunnel connection
protocol=quic
url=http://127.0.0.1:3000
```

## Interpretation

Localtunnel was unstable for static assets and returned 503 for CSS. Cloudflare Tunnel is now the better temporary public URL for the next Moodle LTI test.

## Required exact URL alignment

For LTI OAuth1 signature validation, the same base URL must be used in both places:

```text
APP_BASE_URL=https://transaction-ranger-producer-gmbh.trycloudflare.com
Moodle Tool URL=https://transaction-ranger-producer-gmbh.trycloudflare.com/api/lti/launch
```

## Current truth

```text
Cloudflare quick tunnel: created
Cloudflare public health: not yet verified in this evidence file
Server APP_BASE_URL: still must be restarted with the new Cloudflare URL
Moodle Tool URL: still must be updated from the old Localtunnel URL to the new Cloudflare URL
Real Moodle launch through Cloudflare: not yet verified
Production-ready: no
```

## Safety note

This is still an account-less quick tunnel, useful for testing only. It is not a production deployment and has no uptime guarantee.
