# Persistence V1 Foundation — Moodle Teacher Hub

## Purpose

This PR adds the first real persistence foundation for Moodle Teacher Hub.

## Added

- Supabase schema file for reviewed manual application.
- `GET /api/persistence/v1/status`.
- `POST /api/persistence/snapshot`.
- Aggregate-only persistence status.
- Safe snapshot function that writes runtime students to Supabase only if server-side Supabase env exists.

## Important

This PR does not execute SQL.
This PR does not add secrets.
This PR does not commit student data.
This PR does not deploy.

## Next

After review, configure Supabase environment outside GitHub, apply the migration manually/reviewed, then run `/api/persistence/snapshot` from the server.
