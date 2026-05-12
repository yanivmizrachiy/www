# Node bootstrap session bridge plan — 2026-05-03

## Evidence

The Moodle iframe now loads the app UI without visible tunnel/CSS console errors, but the app still displays `לא מחובר`.

## Root cause

The React hook `useLtiSession` reads the LTI token and calls Supabase RPC `lti_get_context`. The current runtime is not configured for Supabase persistence and the verified Supabase database currently only has basic LTI tables. Therefore the frontend can render but cannot resolve a connected context through Supabase.

The Node server already creates a real LTI session token and exposes `/api/bootstrap`. The correct next fix is to allow the frontend to resolve the Moodle-launched session from the Node server first, using the token from `/lti?t=...`, before falling back to Supabase RPC.

## Intended non-demo flow

```text
Moodle POST /api/lti/launch
-> OAuth verified
-> Node creates real sessionToken from real Moodle payload
-> redirect /lti?t=sessionToken
-> React stores token
-> React calls /api/bootstrap?t=sessionToken
-> Dashboard becomes connected from real Moodle launch data
```

## Not a fake/demo change

This uses the real session token created by the verified LTI launch path. It does not create fake students, grades, tasks, or activity. Those remain missing until real Moodle reports are imported.

## Additional required server fix

The server currently stores session data by cookie sid. Because Moodle embeds the app in an iframe, third-party cookie behavior may be unreliable. The server should also keep a short-lived in-memory map from `sessionToken` to the same session data so `/api/bootstrap?t=...` can resolve the verified launch without relying on iframe cookies.

## Production note

This is a dev/session-flow bridge. Later, session tokens should persist in Supabase once `supabaseConfigured:true` and schema/RPC compatibility are verified.
