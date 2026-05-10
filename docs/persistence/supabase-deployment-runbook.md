# Supabase Deployment Runbook — Moodle Teacher Hub

Status: prepared, not executed.

This runbook defines the safe order for activating Supabase for Moodle Teacher Hub. It intentionally does not contain any secret values.

## Source of truth

- Repository: `yanivmizrachiy/www`
- Branch: `gemini/ai-studio-sync-20260428-193953`
- Current verified build/typecheck commit before this runbook: `2036f8f Ignore TypeScript build info files`

## Current Supabase-related source files

- `supabase/migrations/20260501_initial_schema.sql`
- `supabase/functions/import-moodle-report/index.ts`
- `supabase/functions/lti-launch/index.ts`
- `.env.example`

## What is allowed now

- Review SQL source in GitHub.
- Review Edge Function source in GitHub.
- Prepare environment variable names without values.
- Test TypeScript/build locally.
- Keep the Moodle Tool URL unchanged until deployment is verified.

## What is not allowed yet

- Do not run SQL automatically.
- Do not deploy Edge Functions automatically.
- Do not paste real secrets into chat.
- Do not commit any `.env` file.
- Do not claim production readiness.
- Do not change Moodle Tool URL before endpoint and signature verification are confirmed.

## Required Supabase secrets / env vars

These names are allowed to appear in documentation, but values must not be committed:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_ORIGIN`
- `APP_BASE_URL`
- `LTI_CONSUMER_KEY`
- `LTI_SHARED_SECRET`

## Activation sequence

### Step 1 — SQL review

Review `supabase/migrations/20260501_initial_schema.sql` manually before execution.

Minimum checks:

- Uses `gen_random_uuid()` and enables `pgcrypto`.
- Creates `moodle_sites`, `teacher_sessions`, `import_batches`, `launch_attempts`.
- Enables RLS on the created tables.
- Does not include demo data.
- Does not include secrets.

### Step 2 — SQL execution

Only after review, execute the reviewed SQL once in Supabase SQL Editor for project `moodle-teacher-hub`.

After execution, verify tables exist:

- `moodle_sites`
- `teacher_sessions`
- `import_batches`
- `launch_attempts`

### Step 3 — Edge Function deployment

Deploy only reviewed function source:

- `supabase/functions/import-moodle-report/index.ts`
- `supabase/functions/lti-launch/index.ts`

Do not deploy any function that contains `const is_valid = true` or creates sessions from unverified LTI payloads.

### Step 4 — Secrets setup

Set required secrets in Supabase / deployment environment only. Do not store values in GitHub.

### Step 5 — Smoke tests

Test these before changing Moodle Tool URL:

- `import-moodle-report` with no session returns a truthful missing-session response.
- `lti-launch` does not create a session without valid OAuth1 HMAC-SHA1.
- The frontend still passes `npm run typecheck` and `npm run build`.

### Step 6 — Real Moodle test

Only after deployment and secrets are verified:

- Configure Moodle External Tool to the verified public endpoint.
- Launch from real Moodle.
- Confirm OAuth is verified.
- Confirm a real session is created.
- Confirm no demo data appears.
- Record evidence in `STATE/evidence-log.md`.

## Production readiness gate

The app is not production-ready until all of these are true:

- Typecheck passed.
- Build passed.
- Supabase SQL applied and verified.
- Edge Functions deployed and verified.
- Real Moodle LTI launch verified.
- Manual real Moodle report import tested end-to-end.
- Excel export tested from real imported data.
- No secrets or private student data committed to GitHub.

## Current truth

```text
Supabase source prepared: yes
Supabase SQL executed: no
Edge Functions deployed: no
Real Moodle LTI launch verified: no
Production-ready: no
```
