# Moodle Teacher Hub — PGRST205 Import Batches Root Cause

## Current failure

Real Participants import reaches the server, then fails:

IMPORT_BATCH_INSERT_FAILED  
PGRST205  
Could not find the table public.import_batches in the schema cache.

## Meaning

This is not a React problem and not a file-preview problem.

The server tries to persist the import to Supabase, but Supabase/PostgREST cannot see public.import_batches during the write.

## Correct next fix

Run the non-destructive SQL file:

supabase/manual_sql/20260514_fix_pgrst205_import_batches_students.sql

in Supabase SQL Editor.

It does not insert student rows and does not delete anything.

Teacher Release remains false.
