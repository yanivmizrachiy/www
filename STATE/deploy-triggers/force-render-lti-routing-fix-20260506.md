# Trigger Render deploy for LTI routing fix — 2026-05-06

## Purpose

Create a harmless source-of-truth commit to trigger Render Auto Deploy after the automatic LTI routing/cache fix stack was added.

## Why this exists

The project needs Render to rebuild and restart with the latest branch state. The current fix stack depends on Render running:

```text
npm run build
npm run start
```

Both scripts now run:

```text
node scripts/fix-lti-routing-redirect-cache.cjs
node --check src/server.js
```

This file does not change application behavior by itself. It exists to force a new GitHub commit so Render Auto Deploy has a fresh event to process.

## Expected live marker after deployment

After Render completes the deployment, `/health` should include:

```json
"ltiRoutingFixVersion": "2026-05-06-render-lti-routing-cache-v2"
```

## Success definition

The routing fix is considered successful only if opening Moodle Teacher Hub from Moodle no longer shows:

```text
העמוד לא נמצא
```

and instead opens the app on:

```text
/import
ייבוא נתונים
```

## Not verified yet

```text
Render deploy completion: not yet verified
Live /health marker: not yet verified
Moodle open after deploy: not yet verified
Real Participants import: not yet verified
```
