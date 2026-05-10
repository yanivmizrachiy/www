-- Moodle Teacher Hub durable persistence schema
-- Created: 2026-05-10
--
-- SCHEMA ONLY.
-- DO NOT execute automatically.
-- DO NOT add real student data to this file.
-- DO NOT add secrets, tokens, private keys, or service-role keys.
--
-- Purpose:
-- Durable storage for real Moodle Teacher Hub data after verified LTI 1.3,
-- NRPS, and Participants import milestones.
--
-- Required separation:
-- issuer, client_id, deployment_id, course/context, teacher/user, import_batch, source_type.

create extension if not exists pgcrypto;

create table if not exists public.mth_teachers (
  id uuid primary key default gen_random_uuid(),
  issuer text not null,
  client_id text not null,
  deployment_id text not null,
  lti_user_id text not null,
  display_name text,
  email text,
  email_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (issuer, client_id, deployment_id, lti_user_id)
);

create table if not exists public.mth_courses (
  id uuid primary key default gen_random_uuid(),
  issuer text not null,
  client_id text not null,
  deployment_id text not null,
  context_id text not null,
  course_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (issuer, client_id, deployment_id, context_id)
);

create table if not exists public.mth_import_batches (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.mth_teachers(id) on delete restrict,
  course_id uuid not null references public.mth_courses(id) on delete cascade,
  source_type text not null check (source_type in ('participants', 'nrps', 'gradebook', 'logs', 'completion', 'unknown')),
  original_filename_hash text,
  row_count integer not null default 0 check (row_count >= 0),
  accepted_count integer not null default 0 check (accepted_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  status text not null default 'completed' check (status in ('completed', 'partial', 'failed')),
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.mth_students (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.mth_courses(id) on delete cascade,
  import_batch_id uuid references public.mth_import_batches(id) on delete set null,
  full_name text not null,
  email text,
  email_hash text,
  external_username text,
  external_id text,
  moodle_user_id text,
  lis_person_sourcedid text,
  nrps_user_id text,
  source_type text not null default 'participants',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mth_students_identity_present check (
    coalesce(email, external_username, external_id, moodle_user_id, lis_person_sourcedid, nrps_user_id, full_name) is not null
  )
);

create index if not exists mth_students_course_id_idx
  on public.mth_students(course_id);

create index if not exists mth_students_course_email_hash_idx
  on public.mth_students(course_id, email_hash)
  where email_hash is not null;

create index if not exists mth_students_course_external_id_idx
  on public.mth_students(course_id, external_id)
  where external_id is not null;

create index if not exists mth_students_course_moodle_user_id_idx
  on public.mth_students(course_id, moodle_user_id)
  where moodle_user_id is not null;

create index if not exists mth_students_course_lis_sourcedid_idx
  on public.mth_students(course_id, lis_person_sourcedid)
  where lis_person_sourcedid is not null;

create table if not exists public.mth_nrps_members (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.mth_courses(id) on delete cascade,
  import_batch_id uuid references public.mth_import_batches(id) on delete set null,
  user_id text not null,
  lis_person_sourcedid text,
  role text not null,
  status text,
  created_at timestamptz not null default now(),
  unique (course_id, user_id, role)
);

create index if not exists mth_nrps_members_course_id_idx
  on public.mth_nrps_members(course_id);

create index if not exists mth_nrps_members_course_lis_sourcedid_idx
  on public.mth_nrps_members(course_id, lis_person_sourcedid)
  where lis_person_sourcedid is not null;

create table if not exists public.mth_student_matches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.mth_courses(id) on delete cascade,
  student_id uuid not null references public.mth_students(id) on delete cascade,
  nrps_member_id uuid not null references public.mth_nrps_members(id) on delete cascade,
  match_level text not null check (match_level in ('exact', 'strong', 'manual', 'unmatched')),
  match_reason text not null,
  confidence numeric(5,4) not null default 0 check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now(),
  unique (course_id, student_id, nrps_member_id)
);

create index if not exists mth_student_matches_course_id_idx
  on public.mth_student_matches(course_id);

create index if not exists mth_student_matches_student_id_idx
  on public.mth_student_matches(student_id);

create index if not exists mth_student_matches_nrps_member_id_idx
  on public.mth_student_matches(nrps_member_id);

-- RLS is intentionally enabled now, but policies must be reviewed before production use.
alter table public.mth_teachers enable row level security;
alter table public.mth_courses enable row level security;
alter table public.mth_import_batches enable row level security;
alter table public.mth_students enable row level security;
alter table public.mth_nrps_members enable row level security;
alter table public.mth_student_matches enable row level security;

-- No permissive policies are created in this schema-only PR.
-- Application writes must use a reviewed server-side/service-role path only.
