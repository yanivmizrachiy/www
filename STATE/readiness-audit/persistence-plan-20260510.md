# Persistence Plan — 2026-05-10

Mode: planning only.

## What this PR does

- Adds durable persistence planning.
- Defines required separation keys.
- Defines minimum future tables.
- Documents privacy boundaries.
- Defines implementation phases before Gradebook/Logs.

## What this PR does not do

- No source code changes.
- No database deployment.
- No migrations executed.
- No Supabase secret added.
- No student data added.
- No Render deploy.

## Next

After review:

1. Confirm local browser backup summary.
2. Review existing Supabase files.
3. Decide whether to use Supabase.
4. Create schema PR only.
5. Then implement persistence writes.
