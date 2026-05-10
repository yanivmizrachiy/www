# Schema Only Persistence PR — 2026-05-10

Mode: schema-only.

## What this branch does

- Adds a reviewed migration candidate for durable persistence.
- Adds documentation for schema review.

## What this branch does not do

- No SQL executed.
- No database deployed.
- No Supabase Function deployed.
- No secret added.
- No student data added.
- No source code changed.
- No Render deploy.

## Next

After review:

1. Confirm Supabase project target.
2. Review RLS and server-side write path.
3. Execute migration manually only after approval.
4. Implement persistence writes.
5. Verify reload after restart/deploy.
