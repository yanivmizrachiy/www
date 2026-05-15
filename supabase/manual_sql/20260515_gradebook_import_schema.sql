-- Moodle Teacher Hub — Gradebook import schema support
-- Non-destructive.
-- No DROP.
-- No DELETE.
-- No TRUNCATE.
-- No fake grades.
-- No student/grade rows inserted.
-- Teacher Release remains false.

create extension if not exists pgcrypto;

create table if not exists public.grade_items (
  id uuid primary key,
  course_id text,
  import_batch_id uuid,
  name text not null,
  raw_header text,
  item_type text,
  position integer,
  max_grade numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.grade_results (
  id uuid primary key,
  grade_item_id uuid,
  import_batch_id uuid,
  course_id text,
  student_id uuid,
  student_full_name text,
  student_email text,
  student_identifier text,
  grade numeric,
  raw_value text,
  source text not null default 'moodle-gradebook-import',
  created_at timestamptz not null default now()
);

alter table public.grade_items add column if not exists course_id text;
alter table public.grade_items add column if not exists import_batch_id uuid;
alter table public.grade_items add column if not exists name text;
alter table public.grade_items add column if not exists raw_header text;
alter table public.grade_items add column if not exists item_type text;
alter table public.grade_items add column if not exists position integer;
alter table public.grade_items add column if not exists max_grade numeric;
alter table public.grade_items add column if not exists created_at timestamptz not null default now();

alter table public.grade_results add column if not exists grade_item_id uuid;
alter table public.grade_results add column if not exists import_batch_id uuid;
alter table public.grade_results add column if not exists course_id text;
alter table public.grade_results add column if not exists student_id uuid;
alter table public.grade_results add column if not exists student_full_name text;
alter table public.grade_results add column if not exists student_email text;
alter table public.grade_results add column if not exists student_identifier text;
alter table public.grade_results add column if not exists grade numeric;
alter table public.grade_results add column if not exists raw_value text;
alter table public.grade_results add column if not exists source text not null default 'moodle-gradebook-import';
alter table public.grade_results add column if not exists created_at timestamptz not null default now();

create index if not exists idx_grade_items_course_id on public.grade_items(course_id);
create index if not exists idx_grade_items_import_batch_id on public.grade_items(import_batch_id);
create index if not exists idx_grade_results_grade_item_id on public.grade_results(grade_item_id);
create index if not exists idx_grade_results_import_batch_id on public.grade_results(import_batch_id);
create index if not exists idx_grade_results_student_id on public.grade_results(student_id);
create index if not exists idx_grade_results_course_id on public.grade_results(course_id);

alter table public.grade_items enable row level security;
alter table public.grade_results enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.grade_items to service_role;
grant select, insert, update, delete on public.grade_results to service_role;

notify pgrst, 'reload schema';

select 'grade_items' as table_name, count(*) as rows from public.grade_items
union all
select 'grade_results', count(*) from public.grade_results;
