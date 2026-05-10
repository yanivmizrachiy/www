# Supabase Schema Only — Moodle Teacher Hub

## Purpose

This PR adds a schema-only Supabase migration for durable Moodle Teacher Hub persistence.

## What it adds

- `mth_teachers`
- `mth_courses`
- `mth_import_batches`
- `mth_students`
- `mth_nrps_members`
- `mth_student_matches`

## What it does not do

- Does not execute SQL.
- Does not deploy Supabase.
- Does not add secrets.
- Does not add real student data.
- Does not change application source code.
- Does not change Render runtime.

## Why this is next

The project already has a verified local/private Participants backup and a merged governance stack. Durable persistence is required before Gradebook, Logs, daily practice time, reports, and export become production features.

## Review rules before execution

Before running this migration anywhere:

- verify the target Supabase project,
- verify RLS strategy,
- verify service-role usage stays server-side only,
- verify no real data is embedded in migration files,
- verify separation by issuer/clientId/deploymentId/course/teacher/importBatch/sourceType.
