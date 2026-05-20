# Progress — Dynamic LTI Capability Probes Runtime V1

Date: 2026-05-20  
Teacher Release: NO

## What changed

Added a runtime endpoint for safe LTI capability classification:

`GET /api/automation/lti-capability-probes`

## Why

The project already proved live LTI context for one real course. The next major step is detecting whether each launch/context exposes NRPS, AGS, Moodle Web Services configuration, and manual import readiness without exposing private data.

## Protected

No changes to:

- Participants import
- Gradebook import
- Logs import
- Supabase migrations
- LTI launch verification logic
- Teacher Release gate

## Still blocked

- Course Structure / Activity Completion import.
- Moodle Web Services live API call.
- Auto Sync.
- Multi-teacher/course isolation.