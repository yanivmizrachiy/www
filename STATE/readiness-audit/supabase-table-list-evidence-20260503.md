# Supabase Table List Evidence — 2026-05-03

Repository: `yanivmizrachiy/www`
Active branch: `gemini/ai-studio-sync-20260428-193953`
Supabase project: `moodle-teacher-hub`
Project URL: `https://ncoqanascubqkxxfvucfz.supabase.co`

## Evidence source

User screenshot from Supabase SQL Editor after running a safe table-list query:

```sql
select
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
order by tablename;
```

## Verified result from screenshot

The screenshot shows exactly 3 public tables:

| schemaname | tablename | rls_enabled |
|---|---|---|
| public | launch_attempts | true |
| public | moodle_sites | true |
| public | teacher_sessions | true |

## Current truth

```text
Supabase project identified: yes
Public tables verified: yes
Current public table count: 3
RLS enabled on all visible tables: yes
Tables verified: launch_attempts, moodle_sites, teacher_sessions
import_batches table: not visible / not created yet
imported_students table: not visible / not created yet
imported_grade_items table: not visible / not created yet
imported_grades table: not visible / not created yet
imported_chapters table: not visible / not created yet
imported_tasks table: not visible / not created yet
imported_task_completion table: not visible / not created yet
imported_log_events table: not visible / not created yet
```

## Interpretation

The existing Supabase database currently appears to support the beginning of LTI/session tracking, but it does not yet appear to contain the tables required for full Manual Real Data Import of students, grades, tasks, chapters, completion, or logs.

This means:

- LTI/session work can continue against existing tables if columns match the runtime code.
- Full import/reporting work cannot be truthfully marked complete yet.
- The next audit step must verify the columns of the 3 existing tables before writing runtime code against them.
- Do not run migrations blindly. First compare existing columns with the repository schema.

## Next safe step

Run a column audit query only for the existing verified tables:

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
  and table_name in ('launch_attempts', 'moodle_sites', 'teacher_sessions')
order by table_name, ordinal_position;
```

The result is safe to screenshot because it contains schema only, no secrets and no student records.
