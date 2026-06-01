# 2026-06-01 - Student Profile NRPS Linking V1

**Branch:** fix/student-profile-nrps-linking-v1
**Teacher Release:** NO (unchanged)
**Scope:** ensure every student that comes from NRPS opens a valid student
profile, and that a valid student with no data shows calm truth instead of an
error or a broken link.

## Root cause

- `/api/imports/students` (listing) resolves the roster from **Supabase first**
  and falls back to the local store. But `/api/imports/student-profile` looked up
  the student **only** in `store.students` (`src/server.js`). When the active
  source for the listing is Supabase, a student id shown in the list could be
  absent from the local store, so the profile endpoint returned
  `STUDENT_NOT_FOUND` — a real, listed student opening to "no info".
- PR #233 already removed the broken `/students/nrps:<hash>` links on the Students
  page (only name-matched imported students are linked). PR 7 hardens the
  remaining gap: the server-side profile resolution and the per-tab empty states.

## What changed

### src/server.js — `/api/imports/student-profile`
- Handler is now `async`. When the student id is not found in the local store,
  it performs a **space-isolated Supabase lookup** (`students` filtered by both
  `space_id` and `id`, `maybeSingle`), consistent with the listing endpoint. Any
  student visible in the list therefore resolves to a valid profile.
- Grades / completion / log events continue to be read **only** from the local
  store and are filtered by exact `student_id` AND space (`inSpace`). No cross-
  student or cross-space mixing is introduced. When a resolved student has no such
  rows, the endpoint returns `ok:true` with empty arrays and zeroed activity — the
  calm empty state, not an error.
- No change to NRPS sync semantics (PR #236): identity is still the persisted
  `students.id` / `nrpsMemberIdHash`-derived stable id. No new IDs are invented.

### src/pages/StudentProfile.tsx
- Each tab (ציונים / משימות / פעילות) now renders a calm `EmptyTruth` message
  ("אין עדיין ...") when that dataset is empty, instead of a blank table. The
  overview cards already showed `—` / 0 truthfully.

## Truth / safety rules honored

- No fake data, no demo content, no hard-coded 216/222/6.
- No emails, raw NRPS IDs, access tokens, assertions, secrets, or national IDs are
  exposed. The profile DTO returns only the fields already returned before
  (`external_username`, `external_id`), unchanged from prior behavior.
- Grades/logs are never mixed between students or spaces (exact id + space filter).
- Did NOT change: NRPS server-owned sync semantics (PR #236), the sync ID
  generation, manual import fallback, LTI launch flow, Supabase schema/migrations,
  production SQL, evidence logs, Render/env/secrets, Teacher Release gate, PR #127,
  or unrelated UI.
- Teacher Release stays NO.

## Student profile linking behavior (after this PR)

- `/students/:id` works for students saved from NRPS, resolving from the local
  store and, when absent there, from Supabase (space-isolated).
- The Students page (PR #233) still links only to real routable ids and never
  emits `/students/nrps:<hash>`; this PR makes the target of those links robust.
- A valid student with no grades/activity shows "אין עדיין מידע"-style calm truth
  per tab, never an error.

## Checks run

- `node --check src/server.js` — PASS
- `npm run check` — PASS
- `npm run build` — PASS (vite build OK)
- `npm run doctor` — PASS (REPO_DOCTOR_OK)
- `npm run typecheck` — pre-existing errors only in `src/App.tsx` (duplicate
  `useKeepAlive`) and `src/pages/GradebookImport.tsx` (missing names); verified
  identical on clean `main`. No new errors from the changed files.
- `npm run audit:moodle-automation` — PASS
- `npm run audit:automation-capabilities` — PASS
- `npm run audit:automation-capability-contract` — PASS
- `npm run audit:automation-evidence-log` — PASS
- `npm run audit:auto-extraction-source-router` — PASS
- `npm run audit:multi-teacher-isolation-evidence` — PASS
- `npm run audit:supabase-rls-isolation-readiness` — PASS (documented RLS blocker;
  Teacher Release stays NO)

## What must be checked live in Moodle (לא אומת)

- Whether the active deployment persists NRPS learners to Supabase or only to the
  local store; the fix covers both, but the Supabase fallback path itself is
  `לא אומת` until exercised against the live Supabase `students` table.
- That a real synced learner opened from the Students list renders their profile
  (overview + empty/real tabs) without `STUDENT_NOT_FOUND` — `לא אומת` until run
  from a live Moodle launch.

## How this avoids breaking the 216 synced learners

- The sync path (`/api/imports/nrps-sync`, `persistNrpsLearners`) and the stable id
  derivation are untouched. This PR only changes how the profile endpoint
  **resolves** an existing id (adding a read-only Supabase fallback) and how empty
  tabs render. Existing synced learner ids are unchanged and continue to resolve.

## Progress estimate

~91% overall (new-improvement track). Student-profile valid-link + calm-empty
correctness is in place at the code level; final live Moodle verification of the
Supabase resolution path and real-learner profile open remains (`לא אומת`).
