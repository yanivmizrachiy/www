# Project Status — www / Moodle Teacher Hub

Updated: 2026-05-06
Repository: `yanivmizrachiy/www`
Active work branch: `gemini/ai-studio-sync-20260428-193953`
PR: #1 — Draft / not merged / not production-ready for all teachers

## Current source-of-truth position

Moodle Teacher Hub now has a permanent Render runtime URL and no longer depends on Termux or temporary Cloudflare/Localtunnel URLs for the main LTI launch path.

Current preferred architecture:

```text
Moodle External Tool
  -> Render permanent Node endpoint /api/lti/launch
  -> React/Vite Moodle Teacher Hub UI
  -> Supabase project moodle-teacher-hub for future persistence/import workflows
  -> Manual Real Data Import until Moodle Web Services token is verified
```

## Current permanent runtime

Render Web Service:

```text
https://www-tijc.onrender.com
```

Canonical LTI endpoint:

```text
https://www-tijc.onrender.com/api/lti/launch
```

Health endpoint:

```text
https://www-tijc.onrender.com/health
```

Render evidence from user screenshots showed:

```text
moodle-teacher-hub running on port 10000
canonical LTI endpoint: /api/lti/launch
Your service is live
Available at your primary URL https://www-tijc.onrender.com
```

## Render build status

An initial Render deploy failed with:

```text
sh: 1: vite: not found
Exited with status 127
```

The build command was fixed to:

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

The repository `render.yaml` was updated to match the working Render configuration.

## Required Render environment variables

Required:

```text
NODE_ENV=production
PORT=10000
COOKIE_SECURE=true
LTI_CONSUMER_KEY=yaniv-lti-tool
LTI_SHARED_SECRET=<same value as Moodle; never commit>
APP_BASE_URL=https://www-tijc.onrender.com
VITE_SUPABASE_URL=https://ncoqanascubqkxfvucfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon key>
```

Optional / only when persistence is implemented and verified:

```text
SUPABASE_SERVICE_ROLE_KEY=<server-only key; never expose to browser>
```

## Moodle configuration now recommended

The current simple permanent LTI path should be direct Moodle -> Render.

Moodle Tool URL should be:

```text
https://www-tijc.onrender.com/api/lti/launch
```

Moodle settings:

```text
LTI version: LTI 1.0/1.1
Consumer key: yaniv-lti-tool
Shared secret: must exactly match Render LTI_SHARED_SECRET
```

## Supabase status

Correct project ref confirmed by user evidence:

```text
ncoqanascubqkxfvucfz
```

Supabase Gateway health was confirmed at:

```text
https://ncoqanascubqkxfvucfz.supabase.co/functions/v1/lti-launch
```

GET response showed:

```json
{"service":"LTI 1.1 Permanent Gateway","status":"ok","project":"moodle-teacher-hub","runtime_configured":true}
```

However, the Supabase Gateway is not the current recommended LTI launch path because the gateway-forwarded path produced:

```text
Moodle Teacher Hub blocked launch: MISSING_OAUTH_SIGNATURE
```

Decision: do not use Supabase Gateway as the active LTI launch route until gateway-to-runtime OAuth forwarding/signature behavior is fixed and verified.

Supabase remains relevant for:

- database persistence
- imported Moodle report storage
- future RPC/API workflows
- possible future Web Services integration

## Data truth

The successful direct Render LTI connection verifies login/context only.

It does not automatically provide:

- student list
- grades
- logs
- activity completion
- practice time

Until Moodle Web Services token or LTI 1.3 Advantage is available and verified, real data must come from Manual Real Data Import:

1. Participants / Students report
2. Gradebook report
3. Logs report
4. Activity completion report

The Import page and parser exist, but real import end-to-end is not yet verified.

## Current status table

| Area | Status |
|---|---|
| Requirements | Strong / captured |
| Source repo | Verified |
| Active branch | Verified |
| Render runtime | Live / verified by user screenshot |
| Render build | Passed after build-command fix |
| Permanent URL | `https://www-tijc.onrender.com` |
| Canonical LTI endpoint | `/api/lti/launch` |
| Direct Moodle -> Render LTI | User reported connected; should be treated as partially verified until evidence is added to evidence-log |
| Supabase Gateway | Health OK, but not active LTI path due MISSING_OAUTH_SIGNATURE when forwarding |
| Termux/Cloudflare | No longer required for active launch path |
| Manual import end-to-end | Not verified |
| Moodle Web Services token | Not verified / blocked-no-token |
| Production readiness | Partial; not ready for all teachers until data import/persistence verified |

## Current blockers

1. Manual import end-to-end has not yet been verified with a real Moodle Participants report.
2. Student names/grades/logs do not appear automatically from LTI 1.0/1.1.
3. Moodle Web Services token is not verified.
4. Supabase persistence/import storage still needs schema/RPC verification.
5. Supabase Gateway should not be used as LTI forwarding route until signature forwarding is fixed and verified.

## Do not do

- Do not return to Termux/Cloudflare temporary URLs for the production launch path.
- Do not use the Supabase Gateway as active LTI route unless it is fixed and verified.
- Do not rebuild the app from scratch.
- Do not create a new repo.
- Do not merge PR #1 while Draft/diverged without review.
- Do not run old AI SQL blindly.
- Do not expose or commit secrets.
- Do not use fake students, fake grades, fake activity, or fake practice time.
- Do not claim full production-ready status.

## Current next step

Verify the first real data workflow:

```text
Moodle course -> Participants report export/copy -> Moodle Teacher Hub Import page -> confirm preview -> import -> Students page shows real names
```

After that, update:

- `STATE/evidence-log.md`
- `STATE/readiness-audit/*`
- any relevant docs if the workflow changes

## Related audit files

- `STATE/readiness-audit/render-production-launch-20260506.md`
- `STATE/readiness-audit/dashboard-data-fallback-20260505.md`
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505.md`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/supabase-existing-state-audit-20260503.md`

## Current readiness estimate

```text
Requirements clarity: 99%
Repo governance: 95%
Permanent runtime deployment: verified
Direct LTI launch: likely working / needs final evidence-log entry
Supabase Gateway: health OK but not active route
Manual import: not verified end-to-end
Moodle API/Web Services: blocked-no-token
Overall execution readiness: 78%-82%
Production-ready for broad teacher use: no
```
