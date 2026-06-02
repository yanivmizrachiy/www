# 2026-06-01 - NRPS Role Classification V1

**Branch:** fix/nrps-role-classification-v1
**Teacher Release:** NO (unchanged)
**Scope:** build a robust, reusable NRPS role classifier and wire it into the
existing preview / breakdown / learner-sync paths so ambiguous roles are never
silently saved as students. Small, focused PR.

## What changed

### src/server.js
- Added `MTH_NRPS_ROLE_CLASSIFICATION_V1` block with reusable functions, placed
  next to the existing NRPS preview logic:
  - `nrpsShortRole(role)` — normalizes a role URN/URL to its trailing short name
    (after the last `#` or `/`).
  - `isManagerRole(role)` — Manager / Administrator / CourseCreator etc.
  - `isInstructorRole(role)` — teacher/team/staff signal. Includes Instructor,
    Teacher, EditingTeacher, NonEditingTeacher, Faculty, Staff, Mentor,
    TeachingAssistant (TA), Tutor, ContentDeveloper, plus all manager roles.
  - `isLearnerRole(role)` — Learner / Student / Guest.
  - `isUnknownRole(role)` — neither instructor nor learner.
  - `classifyNrpsMember(member)` — classifies a whole member over its FULL role
    set. Precedence: any team/staff/manager signal => `instructor`; else an
    explicit Learner/Student (or a bare context `Member` with no team signal) =>
    `learner`; otherwise `unknown`.
- Removed the previous basic `classifyNrpsRole(roles)` helper; the
  participants-breakdown endpoint now uses `classifyNrpsMember(member)`.
- `/api/lti13/nrps-preview` `members_named` now carries `role_kind`
  (`"learner" | "instructor" | "unknown"`). `is_instructor` is preserved for
  backwards compatibility (`role_kind === "instructor"`).
- `/api/imports/nrps-sync` now saves a member ONLY when `role_kind === "learner"`.
  Instructors and unknown/ambiguous roles are skipped (counted as
  `skipped_instructor` / `skipped_unknown` in the response). Older clients that
  do not send `role_kind` fall back to the prior "skip instructors" behavior, so
  nothing regresses. This is the specific unsafe behavior that was stopped: an
  unclassified participant is no longer stored as a student.

### src/pages/Students.tsx
- Consumes `role_kind` via small `isTeacherMember` / `isLearnerMember` helpers.
  Students list now shows only `role_kind === "learner"` members; unknown roles
  are excluded (previously `!is_instructor` included unknowns). Falls back to the
  old behavior when `role_kind` is absent.

### src/pages/Dashboard.tsx
- Teacher-name filter prefers `role_kind === "instructor"`, falling back to
  `is_instructor` for older payloads. No other dashboard logic changed.

## Classification behavior (summary)

Team / teacher (NOT saved as student): Instructor, Teacher, EditingTeacher,
NonEditingTeacher, Faculty, Staff, Mentor, Manager, CourseCreator,
Administrator/Admin, TeachingAssistant/TA, Tutor, ContentDeveloper.

Learner (eligible to save as student): Learner, Student, Guest, and a bare
context `Member` only when the member has no team/staff signal.

Unknown (NOT saved, counted only): anything else, or a member with no
recognizable role.

A member carrying both a team role and a Learner role classifies as
`instructor` and is never saved as a student.

## Privacy / truth / safety rules honored

- No names, emails, raw user IDs, `lis_*` source IDs, national IDs, access
  tokens, client assertions, private keys, or secrets are exposed. `role_kind`
  is a non-sensitive classification label; sync skip counts are aggregate only.
- No fake/demo data; no hard-coded 216/222/6. All counts still come from the
  live NRPS response.
- Did NOT change: LTI launch flow, Supabase migrations/schema/RLS, env/secrets,
  Render settings, production SQL, Teacher Release gate, PR #127, manual import
  fallback, evidence logs, the participants/gradebook/logs import pipelines, or
  the broad server-owned sync payload shape (PR 5 owns deeper sync changes). No
  files deleted.
- Teacher Release stays **NO**.

## Checks run

- `node --check src/server.js` — PASS
- `npm run check` — (see PR/commit run)
- `npm run build` — (see PR/commit run)
- `npm run doctor` — (see PR/commit run)
- `npm run typecheck` — pre-existing errors only; server.js is plain JS (not in
  tsc scope); Students.tsx / Dashboard.tsx changes introduce no new errors
- `npm run audit:moodle-automation` — (see PR/commit run)
- `npm run audit:automation-capabilities` — (see PR/commit run)
- `npm run audit:automation-capability-contract` — (see PR/commit run)
- `npm run audit:automation-evidence-log` — (see PR/commit run)
- `npm run audit:auto-extraction-source-router` — (see PR/commit run)
- `npm run audit:multi-teacher-isolation-evidence` — (see PR/commit run)
- `npm run audit:supabase-rls-isolation-readiness` — (see PR/commit run)

## What must be checked live in Moodle (לא אומת)

- The exact set of role short-names this Moodle returns for the pilot course, and
  that they all map to the intended learner/instructor/unknown buckets. `לא אומת`
- That no real learner is misclassified as `unknown` (would reduce the saved
  count) and no instructor as `learner`. `לא אומת`
- Real total/learner/instructor/unknown counts via a live launch. `לא אומת`

## How this avoids breaking the 216 synced learners

- The classifier only ADDS precision to who is treated as a learner. Standard
  `Learner` / `Student` members (the 216) still classify as `learner` exactly as
  before, so they continue to sync.
- `nrps-sync` previously skipped only instructors; it now additionally skips
  `unknown`. Members already saved as the 216 learners carry standard learner
  roles and are unaffected. Older clients without `role_kind` keep the prior
  behavior, so a stale frontend cannot drop existing learners.
- This PR does not delete or rewrite any stored students.

## Progress estimate

NRPS role classification robustness: ~90%. Remaining: live Moodle verification of
the real role short-names and counts (`לא אומת`), and deeper sync payload work in
PR 5.
