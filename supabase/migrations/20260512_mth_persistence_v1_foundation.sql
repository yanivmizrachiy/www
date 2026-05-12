-- Moodle Teacher Hub — Persistence V1 Foundation
-- Safe schema file only. Do not execute automatically from GitHub.
-- Apply manually/reviewed in Supabase when ready.
-- No student data is stored in this file.

create table if not exists public.mth_import_batches (
  id text primary key,
  course_context_key text not null,
  source_type text not null,
  row_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.mth_students (
  id text primary key,
  course_context_key text not null,
  import_batch_id text references public.mth_import_batches(id) on delete set null,
  full_name text,
  email text,
  external_id text,
  moodle_user_id text,
  lis_person_sourcedid text,
  id_number text,
  source text not null default 'moodle-participants-import',
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.mth_nrps_members (
  id text primary key,
  course_context_key text not null,
  user_hash text not null,
  role_names text[] not null default '{}',
  status text,
  has_name boolean not null default false,
  has_email boolean not null default false,
  has_user_id boolean not null default false,
  has_lis_person_sourcedid boolean not null default false,
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.mth_student_matches (
  id text primary key,
  course_context_key text not null,
  student_id text references public.mth_students(id) on delete cascade,
  nrps_member_id text references public.mth_nrps_members(id) on delete cascade,
  match_method text not null,
  confidence integer not null default 0,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_mth_import_batches_context on public.mth_import_batches(course_context_key);
create index if not exists idx_mth_students_context on public.mth_students(course_context_key);
create index if not exists idx_mth_students_batch on public.mth_students(import_batch_id);
create index if not exists idx_mth_nrps_members_context on public.mth_nrps_members(course_context_key);
create index if not exists idx_mth_student_matches_context on public.mth_student_matches(course_context_key);

alter table public.mth_import_batches enable row level security;
alter table public.mth_students enable row level security;
alter table public.mth_nrps_members enable row level security;
alter table public.mth_student_matches enable row level security;

-- No public RLS policies are created here.
-- Backend service-role access only, after environment secrets are configured outside GitHub.
