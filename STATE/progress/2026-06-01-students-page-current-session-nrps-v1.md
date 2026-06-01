# 2026-06-01 - Students Page Current-Session NRPS V1

**Branch:** fix/students-page-current-session-nrps-v1
**Teacher Release:** NO (unchanged)
**Scope:** the Students page called `/api/lti13/nrps-preview` without the current
session token and without credentials, so the request often resolved to no live
session (empty teachers/students even when LTI 1.3 NRPS works). It also generated
`/students/nrps:<id>` links that are always broken, and listed every non-instructor
(including unknown roles) as a student.

## Root cause

- `Students.tsx` fetched `/api/lti13/nrps-preview` with no `?t=<token>` and no
  `credentials: "include"` — same divergence already fixed on the Dashboard in
  PR #232. The shared helper `nrpsPreviewUrl()` existed but was unused here.
- Student rows linked to `/students/nrps:<member.id>`. The NRPS `members_named[].id`
  is a SHA-256 hash of the Moodle user id (see `src/server.js` nrps-preview), not a
  routable student record id, so every profile link landed on the empty-state.

## What changed (src/pages/Students.tsx only)

- NRPS preview fetch now uses `nrpsPreviewUrl()` + `{ credentials: "include" }`,
  so the current LTI session token is always sent (token/query/header/cookie
  resolution on the server now succeeds the same as Dashboard).
- Added a truthful NRPS summary at the top of the page, shown ONLY when live NRPS
  returned real counts (`ok === true` and `members_count > 0`):
  `<total> משתתפים במרחב · <learners> תלמידים · <N> מורים [· <U> בתפקיד לא מזוהה] · מקור: Moodle NRPS`.
  Counts read straight from `role_counts.Learner`, `role_counts.Instructor`, and
  `members_count`. No hard-coded 216/222/6.
- Students list shows Learners only (`is_instructor === false`). Instructors are
  excluded from the list (they remain in the separate מורים section).
- Unknown roles are never auto-treated as students: `unknownCount = members_count -
  Learner - Instructor` is surfaced as a read-only summary note only.
- Profile links are valid-only: each NRPS learner is matched by normalized name to
  an imported student record (`useImportedStudents`, real routable id). When a match
  exists, the row links to `/students/<real-id>`; when not, the name is shown as
  plain text (no link). The broken `/students/nrps:<hash>` link was removed entirely.
  When no NRPS roster is present, falls back to imported students (already valid ids).

## Truth / safety rules honored

- No invented data, no fake buttons: summary and counts render only when live NRPS
  returns real values; otherwise nothing is shown. No hard-coded 216/222/6.
- No emails, raw IDs, access tokens, assertions, secrets, or national IDs are read
  or displayed — only names (instructors + learners) and aggregate counts.
- No invented IDs: links use only real imported-student ids; unmatched learners get
  no link rather than a fabricated one.
- Did NOT touch the student sync path (`/api/imports/nrps-sync`), `useAutoSyncStatus`,
  Dashboard sync, server NRPS preview/sync logic, Supabase schema/migrations, manual
  import fallback, evidence logs, Render/env/secrets, Teacher Release gate, or PR #127.
- Teacher Release stays NO.

## Checks run

- `node --check src/server.js` — PASS
- `npm run check` — PASS
- `npm run build` — PASS (vite build OK)
- `npm run doctor` — PASS (REPO_DOCTOR_OK)
- `npm run typecheck` — pre-existing errors only in `src/App.tsx` (duplicate
  `useKeepAlive`) and `src/pages/GradebookImport.tsx` (missing names); verified
  identical on clean `main` (PR #232 baseline). No new errors from `Students.tsx`.
- `npm run audit:moodle-automation` — PASS
- `npm run audit:automation-capabilities` — PASS
- `npm run audit:automation-capability-contract` — PASS
- `npm run audit:automation-evidence-log` — PASS
- `npm run audit:auto-extraction-source-router` — PASS
- `npm run audit:multi-teacher-isolation-evidence` — PASS
- `npm run audit:supabase-rls-isolation-readiness` — PASS (documented RLS blocker;
  Teacher Release stays NO)

## What must be checked live in Moodle (לא אומת)

- Actual learner / instructor / participant counts (e.g. 216 / 222) — displayed only
  from live NRPS; real numbers confirmed only by opening the tool from Moodle.
- Whether live NRPS learner names match imported student names closely enough for
  the name-based profile link to resolve. Names that differ (nicknames, ordering)
  will correctly show as non-clickable rather than linking to a wrong/empty profile.

## How this avoids breaking the 216 synced learners

- The auto-sync path and `/api/imports/nrps-sync` are untouched. This PR only changes
  how the Students page *reads and displays* NRPS data and how it links rows. The
  imported roster (the synced learners) is still fetched via `useImportedStudents`
  and is used both as the link source and as the fallback list.

## Progress estimate

~85% for Students page NRPS-display + valid-link correctness; final live Moodle
verification of counts and name-match link resolution remains (`לא אומת`).
