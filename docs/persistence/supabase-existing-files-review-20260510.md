# Supabase Existing Files Review — Moodle Teacher Hub

Updated: 2026-05-10T08:43:00Z

Mode: review/planning only.

No SQL was executed.
No Supabase Function was deployed.
No secret was added.
No student data was added.
No source application code was changed.

## Why this review exists

Persistence is the next required architecture step after LTI 1.3, NRPS, and Participants import succeeded.

Before creating or running any database schema, existing Supabase files must be reviewed.

## Existing Supabase paths

- `supabase/functions/import-moodle-report/index.ts`
- `supabase/functions/lti-launch/index.ts`
- `supabase/migrations/20240428_initial_reconstruction_DRAFT_DO_NOT_RUN.sql`
- `supabase/migrations/20260501_initial_schema.sql`

## Package dependency evidence

21:    "@supabase/supabase-js": "^2.104.1",

## Review classification

### Migrations

- REVIEW_REQUIRED: `supabase/migrations/20240428_initial_reconstruction_DRAFT_DO_NOT_RUN.sql`
- REVIEW_REQUIRED: `supabase/migrations/20260501_initial_schema.sql`

### Functions

- REVIEW_REQUIRED: `supabase/functions/import-moodle-report/index.ts`
- REVIEW_REQUIRED: `supabase/functions/lti-launch/index.ts`

## Required review before use

Before using Supabase for production persistence, check:

- schema does not contain demo-only assumptions,
- migrations are idempotent or safely ordered,
- no real student data is embedded,
- no service role key is committed,
- RLS policy is planned before real use,
- separation keys exist: issuer, clientId, deploymentId, course/context, teacher/user, importBatch, sourceType,
- reload after restart/deploy can be verified,
- evidence stays aggregate-only.

## Recommended next PR

Create a schema-only PR after review.

The schema PR must not deploy anything automatically and must not include secrets or real data.
