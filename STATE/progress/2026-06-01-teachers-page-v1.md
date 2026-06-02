# 2026-06-01 - Teachers Page V1

**Branch:** feat/teachers-page-v1
**Teacher Release:** NO (unchanged)
**Scope:** add a dedicated teacher/team page at `/teachers` showing the
instructors of the current LTI 1.3 space, plus a link to it from the dashboard
teacher card. Frontend-only; no backend, no new endpoints.

## What changed

- src/pages/Teachers.tsx (new):
  - Route content for `/teachers`. Title: `צוות הוראה במרחב`.
  - Reads the safe NRPS preview via the shared `nrpsPreviewUrl()` helper with
    `{ credentials: "include" }` — the same endpoint and token flow already used
    by Dashboard and Students. No new server route, no backend change.
  - Shows ONLY instructor members (`role_kind === "instructor"`, with legacy
    `is_instructor` fallback): real names + a short Hebrew role label via the
    existing `hebrewRoleLabel()` helper (instructors → `מורה`).
  - Team size from live `role_counts.Instructor` (falls back to resolved name
    count only when that field is absent); space/course name from
    `session.course_title` / `site.site_name` when safely available; source line
    `מקור: Moodle NRPS`; `עודכן <date time>` from the NRPS `now` field.
  - Marks which teacher opened the tool ("זה אתה") by matching the session
    display name (`teacher_display_name`) to an NRPS instructor name, by
    normalized name only — never by any identifier. If the session has no safe
    display name, nobody is marked.
  - Truthful empty states: if NRPS confirms instructors but no names arrived,
    asks to allow name sharing in Moodle privacy and refresh; if no instructors,
    asks to open the tool from Moodle. Never invents names or counts.
- src/App.tsx:
  - Imported `Teachers` and registered `<Route path="/teachers" .../>` inside
    the existing `AppLayout` route group.
- src/pages/Dashboard.tsx:
  - The dashboard teacher card is now a `Link` to `/teachers` (added a small
    `צוות הוראה במרחב ←` affordance). No data/count logic changed — the card
    still reads the same NRPS preview values.

## Navigation decision

- Did NOT add a sidebar entry. `AppSidebar` is the deliberately simplified
  `MTH_TEACHER_SIDEBAR_FINAL_WORKFLOW_V1` workflow list; adding an item would
  violate that simplified nav. The page is reachable from the dashboard teacher
  card, so it is discoverable without changing the sidebar.

## Truth / safety rules honored

- No invented data, no demo content, no hard-coded 216/222/6. Counts and names
  render only when live NRPS returned them (`ok === true`); otherwise truthful
  Hebrew empty states.
- No emails, raw IDs, national IDs, access tokens, client assertions, or secrets
  are read or displayed — only instructor `name`, aggregate counts, and the
  course title already present in the session.
- Hebrew RTL preserved (reuses `SafePage` and the premium card styling).
- Did NOT touch: student sync (`/api/imports/nrps-sync`, `useAutoSyncStatus`),
  the 216-students card, `useImportsOverview`, server.js, Supabase
  schema/migrations, LTI launch flow, Participants/Gradebook/Logs import,
  evidence logs, Render/env/secrets, Teacher Release gate, or PR #127.

## Checks (sandbox)

- `node --check src/server.js` — OK
- `npm run check` — OK
- `npm run build` — OK (Teachers.tsx compiles; bundle built)
- `npm run typecheck` — pre-existing errors only (duplicate `useKeepAlive`
  import in App.tsx; missing symbols in untouched GradebookImport.tsx). No new
  errors from changed files (Teachers.tsx, the new App.tsx route, the Dashboard
  card link).
- `npm run doctor` — REPO_DOCTOR_OK
- `npm run audit:moodle-automation` — OK
- `npm run audit:automation-capabilities` — CAPABILITY_REGISTRY_AUDIT_OK
- `npm run audit:automation-capability-contract` — CONTRACT_AUDIT_OK
- `npm run audit:automation-evidence-log` — EVIDENCE_LOG_AUDIT_OK
- `npm run audit:auto-extraction-source-router` — AUTO_EXTRACTION_ROUTER_AUDIT_OK
- `npm run audit:multi-teacher-isolation-evidence` — MTH_ISOLATION_EVIDENCE_AUDIT_OK
- `npm run audit:supabase-rls-isolation-readiness` — OK (documented RLS blocker;
  Teacher Release stays NO)

## What must be checked live in Moodle (לא אומת)

- Actual current teacher names, exact instructor count, and the course/space
  name — all displayed only from live NRPS / the real session, never assumed.
- That the "זה אתה" match resolves for the opening teacher (depends on the
  session display name matching the NRPS instructor name in the live launch).

## How this avoids breaking the 216 synced learners

- The page only *reads* the NRPS preview for display and filters to instructors.
  It never writes students, never calls the sync endpoint, and does not change
  `useImportsOverview` or the student count card. The learner sync path is
  entirely untouched.

## Progress estimate

~88% for the teacher/team display feature; final live Moodle verification of
names, instructor count, and the "זה אתה" match remains (`לא אומת`).
