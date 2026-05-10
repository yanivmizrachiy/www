# Supabase Existing Files Review — 2026-05-10

Mode: review/planning only.

## What this PR does

- Lists existing Supabase-related files.
- Marks Supabase migrations/functions as review-required before use.
- Confirms that no SQL/function deployment is performed.
- Prepares the next step toward durable persistence.

## What this PR does not do

- No source code changes.
- No SQL executed.
- No Supabase Function deployed.
- No secret added.
- No student data added.
- No Render deploy.

## Next

After review:

1. Confirm local browser backup summary.
2. Review each migration/function.
3. Create schema-only PR if Supabase remains the selected persistence target.
4. Only then implement persistence writes.
