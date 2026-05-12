# Frontend Supabase Environment Missing — 2026-05-03

Repository: `yanivmizrachiy/www`
Branch: `gemini/ai-studio-sync-20260428-193953`

## Evidence source

User screenshots from the Moodle-embedded app and Chrome DevTools Console after the app loaded inside Ministry Moodle.

## Verified from screenshots

The UI displays a red error:

```text
שגיאה בסנכרון נתונים
TypeError: Failed to fetch
```

Chrome DevTools Console shows:

```text
Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the project settings.
```

and failed requests to:

```text
https://placeholder.supabase.co/rest/v1/rpc/lti_get_context
https://placeholder.supabase.co/rest/v1/rpc/lti_get_imports_overview
```

with:

```text
net::ERR_NAME_NOT_RESOLVED
```

## Interpretation

This is not a Moodle tunnel failure, not an iframe failure, and not yet an OAuth signature failure. The React frontend was built without the required Vite-time Supabase public environment variables, so the bundle is using the placeholder Supabase URL from `src/integrations/supabase/client.ts`.

The existing public tunnel and app rendering reached the point where the React app is trying to call Supabase RPCs, but it is calling the placeholder host instead of the real Supabase project.

## Current truth

```text
Moodle iframe app render: verified
Tunnel/app reachability: verified enough for frontend to load
Frontend Supabase env: missing at build time
Supabase target currently used by frontend: placeholder.supabase.co
Real Supabase project to use: https://ncoqanascubqkxxfvucfz.supabase.co
Publishable key: must be supplied locally/build environment; do not commit service role key
Runtime Supabase writes from Node: still not configured unless service role is supplied locally
Production-ready: no
```

## Required fix

Rebuild the frontend on the Salon PC with:

```text
VITE_SUPABASE_URL=https://ncoqanascubqkxxfvucfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon key from Dashboard, local only>
```

Then restart the Node server and Localtunnel.

## Security note

The `VITE_SUPABASE_PUBLISHABLE_KEY` / anon key is designed for frontend use, but it should still not be pasted into chat unless explicitly needed. `SUPABASE_SERVICE_ROLE_KEY` is secret and must never be pasted into chat or committed to GitHub.

## Next validation

After rebuilding, Chrome Console must no longer show requests to `placeholder.supabase.co`. Requests should go to:

```text
https://ncoqanascubqkxxfvucfz.supabase.co/rest/v1/rpc/...
```

If those RPCs fail because functions are missing, that becomes the next real backend/schema issue. But the placeholder/env issue must be fixed first.
