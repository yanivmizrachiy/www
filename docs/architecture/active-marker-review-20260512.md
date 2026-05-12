# Active Marker Review — Moodle Teacher Hub

## Purpose

Review active files that still contain markers like `fake`, `placeholder`, or `MISSING_OAUTH_SIGNATURE` before continuing to Automation Core.

## Safety

- No source code changed.
- No files moved.
- No files deleted.
- No deploy.
- No secrets.
- No student data.

## Summary

- Total findings: `16`
- `FIX_BEFORE_TEACHER_RELEASE`: `2`
- `KEEP_ACTIVE`: `3`
- `REVIEW_REQUIRED`: `7`
- `REVIEW_REQUIRED_BEFORE_DEPLOY`: `4`
- Production blockers: `2`
- Next recommended PR: `fix-supabase-placeholder-fallback`

## Production blockers

- `src/integrations/supabase/client.ts` line `13` marker `placeholder` — `BLOCKER_FOR_PRODUCTION`
- `src/integrations/supabase/client.ts` line `14` marker `placeholder` — `BLOCKER_FOR_PRODUCTION`

## Findings

### `.github/workflows/build-termux-runtime.yml` — line `40` — marker `placeholder`

- severity: `REVIEW_WORKFLOW`
- decision: `REVIEW_REQUIRED`

Context:

```text
38:         env:
39:           VITE_SUPABASE_URL: https://ncoqanascubqkxxfvucfz.supabase.co
40:           VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY || 'termux-runtime-public-placeholder' }}
41:         run: npm run build
42: 
```

### `src/server.js` — line `1713` — marker `fake`

- severity: `REVIEW_RUNTIME_CONTEXT`
- decision: `REVIEW_REQUIRED`

Context:

```text
1711:       safety: {
1712:         existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
1713:         no_fake_success: true
1714:       },
1715:       now: new Date().toISOString()
```

### `src/server.js` — line `2003` — marker `fake`

- severity: `REVIEW_RUNTIME_CONTEXT`
- decision: `REVIEW_REQUIRED`

Context:

```text
2001:       safety: {
2002:         existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
2003:         no_fake_success: true
2004:       },
2005:       now: new Date().toISOString()
```

### `src/server.js` — line `2041` — marker `fake`

- severity: `REVIEW_RUNTIME_CONTEXT`
- decision: `REVIEW_REQUIRED`

Context:

```text
2039:       safety: {
2040:         existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
2041:         no_fake_success: true
2042:       },
2043:       now: new Date().toISOString()
```

### `src/server.js` — line `2058` — marker `fake`

- severity: `REVIEW_RUNTIME_CONTEXT`
- decision: `REVIEW_REQUIRED`

Context:

```text
2056:       safety: {
2057:         existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT,
2058:         no_fake_success: true
2059:       },
2060:       now: new Date().toISOString()
```

### `src/server.js` — line `2137` — marker `fake`

- severity: `REVIEW_RUNTIME_CONTEXT`
- decision: `REVIEW_REQUIRED`

Context:

```text
2135:         : ["Enable Names and Roles / Membership service in Moodle tool settings, save, relaunch, and check again."],
2136:     safety: {
2137:       no_fake_success: true,
2138:       existing_lti11_endpoint_kept: CANONICAL_LTI_ENDPOINT
2139:     },
```

### `src/server.js` — line `69` — marker `MISSING_OAUTH_SIGNATURE`

- severity: `EXPECTED_ERROR_CODE`
- decision: `KEEP_ACTIVE`

Context:

```text
67: 
68:   if (!secret) return { ok: false, status: 503, code: "MISSING_LTI_SHARED_SECRET" };
69:   if (!body.oauth_signature) return { ok: false, status: 401, code: "MISSING_OAUTH_SIGNATURE" };
70:   if (!body.oauth_consumer_key) return { ok: false, status: 401, code: "MISSING_CONSUMER_KEY" };
71:   if (expectedKey && body.oauth_consumer_key !== expectedKey) return { ok: false, status: 401, code: "BAD_CONSUMER_KEY" };
```

### `src/components/ui/input.tsx` — line `14` — marker `placeholder`

