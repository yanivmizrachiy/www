# Moodle Teacher Hub — Production Hardening Status

Generated: 20260501-070424

## What changed

- Canonical LTI endpoint enforced: /api/lti/launch
- Runtime server replaced: src/server.js
- Source server aligned: server.ts
- Demo/default production login removed.
- OAuth1 HMAC-SHA1 verification added.
- Missing OAuth/secret/key now blocks launch.
- data/store.json reset to empty real-data structure.
- .env.example updated without real secrets.
- Moodle setup guide updated.
- SQL remains draft-only. No SQL was run.
- No Supabase deploy was performed.
- Moodle Tool URL was not changed by this script.

## Current rule

The app can move to real Moodle testing only after:
- APP_BASE_URL is set to the public server URL.
- LTI_CONSUMER_KEY is set.
- LTI_SHARED_SECRET is set in server environment only.
- Moodle launches successfully into /api/lti/launch.
- STATE/evidence-log.md records real launch evidence.

READY_FOR_MOODLE_USE remains controlled until real evidence exists.
