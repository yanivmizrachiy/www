# Supabase Existing State Audit — 2026-05-03

Repository: `yanivmizrachiy/www`
Active branch: `gemini/ai-studio-sync-20260428-193953`
Supabase project observed from screenshot: `moodle-teacher-hub`
Observed project URL: `https://ncoqanascubqkxxfvucfz.supabase.co`

## Purpose

Before any more feature work, verify exactly what already exists in Supabase. Do not recreate tables, do not run migrations blindly, do not deploy functions blindly, and do not assume Google AI Studio or any prior AI correctly described the database.

## Current evidence

From user screenshots:

- Supabase Dashboard URL appears to be `supabase.com/dashboard/project/ncoqanascubqkxxfvucfz`.
- Project name appears to be `moodle-teacher-hub`.
- Project status appears `Healthy`.
- Project organization appears `yanivmizrachiy's Org`.
- SQL Editor shows a query named like `Moodle LTI Sessions and Launch Attempts Schema`.
- SQL Editor result shows `Success. No rows returned`.
- Project overview shows `Last migration: No migrations`, so any SQL may have been run manually rather than via Supabase CLI migrations.

## Important truth rule

The screenshot suggests SQL was executed successfully, but it does not prove which tables, columns, RLS policies, functions, or rows exist now. The actual Supabase state must be verified using SQL/table screenshots or safe SQL results.

## Do not expose secrets

Never screenshot or paste:

- `SUPABASE_SERVICE_ROLE_KEY`
- LTI shared secret
- Moodle Web Services token
- `.env` file content
- student rows / private reports

Safe screenshots/outputs:

- Table names
- Column names/types
- RLS enabled flags
- Function names
- Row counts only
- Project URL
- Edge Function names/status only

## Safe SQL audit queries to run in Supabase SQL Editor

### 1. List existing public tables

```sql
select
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
order by tablename;
```

### 2. List columns for expected tables

```sql
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'moodle_sites',
    'teacher_sessions',
    'launch_attempts',
    'import_batches',
    'imported_students',
    'imported_grade_items',
    'imported_grades',
    'imported_chapters',
    'imported_tasks',
    'imported_task_completion',
    'imported_log_events'
  )
order by table_name, ordinal_position;
```

### 3. Confirm row counts only, no private row data

```sql
select 'moodle_sites' as table_name, count(*) as rows from public.moodle_sites
union all select 'teacher_sessions', count(*) from public.teacher_sessions
union all select 'launch_attempts', count(*) from public.launch_attempts
union all select 'import_batches', count(*) from public.import_batches;
```

If any table is missing, run only the table list query and do not force this count query.

### 4. List database functions/RPCs

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname like 'lti_%'
    or p.proname like '%moodle%'
    or p.proname like '%import%'
  )
order by p.proname;
```

### 5. List RLS policies on project tables

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### 6. Check required extensions safely

```sql
select extname, extversion
from pg_extension
where extname in ('pgcrypto', 'uuid-ossp')
order by extname;
```

## How to interpret the audit

### Minimum LTI session schema

At minimum, current LTI/launch testing needs:

- `moodle_sites`
- `teacher_sessions`
- `launch_attempts`
- `import_batches`

### Full Manual Real Data Import schema

For real teacher reports beyond metadata, later phases need:

- `imported_students`
- `imported_grade_items`
- `imported_grades`
- `imported_chapters`
- `imported_tasks`
- `imported_task_completion`
- `imported_log_events`

If these do not exist yet, the app can record import batches but cannot truthfully claim full student/grade/log import until schema and parser logic exist and are tested.

## Screenshot requests for the user

Please capture these from Supabase project `ncoqanascubqkxxfvucfz`:

1. Table Editor sidebar showing all public tables.
2. SQL result for query 1 — table names and RLS only.
3. SQL result for query 2 — columns only.
4. SQL result for query 3 — row counts only.
5. Database Functions page or SQL result for query 4.
6. Edge Functions page showing function names and deployment status, no secrets.

## Decision rules after audit

- If the expected tables already exist, do not recreate them; align code to them.
- If tables exist but columns differ from repo schema, update repo docs and code carefully.
- If only partial tables exist, continue from current schema instead of rerunning old AI SQL blindly.
- If no normalized import tables exist, mark manual import as partial until added and tested.
- If RLS is enabled without compatible policies, client-side RPC reads may fail even when tables exist.
- If only SQL Editor was used and no migration history exists, document the database as manually initialized and create a safe future migration plan later.

## Current status before user provides audit output

```text
Supabase project identified: yes, from screenshot
Supabase health: screenshot says Healthy
SQL ran: screenshot shows Success, exact schema unknown
Tables verified: not yet
Columns verified: not yet
RLS verified: not yet
RPCs verified: not yet
Edge Functions deployed: not yet verified
Runtime env connection from Termux: not yet configured; local /health showed supabaseConfigured=false
```