- severity: `HARMLESS_HTML_PROP`
- decision: `KEEP_ACTIVE`

Context:

```text
12:         type={type}
13:         className={cn(
14:           "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none f
15:           className
16:         )}
```

### `src/components/ui/textarea.tsx` — line `13` — marker `placeholder`

- severity: `HARMLESS_HTML_PROP`
- decision: `KEEP_ACTIVE`

Context:

```text
11:       <textarea
12:         className={cn(
13:           "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visibl
14:           className
15:         )}
```

### `src/integrations/supabase/client.ts` — line `13` — marker `placeholder`

- severity: `BLOCKER_FOR_PRODUCTION`
- decision: `FIX_BEFORE_TEACHER_RELEASE`

Context:

```text
11: 
12: export const supabase = createClient<Database>(
13:   SUPABASE_URL || "https://placeholder.supabase.co",
14:   SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
15:   {
```

### `src/integrations/supabase/client.ts` — line `14` — marker `placeholder`

- severity: `BLOCKER_FOR_PRODUCTION`
- decision: `FIX_BEFORE_TEACHER_RELEASE`

Context:

```text
12: export const supabase = createClient<Database>(
13:   SUPABASE_URL || "https://placeholder.supabase.co",
14:   SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
15:   {
16:     auth: {
```

### `src/pages/Import.tsx` — line `245` — marker `placeholder`

- severity: `REVIEW`
- decision: `REVIEW_REQUIRED`

Context:

```text
243:                   <CardContent className="flex gap-2 p-2">
244:                     <Textarea
245:                       placeholder="או הדבק כאן טבלת Participants ממודל כולל שורת כותרות..."
246:                       className="min-h-[72px] py-2 text-xs"
247:                       value={pastedText}
```

### `supabase/functions/import-moodle-report/index.ts` — line `6` — marker `demo`

- severity: `REVIEW_BEFORE_SUPABASE_DEPLOY`
- decision: `REVIEW_REQUIRED_BEFORE_DEPLOY`

Context:

```text
4: // Purpose:
5: // Receives real Moodle report rows from the frontend Import screen, validates an LTI session token,
6: // records an import batch, and returns a truthful response. It does not create demo data and does not
7: // claim success unless the database insert succeeds.
8: 
```

### `supabase/functions/lti-launch/index.ts` — line `5` — marker `fake`

- severity: `REVIEW_BEFORE_SUPABASE_DEPLOY`
- decision: `REVIEW_REQUIRED_BEFORE_DEPLOY`

Context:

```text
3: //
4: // This function must not create a Moodle teacher session from unverified request data.
5: // It returns a truthful 501 response so the UI/repo never claim fake LTI readiness.
6: 
7: import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
```

### `supabase/migrations/20260501_initial_schema.sql` — line `3` — marker `demo`

- severity: `REVIEW_BEFORE_SUPABASE_DEPLOY`
- decision: `REVIEW_REQUIRED_BEFORE_DEPLOY`

Context:

```text
1: -- Moodle Teacher Hub reviewed minimal schema
2: -- Status: REVIEWED SOURCE ONLY. Do not run on production Supabase before a final human review.
3: -- Purpose: support verified LTI sessions and Manual Real Data Import batches without demo data.
4: 
5: CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### `supabase/migrations/20260501_initial_schema.sql` — line `70` — marker `demo`

- severity: `REVIEW_BEFORE_SUPABASE_DEPLOY`
- decision: `REVIEW_REQUIRED_BEFORE_DEPLOY`

Context:

```text
68: ALTER TABLE launch_attempts ENABLE ROW LEVEL SECURITY;
69: 
70: COMMENT ON TABLE moodle_sites IS 'Real Moodle sites/spaces configuration. No demo data.';
71: COMMENT ON TABLE teacher_sessions IS 'Verified Moodle LTI teacher sessions. Must not be created from unverified LTI requests.';
72: COMMENT ON TABLE import_batches IS 'Real Moodle report import batches. Row-level parsed data comes in later migrations only after review.';
```

## Decision

Do not continue to Automation Core until production blockers are either fixed or explicitly documented as safe. The current expected blocker is Supabase placeholder fallback in the active frontend client.
