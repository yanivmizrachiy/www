# Automatic LTI routing fix stack — 2026-05-06

## Purpose

Document the focused automatic repair stack for the Moodle Teacher Hub issue where a verified Moodle/LTI session existed but the React app still showed the Hebrew NotFound screen:

```text
העמוד לא נמצא
הנתיב המבוקש לא קיים באפליקציה
```

## Root problem identified

Evidence from screenshots showed:

```text
/api/bootstrap?t=... returned verified: true
/api/imports/overview?t=... returned 200
```

Therefore the issue was not basic Render availability and not a total LTI failure. The likely root was routing/redirect/cache around this transition:

```text
Moodle POST /api/lti/launch
-> Express verifies LTI
-> Express redirects to React route /lti?t=TOKEN
-> React stores token
-> React should navigate to a real app page
```

The app could still land on an API-like path, especially `/api/lti/launch`, which React does not normally own as a UI page. That path previously fell to the SPA NotFound route.

## Automatic fixes added

### 1. Frontend rescue route

`src/App.tsx` now includes a rescue route:

```text
/api/lti/launch -> /import
```

This prevents the React SPA from showing NotFound if the iframe/browser lands on the backend launch URL as a page.

Commit observed:

```text
a3bfbc2 Add frontend rescue route for LTI launch endpoint
```

### 2. LTI bootstrap routes directly to Import

`src/pages/LtiBootstrap.tsx` now defaults successful launches to:

```text
/import
```

It also supports a safe `next` query/hash parameter and blocks unsafe `/api/...` next paths by falling back to `/import`.

Commit observed:

```text
9abb250 Route successful Moodle launch directly to import page
```

### 3. Automatic server patch script

`scripts/fix-lti-routing-redirect-cache.cjs` applies server-side hardening automatically:

```text
GET /api/lti/launch rescue route
POST /api/lti/launch -> 303 redirect to /lti?t=TOKEN&next=/import
no-store headers for bootstrap/import session endpoints
health marker ltiRoutingFixVersion
```

Latest script improvement commit observed:

```text
84714be Add health marker for automatic LTI routing fix
```

### 4. Build now applies and verifies the fix

`package.json` build script now runs:

```text
node scripts/fix-lti-routing-redirect-cache.cjs && node --check src/server.js && vite build
```

This means Render build fails if the automatic server patch breaks syntax.

Commit observed:

```text
33ce125 Fail build if automatic LTI routing fix breaks server syntax
```

### 5. Start now applies and verifies the fix again

`package.json` start script now runs:

```text
node scripts/fix-lti-routing-redirect-cache.cjs && node --check src/server.js && node src/server.js
```

This provides a second safety layer: even if build and runtime file states differ, the server is patched and syntax-checked before startup.

Commit observed:

```text
30e193e Apply LTI routing fix before server start
```

## Verified from repository reads

### package.json

The current package scripts include:

```text
start: node scripts/fix-lti-routing-redirect-cache.cjs && node --check src/server.js && node src/server.js
build: node scripts/fix-lti-routing-redirect-cache.cjs && node --check src/server.js && vite build
```

### render.yaml

Render service is configured as:

```text
branch: gemini/ai-studio-sync-20260428-193953
buildCommand: npm ci --include=dev && npm run build
startCommand: npm run start
healthCheckPath: /health
autoDeploy: true
```

This means Render should automatically deploy the branch and run the fix in both build and startup phases.

## Next verification marker

After Render deploys the latest branch, `/health` should include:

```json
"ltiRoutingFixVersion": "2026-05-06-render-lti-routing-cache-v2"
```

If this marker appears, Render is running the patched LTI routing/cache stack.

## Success definition

The current routing issue is fixed only when opening the tool from Moodle results in:

```text
Moodle Teacher Hub opens inside Moodle
No Hebrew NotFound screen
The user reaches Import / ייבוא נתונים
```

Then the next MVP validation is:

```text
Import real Moodle Participants report
Students count becomes greater than 0
Students page shows real names
```

## Not done yet

```text
Real Moodle Participants import has not yet been verified.
Students page real names have not yet been verified.
Gradebook import has not started.
Logs/activity import has not started.
Supabase persistence is still not proven as the active storage path.
```
