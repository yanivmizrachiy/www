# Supabase Mobile Navigation Evidence — 2026-05-03

Repository: `yanivmizrachiy/www`
Active branch: `gemini/ai-studio-sync-20260428-193953`

## Purpose

Record the user-provided mobile screenshots from Supabase so future AI work does not confuse the active Moodle Teacher Hub backend with other Supabase projects.

## Evidence from screenshots

### Screenshot 1 — Supabase project list

The Supabase mobile browser showed two projects under the user's organization:

- `calendar-app` — appears paused.
- `moodleteacher-hub` / `moodle-teacher-hub` — active target project for this Moodle Teacher Hub work.

Important correction:

- The user accidentally opened `calendar-app` once. That project is paused and is not the current Moodle Teacher Hub backend.
- Do not use or restore `calendar-app` for this project.

### Screenshot 2 — Wrong project opened

The screenshot showed:

- Project: `calendar-app`.
- Status: project paused.
- Message: project inaccessible while paused.

Decision:

- Treat this as a wrong-navigation screenshot only.
- Do not click restore or download backups for `calendar-app` as part of Moodle Teacher Hub.

### Screenshot 3 — Correct project opened

The next screenshot showed the correct Supabase project overview:

- Project name visible: `moodle-teacher-hub`.
- Project URL visible: `https://ncoqanascubqkxxfvucfz.supabase.co`.
- Status visible: `Healthy`.
- Last migration visible: `No migrations`.
- Last backup visible: `No backups`.
- Recent branch visible: `No branches`.
- Primary Database card visible lower on the page.

## Current truth

```text
Correct Supabase project: moodle-teacher-hub
Correct Supabase project id: ncoqanascubqkxxfvucfz
Correct project URL: https://ncoqanascubqkxxfvucfz.supabase.co
Wrong/irrelevant project: calendar-app
Supabase status from screenshot: Healthy
Migration history from screenshot: No migrations
Backup history from screenshot: No backups
Database existence: Primary Database visible, table/schema details still need verification
```

## What this proves

- The active Supabase backend candidate for Moodle Teacher Hub exists.
- It is healthy from Supabase's project overview.
- The project id to use in documentation and environment configuration is `ncoqanascubqkxxfvucfz` unless later evidence proves otherwise.

## What this does not yet prove

- It does not prove which public tables exist.
- It does not prove which columns exist.
- It does not prove RLS/policies are correct.
- It does not prove RPC functions exist.
- It does not prove Edge Functions are deployed.
- It does not prove the local Node runtime is connected to this Supabase project.
- It does not prove LTI launch writes sessions into Supabase.

## Next screenshot needed

From the correct project `moodle-teacher-hub`, open Table Editor and capture the sidebar/list of public tables only. Do not capture API keys, service role key, secrets, environment variables, or private student data.
