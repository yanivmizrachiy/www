# Supabase role and boundary handoff — 2026-05-08

## Purpose

This document clarifies what Supabase is and is not in the Moodle Teacher Hub project, so future work does not confuse Supabase with Render or Moodle.

## Correct project

Supabase project ref:

```text
ncoqanascubqkxfvucfz
```

Supabase URL:

```text
https://ncoqanascubqkxfvucfz.supabase.co
```

This project was identified as related to Moodle Teacher Hub. Do not confuse it with an unrelated calendar project.

## Current active runtime path

Supabase is not the active launch/runtime path.

The active path is:

```text
Moodle -> Render -> Node/React app
```

Current Render runtime:

```text
https://www-tijc.onrender.com
```

## What Supabase is for

Supabase remains relevant as a future or supporting backend/database layer for real Moodle data, such as:

- Teacher sessions.
- LTI launch attempts.
- Moodle site records.
- Imported students.
- Imported grades.
- Imported logs.
- Daily activity summaries.
- Import batches.
- Reports.
- Future persistence and RPC workflows.

Supabase does not replace Moodle. Moodle remains the source of launch context and learning-space data.

## What was checked

Existing public tables were observed/reported:

```text
launch_attempts
moodle_sites
teacher_sessions
```

RLS was reported as enabled for these tables.

A Supabase Function/Gateway health endpoint was checked in earlier work, but this is not enough to make it the active LTI route.

## Why Supabase Gateway is not active

A previous attempt to use Supabase Gateway as a launch path resulted in:

```text
MISSING_OAUTH_SIGNATURE
```

Meaning: the Moodle launch reached the path, but the OAuth signature was not available to the Node server in a way that could be verified.

Current decision:

```text
Do not use Supabase Gateway as the active LTI launch route.
```

The active route remains:

```text
Moodle -> Render -> /api/lti/launch or /api/lti13/* -> React app
```

## What is not completed in Supabase

Not yet completed or verified:

- Full schema for students, grades, activities, imports, logs, daily summaries and reports.
- Saving real students.
- Saving real grades.
- Saving real logs.
- Saving daily practice-time summaries.
- End-to-end persistence after import or NRPS fetch.
- Multi-teacher isolation.
- Course/context isolation.
- Verified reload after save.

## Data and privacy boundary

Do not commit Supabase secrets to GitHub.
Do not put service-role keys in frontend code.
Do not store private Moodle reports or real student data in GitHub.
If real student data is stored, it must be in a secured database layer with teacher/course isolation.

## Service responsibility summary

Render:
Runs the public Moodle Teacher Hub app and API endpoints.

GitHub:
Stores code, documentation, STATE and evidence.

Moodle:
Launches the tool and provides teacher/course/data context.

Supabase:
Potential database/persistence backend, not the active launch route.

## Status

Documentation-only boundary note. No runtime code changed. No Supabase schema changed. No secrets added. No new capability is proven by this document.
