# Work Order: Activity Completion / Course Structure Manual Smart Import V1

Teacher Release: **NO**

## Why this is now the correct next step

Live Moodle-launched `GET /api/automation/lti-capability-probes` returned:

- `connected=true`
- `ltiSessionAvailable=true`
- `hasContext=true`
- course id detected: `259`
- normalized platform/deployment/context/resource/user keys present
- `services.nrps.status=missing`
- `services.ags.status=missing`
- `services.moodleWebServices.status=missing`
- `nextBestAction=use_manual_exports_or_request_admin_enablement`

Therefore, do not build NRPS/AGS safe probes yet. They are not eligible because the live launch did not expose NRPS/AGS claims.

The next engineering path is Activity Completion / Course Structure via Manual Smart Import for the current resolved LTI context.

## Mission

Build the smallest safe implementation that moves `courseStructure=false` toward `true` using a real Moodle Activity Completion / Progress report or Course Structure report supplied by the teacher, bound to the current LTI context.

## Read first

- `PROJECT_RULES.md`
- `STATE/project-status.md`
- `STATE/live-validation/2026-05-20-lti-capability-probes-moodle-launched.json`
- `STATE/progress/2026-05-20-moodle-launched-lti-probes-result.md`
- `docs/architecture/DYNAMIC_LTI_CAPABILITY_PROBES_RUNTIME_V1.md`
- `WORK_ORDERS/CLAUDE_SAFE_NRPS_AGS_READ_ONLY_PROBE_V1.md` only to understand why it is deferred.

## Protected pipelines

Do not modify unless a verified bug requires it:

- Participants import
- Gradebook import
- Logs import
- Supabase migrations
- LTI launch verification logic
- Practice time truth gate
- Teacher Release gate

## Hard prohibitions

- No demo data
- No fake sections
- No fake tasks
- No fake completion rows
- No hardcoded course id `259` in production behavior
- No raw student rows in public diagnostics
- No secrets/tokens in repo
- No Teacher Release YES
- No broad refactor
- No scraping credentials/cookies/sessions

## Build target

Add or complete a safe Activity Completion / Course Structure manual import path that:

1. Requires current resolved LTI context before saving parsed data.
2. Accepts real teacher-provided Moodle report data only.
3. Detects Activity Completion / Progress-style report columns.
4. Creates/imports course sections/modules/tasks only from real report content.
5. Stores import provenance and import batch metadata.
6. Keeps diagnostics aggregate-only.
7. Updates automation status so `courseStructure` becomes available only after verified real import evidence exists for the current context.

## Minimum acceptable scope

If full persistence is already partially implemented, do not rewrite it. Complete the missing route/endpoint/audit connection.

The existing audit says:

- route `/course-structure-import`: true
- endpoint `/api/import/course-structure`: false
- page exists: true
- tasks structure markers: true

Prefer fixing the missing endpoint/connection rather than creating a parallel system.

## Required tests/checks

Run:

```bash
npm run audit:moodle-automation
npm run audit:multi-teacher-safety
npm run audit:deep-launch-context
npm run audit:lti-probes
npm run check
npm run build
npm run doctor
```

Add a specific safety check if useful, for example:

```bash
npm run audit:course-structure-import
```

## Acceptance criteria

- No protected pipeline changes.
- No Teacher Release change.
- No fake data.
- Course Structure import path is context-bound.
- Missing endpoint/audit gap is resolved or documented truthfully.
- Diagnostics stay aggregate-only.
- All checks pass.

## Stop rule

Open exactly one PR and stop. Do not merge.

## Final report

Return:

1. PR link
2. branch name
3. files changed
4. checks passed
5. what now works
6. what remains blocked
7. confirmation NRPS/AGS are deferred because claims are missing
8. confirmation Teacher Release remains NO
