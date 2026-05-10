# Durable Persistence Plan — Moodle Teacher Hub

## Purpose

Moodle Teacher Hub now needs durable persistence before expanding to Gradebook, Logs, daily practice time, reports, or export.

The current verified product milestone is:

- LTI 1.3 works from Moodle.
- NRPS works.
- NRPS returned 62 real members: 59 Learners and 3 Instructors.
- Participants import succeeded with 62 accepted rows.
- Students page displays imported real names/emails.

## Why persistence is required

Runtime memory and local `data/store.json` are not enough for production.

Durable persistence is required so that:

- imported students survive restart/deploy,
- each teacher sees only their own course data,
- imports are traceable by batch,
- NRPS and Participants can be matched reliably,
- Gradebook and Logs can be added safely later.

## Preferred target

Supabase is the preferred persistence target, because the repository already contains Supabase-related files and dependencies, but nothing should be deployed until reviewed.

## Required separation keys

Every persistent record must be separated by:

- issuer
- clientId
- deploymentId
- contextId / courseId
- teacherUserId
- importBatchId
- sourceType

## Minimum tables

### teachers

Stores verified teacher identity/context from LTI.

Fields:

- id
- issuer
- client_id
- deployment_id
- lti_user_id
- display_name
- email_hash or email when allowed
- created_at
- updated_at

### courses

Stores Moodle course/context.

Fields:

- id
- issuer
- client_id
- deployment_id
- context_id
- course_title
- created_at
- updated_at

### import_batches

Stores every real import.

Fields:

- id
- teacher_id
- course_id
- source_type
- original_filename_hash
- row_count
- accepted_count
- skipped_count
- created_at

### students

Stores student identities after Participants import and future matching.

Fields:

- id
- course_id
- import_batch_id
- full_name
- email
- email_hash
- external_username
- external_id
- moodle_user_id
- lis_person_sourcedid
- nrps_user_id
- source_type
- created_at
- updated_at

### nrps_members

Stores raw-safe NRPS membership identity fields without secrets.

Fields:

- id
- course_id
- user_id
- lis_person_sourcedid
- role
- status
- created_at

### student_matches

Stores NRPS ↔ Participants matching results.

Fields:

- id
- course_id
- student_id
- nrps_member_id
- match_level
- match_reason
- confidence
- created_at

## Privacy boundaries

Do not store secrets in the database.

Do not commit database exports to GitHub.

Evidence files may contain only aggregate counts and status.

Real student data must not appear in:

- GitHub commits
- PR bodies
- logs pasted to chat
- STATE evidence files
- README / PROJECT_RULES examples

## Implementation phases

### Phase 1 — schema only

Create reviewed migrations only after approval.

No production deployment.

### Phase 2 — write imported Participants to persistence

After successful Participants import, persist:

- students
- import_batches
- course/teacher context

### Phase 3 — reload verification

Prove that after reload/restart:

- students still appear,
- import batch still appears,
- counts match the imported data.

### Phase 4 — NRPS matching

Match 59 NRPS learners to 62 Participants rows.

### Phase 5 — Gradebook

Import or sync Gradebook only after matching exists.

### Phase 6 — Logs and time

Import logs and calculate activity/time only when source data exists.

## Done criteria

Persistence is Done only when:

- data survives restart/deploy,
- data is separated by teacher/course/context,
- no secrets are stored,
- no private exports are committed,
- a real imported student list reloads successfully,
- evidence is recorded with aggregate counts only.
