# 2026-06-01 - Dashboard Participants & Teachers Breakdown V1

**Branch:** fix/dashboard-participants-teachers-breakdown-v1
**Teacher Release:** NO (unchanged)
**Scope:** the dashboard teacher header could show empty / no live data even when
LTI 1.3 NRPS works, because `useDashboardTeachers` called
`/api/lti13/nrps-preview` without the `?t=<token>` query param and without
`credentials: "include"`. Server session resolution depends on
token/query/header/cookie, so the request often resolved to no live session.

## Root cause

- `useDashboardTeachers` fetched `/api/lti13/nrps-preview` with no token and no
  credentials, while the sibling `useAutoSyncStatus` already did it correctly.
  The two callers diverged, so the teacher card silently came back empty.

## What changed

- src/hooks/useLtiSession.ts:
  - Added `nrpsPreviewUrl()` — a single helper that always appends
    `?t=<encodeURIComponent(getLtiToken())>`. All NRPS preview callers now share it.
- src/pages/Dashboard.tsx:
  - `useDashboardTeachers` now calls `nrpsPreviewUrl()` with
    `{ credentials: "include" }`, and reads only fields the endpoint already
    returns: `members_count`, `role_counts.Instructor`, `role_counts.Learner`,
    `members_named` (instructor names only), and `now` (NRPS updated time).
  - `useAutoSyncStatus` and `handleSyncSpace` reuse `nrpsPreviewUrl()` (dedup of
    the inline URL building — no behavior change to the sync payload).
  - Teacher header pluralizes by the real NRPS instructor count: 1 → `מורה`,
    N → `N מורים`; shows up to 3 names + `· ועוד X`; the full comma-separated
    name list is in the element `title`. When NRPS returned no teacher names but
    the request succeeded, shows a short truthful message instead of inventing.
  - Added a truthful one-line participants breakdown under the teacher card,
    shown ONLY when live NRPS returned real counts: `<total> משתתפים במרחב ·
    <learners> תלמידים · <N> מורים · מקור: Moodle NRPS · עודכן <date time>`.

## Truth / safety rules honored

- No invented data: participants line and counts render only when `ok === true`
  and the count is real; otherwise nothing is shown. No hard-coded 222/216/6.
- No emails, raw IDs, access tokens, assertions, secrets, or national IDs are
  read or displayed — only `name` (instructors) and aggregate counts.
- Did NOT touch student sync logic, `/api/imports/nrps-sync`, `useAutoSyncStatus`
  sync payload, `useImportsOverview`, the 216-students card, Supabase writes,
  server allowlists, server NRPS sync, or PR #127.
- Teacher Release stays NO; no .env/secrets/Render/SQL/deploy changes.

## What must be checked live in Moodle (לא אומת)

- Actual current teacher names and exact teacher count — displayed only from live
  NRPS, never assumed.
- Actual 216/222 participant counts — the breakdown reflects whatever live NRPS
  returns; the real numbers must be confirmed by opening the tool from Moodle.

## How this avoids breaking the 216 synced learners

- The student count card and auto-sync path are unchanged. This PR only changes
  how the teacher header *reads and displays* the NRPS preview; it does not write
  students, change the sync request, or alter overview counts.

## Progress estimate

~85% for the dashboard teacher/participants display correctness; final live
Moodle verification of names and 216/222 counts remains (`לא אומת`).
