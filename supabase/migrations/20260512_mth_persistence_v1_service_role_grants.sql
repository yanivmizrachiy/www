-- Moodle Teacher Hub — Persistence V1 service_role grants
-- Safe server-only grants.
-- Does NOT allow anon/public access.
-- Does NOT insert student data.

grant usage on schema public to service_role;

grant select, insert, update, delete
on table public.mth_import_batches
to service_role;

grant select, insert, update, delete
on table public.mth_students
to service_role;

grant select, insert, update, delete
on table public.mth_nrps_members
to service_role;

grant select, insert, update, delete
on table public.mth_student_matches
to service_role;
