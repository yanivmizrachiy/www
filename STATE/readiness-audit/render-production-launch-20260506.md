# Render production launch state — 2026-05-06

## Purpose

This file documents the permanent deployment transition for Moodle Teacher Hub.

The user explicitly requested to stop using temporary Termux/Cloudflare URLs and move to a fixed, practical production-like URL.

## Current permanent runtime

Render Web Service:

```text
https://www-tijc.onrender.com
```

Canonical LTI endpoint on Render:

```text
https://www-tijc.onrender.com/api/lti/launch
```

Health endpoint:

```text
https://www-tijc.onrender.com/health
```

## Render evidence from user screenshots

Render logs showed:

```text
moodle-teacher-hub running on port 10000
canonical LTI endpoint: /api/lti/launch
Your service is live
Available at your primary URL https://www-tijc.onrender.com
```

An earlier Render deployment failed because:

```text
sh: 1: vite: not found
Exited with status 127
```

The fix was to change the Render Build Command to:

```text
npm ci --include=dev && npm run build
```

After the fix, Render logs showed:

```text
built in 4.49s
Build successful
Deploying
Your service is live
```

## Render environment variables configured/expected

Required:

```text
NODE_ENV=production
PORT=10000
COOKIE_SECURE=true
LTI_CONSUMER_KEY=yaniv-lti-tool
LTI_SHARED_SECRET=<same value as Moodle>
APP_BASE_URL=https://www-tijc.onrender.com
VITE_SUPABASE_URL=https://ncoqanascubqkxfvucfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon key>
```

Optional / only when persistence is implemented and verified:

```text
SUPABASE_SERVICE_ROLE_KEY=<server-only key, never exposed to browser>
```

## Architecture decision

The permanent simplified LTI launch path is now:

```text
Moodle -> Render /api/lti/launch -> Moodle Teacher Hub
```

Supabase Gateway is no longer the preferred LTI launch path because it introduced a forwarding/signature problem and produced:

```text
Moodle Teacher Hub blocked launch: MISSING_OAUTH_SIGNATURE
```

The direct Render path avoids forwarding and lets Moodle send OAuth1 LTI parameters directly to the Node runtime.

## Moodle configuration that should be used now

Tool URL:

```text
https://www-tijc.onrender.com/api/lti/launch
```

LTI version:

```text
LTI 1.0/1.1
```

Consumer key:

```text
yaniv-lti-tool
```

Shared secret:

```text
Must match Render LTI_SHARED_SECRET exactly.
Do not store the secret value in GitHub.
```

## Supabase status

Correct project ref confirmed by user evidence:

```text
ncoqanascubqkxfvucfz
```

Gateway health was confirmed at:

```text
https://ncoqanascubqkxfvucfz.supabase.co/functions/v1/lti-launch
```

GET response showed:

```json
{"service":"LTI 1.1 Permanent Gateway","status":"ok","project":"moodle-teacher-hub","runtime_configured":true}
```

However, Supabase Gateway should not be the current LTI launch route until gateway-to-runtime signature forwarding is explicitly fixed and verified.

Supabase remains relevant for:

- database persistence
- imported Moodle reports
- future verified API/RPC workflows

## Data truth

The permanent Render launch verifies connection/context only.

It does not automatically provide:

- student list
- grades
- logs
- practice time
- activity completion

Until Moodle Web Services token or LTI 1.3 Advantage is available and verified, real data comes from Manual Real Data Import:

1. Participants / Students report
2. Gradebook report
3. Logs report
4. Activity completion report

## Current verified progress

```text
Permanent server deployed: verified by Render screenshot/log
Build command fixed: verified by Render successful build log
Direct permanent URL exists: verified by Render screenshot/log
LTI connected after direct launch: user reported "מחובר"
Student/grade data import: not yet verified
Moodle Web Services API: blocked-no-token / not verified
Production-ready for all teachers: partial, not final
```

## Next required work before continuing product features

1. Keep Moodle Tool URL on the direct Render endpoint.
2. Confirm direct LTI launch displays connected context.
3. Import a real Moodle Participants report and verify names appear.
4. Document the import result in `STATE/evidence-log.md`.
5. Only then continue grades/logs/practice-time workflows.
