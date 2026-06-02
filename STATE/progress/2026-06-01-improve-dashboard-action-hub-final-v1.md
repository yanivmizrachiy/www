# 2026-06-01 - Improve Dashboard Action Hub (Final) V1

**Branch:** improve-dashboard-action-hub-final-v1
**Teacher Release:** NO (unchanged)
**Scope:** Dashboard UI/data wiring only — make the home action hub read its
participants / learners / teachers counts and space name from the authoritative,
privacy-stripped source, more reliably and with no invented data.

## Background

The dashboard already presented connection status, course name, a teacher card
linked to `/teachers`, students/grades/activities/logs cards, updated_at, source
statuses, and a next-step panel. The one weak spot: the participants / learners /
teachers breakdown and the live counts were read ONLY from
`/api/lti13/nrps-preview` (`role_counts`), which can come back empty even when
NRPS works (see `2026-06-01-dashboard-participants-teachers-breakdown-v1.md`).

## What changed (src/pages/Dashboard.tsx only)

- `useDashboardTeachers` now fetches BOTH safe endpoints in parallel:
  - `/api/lti13/participants-breakdown` (authoritative aggregate counts +
    `course_title` + `updated_at`; returns no names by design).
  - `/api/lti13/nrps-preview` (real instructor names + fallback counts).
- Counts prefer the authoritative breakdown aggregates
  (`total_members` / `learners_count` / `instructors_count`), then fall back to
  the preview `role_counts`, then to the resolved instructor name count. Only
  shown when the endpoint returned real live data (`ok === true`, value > 0).
- Added a `courseTitle` field from the breakdown's live launch context; the hero
  space name is now `teachers.courseTitle || session?.course_title ||
  site?.site_name || "—"` (live NRPS context wins when present, otherwise the
  prior behavior is unchanged).
- `updatedAt` prefers the breakdown `updated_at`, then the preview `now`.
- Instructor names still come only from the preview; breakdown returns none.

## Truth / safety rules honored

- No invented data, no demo content, no "אין דמו" text, no broken buttons, no
  hard-coded 216/222/6. Counts/title render only from real live responses.
- Only aggregate counts, instructor names, and the course title are read — no
  emails, raw IDs, access tokens, client assertions, private keys, secrets, or
  national IDs (the breakdown endpoint already strips these and performs no save).
- Did NOT touch: student sync (`/api/imports/nrps-sync`), `useAutoSyncStatus`
  sync payload, `useImportsOverview`, the 216-students card data path, Supabase,
  server allowlists, server NRPS sync, LTI launch/allowlist, manual import
  fallback, evidence logs, Supabase schema, env/secrets, Render, production SQL,
  Teacher Release, or PR #127.
- Kept the existing dashboard actions and the `/teachers` link from the prior
  cleanup; no new routes added; no removed technical-clutter reintroduced.

## Checks run

- `node --check src/server.js` — PASS
- `npm run check` — PASS
- `npm run build` — PASS
- `npm run doctor` — PASS (REPO_DOCTOR_OK)
- `npm run typecheck` — pre-existing errors only in `src/pages/GradebookImport.tsx`
  (4× TS2304, present on clean main); NO new errors from Dashboard.tsx.
- `npm run audit:moodle-automation` — PASS
- `npm run audit:automation-capabilities` — PASS
- `npm run audit:automation-capability-contract` — PASS
- `npm run audit:automation-evidence-log` — PASS
- `npm run audit:auto-extraction-source-router` — PASS
- `npm run audit:multi-teacher-isolation-evidence` — PASS
- `npm run audit:supabase-rls-isolation-readiness` — PASS (documented RLS blocker
  remains; Teacher Release stays NO)

## What must be checked live in Moodle (לא אומת)

- Actual current teacher names / exact teacher count, the real participant and
  learner counts (e.g. 216 / 222), and the live course title — all displayed only
  from live NRPS/breakdown, never assumed. Confirm by opening the tool from Moodle.

## How this avoids breaking the 216 synced learners

- The student count card, `useImportsOverview`, and the auto-sync path are
  unchanged. This PR only changes how the teacher header *reads and displays* the
  NRPS aggregates and space title; it does not write students, change the sync
  request, or alter overview counts.

## Progress estimate

~88% for dashboard action-hub data correctness; final live Moodle verification of
names, 216/222 counts, and the live course title remains (`לא אומת`).
