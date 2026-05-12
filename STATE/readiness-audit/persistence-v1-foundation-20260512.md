# Persistence V1 Foundation — 2026-05-12

Mode: real code + schema foundation.

## What changed

- Added safe Supabase schema file.
- Added persistence V1 status endpoint.
- Added persistence snapshot endpoint.
- Kept responses aggregate-only.

## Safety

- No deploy.
- No secrets.
- No student data committed.
- No SQL executed automatically.

## Current blocker

Persistence will not be complete until Supabase env is configured and the migration is applied/reviewed.
