-- Moodle Teacher Hub — Fix PGRST205 for Participants import
-- Purpose:
--   Fix PostgREST/Supabase error:
--   PGRST205: Could not find the table 'public.import_batches' in the schema cache
--
-- Safety:
--   Non-destructive.
--   CREATE TABLE IF NOT EXISTS only.
--   No DROP.
--   No DELETE.
--   No TRUNCATE.
--   No student rows inserted.
--   Teacher Release remains false.
--
-- After running this SQL, retry Participants import from Moodle.

create extension if not exists pgcrypto;

create table if not exists public.teachers (
  id uuid primary key,
  moodle_user_id text,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key,
  moodle_course_id text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_batches (
  id uuid primary key,
  course_id text not null default '0',
  teacher_id uuid null,
  report_type text not null default 'students',
  source_kind text not null default 'file',
  status text not null default 'completed',
  row_count integer not null default 0,
  file_name text,
  detection_confidence numeric,
  warnings jsonb not null default '[]'::jsonb,
  imported_by_username text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key,
  full_name text not null,
  email text,
  external_id text,
  external_username text,
  moodle_user_id text,
  lis_person_sourcedid text,
  id_number text,
  space_id text,
  source text not null default 'moodle-participants-import',
  import_batch_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'import_batches'
  ) then
    begin
      alter table public.students
      add constraint students_import_batch_id_fkey
      foreign key (import_batch_id)
      references public.import_batches(id)
      on delete set null;
    exception
      when duplicate_object then null;
      when others then null;
    end;
  end if;
end $$;

create index if not exists idx_students_import_batch_id on public.students(import_batch_id);
create index if not exists idx_students_email on public.students(email);
create index if not exists idx_import_batches_created_at on public.import_batches(created_at);
create index if not exists idx_import_batches_report_type on public.import_batches(report_type);

alter table public.teachers enable row level security;
alter table public.courses enable row level security;
alter table public.import_batches enable row level security;
alter table public.students enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.teachers to service_role;
grant select, insert, update, delete on public.courses to service_role;
grant select, insert, update, delete on public.import_batches to service_role;
grant select, insert, update, delete on public.students to service_role;

-- Refresh PostgREST/Supabase schema cache.
notify pgrst, 'reload schema';

-- Safe verification: table names/counts only, no student rows.
select 'teachers' as table_name, count(*) as rows from public.teachers
union all select 'courses', count(*) from public.courses
union all select 'import_batches', count(*) from public.import_batches
union all select 'students', count(*) from public.students;
