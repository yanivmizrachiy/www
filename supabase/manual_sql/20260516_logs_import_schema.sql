-- Moodle Teacher Hub — Logs import schema support
-- Non-destructive.
-- No DROP.
-- No DELETE.
-- No TRUNCATE.
-- No fake logs.
-- No Teacher Release change.

create extension if not exists pgcrypto;

create table if not exists public.log_events (
  id uuid primary key,
  course_id text,
  import_batch_id uuid,
  event_time timestamptz,
  raw_time text,
  actor_full_name text,
  affected_user text,
  context text,
  component text,
  event_name text,
  description text,
  origin text,
  ip_address text,
  moodle_user_id text,
  source text not null default 'moodle-logs-import',
  created_at timestamptz not null default now()
);

alter table public.log_events add column if not exists course_id text;
alter table public.log_events add column if not exists import_batch_id uuid;
alter table public.log_events add column if not exists event_time timestamptz;
alter table public.log_events add column if not exists raw_time text;
alter table public.log_events add column if not exists actor_full_name text;
alter table public.log_events add column if not exists affected_user text;
alter table public.log_events add column if not exists context text;
alter table public.log_events add column if not exists component text;
alter table public.log_events add column if not exists event_name text;
alter table public.log_events add column if not exists description text;
alter table public.log_events add column if not exists origin text;
alter table public.log_events add column if not exists ip_address text;
alter table public.log_events add column if not exists moodle_user_id text;
alter table public.log_events add column if not exists source text not null default 'moodle-logs-import';
alter table public.log_events add column if not exists created_at timestamptz not null default now();

create index if not exists idx_log_events_course_id on public.log_events(course_id);
create index if not exists idx_log_events_import_batch_id on public.log_events(import_batch_id);
create index if not exists idx_log_events_event_time on public.log_events(event_time);
create index if not exists idx_log_events_actor_full_name on public.log_events(actor_full_name);

alter table public.log_events enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.log_events to service_role;

notify pgrst, 'reload schema';

select 'log_events' as table_name, count(*) as rows from public.log_events;
