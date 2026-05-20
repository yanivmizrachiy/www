# Moodle Teacher Hub — Multi-Teacher Maximum Automation Spec

Date: 2026-05-20  
Status: architecture spec  
Teacher Release: **NO**

## Goal

Moodle Teacher Hub must become a dynamic automation product for every teacher and every Moodle course/context.

Course `259` is only a live validation course. It must never become a hardcoded dependency.

The product must work from any valid Moodle launch by resolving the current platform, deployment, context, course, user, roles, and available services.

## Core architecture rule

The system is launch-driven and context-first.

Never key production behavior by course title, teacher display name, or a previous course.

Use stable dynamic keys derived from the live launch/context.

## Required logical keys

| Key | Purpose |
|---|---|
| `platform_key` | Identifies the Moodle platform/deployment boundary. |
| `deployment_key` | Identifies the external tool deployment. |
| `context_key` | Identifies the current course/context. |
| `resource_link_key` | Identifies the tool placement. |
| `user_key` | Identifies the launched user without relying on display name. |
| `import_batch_id` | Required for every import or sync attempt. |
| `source_provenance` | Source type: launch, roster service, grade service, web service, CSV, XLSX, HTML, paste. |

## Mandatory isolation rules

- No data query without resolved platform/context.
- No import save without an import batch and source provenance.
- No global fallback to last course.
- No student-level rows in public diagnostics.
- No hardcoded course `259` except in tests/docs as pilot evidence.
- No Teacher Release YES until multi-teacher and multi-course isolation pass.

## Automation ladder

| Layer | Meaning | Status rule |
|---|---|---|
| LTI launch | Identify current user/course/context dynamically | AUTO only when a live launch exists |
| NRPS | Roster/participants from current context | AUTO only if claim and live call are verified |
| AGS | Line items/results/scores when available | AUTO/SEMI_AUTO depending verified coverage |
| Moodle Web Services | Broader course contents/completion/grades/logs | BLOCKED until safe environment credential and live read-only probe are verified |
| Manual Smart Import | Teacher uploads/exports Moodle reports | SEMI_AUTO with context binding |
| Activity Completion | Completion/progress per activity | BLOCKED until API/report import is verified |
| Teacher Release | Release for many teachers/courses | BLOCKED until all gates pass |

## Data model implications

Course-bound tables should include:

- `platform_key`
- `context_key`
- `import_batch_id`
- `source_provenance`
- `observed_at`
- row fingerprint where useful

Important logical tables:

- launches/context snapshots
- course contexts
- memberships/participants
- import batches
- course sections/modules/tasks
- activity completion snapshots
- grade items/results
- log events
- automation capability snapshots

## Required tests and gates

Add or strengthen tests for:

1. no production hardcode of course `259`.
2. no hardcoded teacher display name or local teacher id.
3. isolation by platform/context/course.
4. import rows require `import_batch_id` and `source_provenance`.
5. diagnostics return status/counts only.
6. NRPS/AGS claim parser handles present/missing claims.
7. service credential is never returned by endpoints.
8. Teacher Release remains NO until isolation passes.
9. course structure import works for any resolved context.
10. manual imports cannot save without current context binding.

## Current live evidence

A real Moodle launch for Course `259` returned:

- `connected=true`
- `ltiSessionAvailable=true`
- `courseId=259`
- course name detected
- participants available
- gradebook available
- logs available
- course structure missing
- Moodle Web Services missing
- auto sync missing
- Teacher Release false

This proves live LTI context detection works for one real course. It does not prove release readiness for all teachers.

## Next implementation priorities

1. Build or verify a Launch Context Registry based on dynamic launch identifiers.
2. Add safe capability probes for roster and grade services from live launch claims.
3. Add context isolation/provenance tests before release.
4. Import or parse Activity Completion / Progress for the current context.
5. Keep full automatic sync blocked until a safe deployment credential and a live read-only probe are verified.

## Non-negotiable principle

The target is maximum real automation for every teacher, but only verified automation may be shown as automatic.
