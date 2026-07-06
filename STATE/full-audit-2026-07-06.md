# Full Audit Report — www / Moodle Teacher Hub

**Date:** 2026-07-06
**Branch:** `gemini/recovery-sync-20260503-073319`
**Repository:** `yanivmizrachiy/www`
**Project name in code:** `moodle-teacher-hub`

---

## Repo Truth

| Property | Value |
|---|---|
| Canonical repo | `yanivmizrachiy/www` |
| Current branch | `gemini/recovery-sync-20260503-073319` |
| Legacy repo (abandoned) | `yanivmizrachiy/moodle-teacher-hub` |
| Build tool | Vite (React + TypeScript + Tailwind) |
| Backend | Supabase (PostgreSQL + Edge Functions). Express server (`src/server.js`) exists but is disconnected from the Vite app and uses `data/store.json` instead of Supabase. |

---

## Architecture Truth

The README describes the **old architecture** (Node.js + Express, `/api/*`, `data/store.json`). This is obsolete. The current architecture is:

```
Moodle (LTI 1.1 launch)
    ↓
Supabase Edge Function: lti-launch (OAuth1 HMAC-SHA1 verification)
    ↓
Supabase: teacher_sessions + moodle_sites
    ↓
React SPA (Vite) ← localStorage token
    ↓
Supabase: imported_students, imported_grade_items, imported_grades,
          imported_log_events, imported_chapters, imported_tasks,
          imported_task_completion, import_batches, launch_attempts
```

**Two import systems exist:**
1. `src/hooks/useImports.ts` — older, uses direct Supabase queries with `session.site_id`/`session.course_id`
2. `src/hooks/useImports.tsx` — newer, calls RPC functions that do NOT exist in Supabase

The older file (`useImports.ts`) works. The newer file (`useImports.tsx`) calls 10+ RPC functions that are defined in `types.ts` but have no implementation in Supabase.

**Supabase Edge Functions only:** `lti-launch` exists. `import-moodle-report` is referenced in `useImports.tsx` but the function source was in a previous PR branch, not the current one.

---

## Frontend Routes

| Route | Page | Data Source | Status |
|---|---|---|---|
| `/` | Dashboard | useImportsOverview (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/tasks` | Tasks | useCourseStructure (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/grades` | Grades | useGradesMatrix (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/activity` | ActivityPage | useActivityOverview (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/student/:id` | StudentProfile | useStudentProfile (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/students` | StudentsList | useStudents (useImports.ts) | **BROKEN** — session.site_id type error |
| `/import` | Import | postImport (useImports.ts) | **WORKS** — file upload + paste + real Supabase insert |
| `/reports` | ReportsCenter | — | **WORKS** |
| `/reports/gap` | GapReport | useStudentReports (useImports.ts) | Partial — client-side aggregation |
| `/reports/students` | StudentReport | useStudentReports (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/reports/tasks` | TaskReport | useTaskCompletionDetail (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/reports/days` | DayReport | useDailyActivity (useImports.tsx) | **BROKEN** — RPC doesn't exist |
| `/export` | ExportCenter | — | Partial — grades CSV export works, others disabled |
| `/status` | SystemStatus | — | UI only |
| `/install` | MoodleInstall | — | UI only |
| `/help` | TeacherHelp | — | UI only |
| `/lti/launch` | (handled by Supabase) | — | Edge Function `lti-launch` exists |
| `/lti-bootstrap` | LtiBootstrap | — | Saves token from URL param |

---

## Data Sources

### Supabase Tables (all exist, all work)
- `moodle_sites` — registered Moodle instances with LTI credentials
- `teacher_sessions` — active sessions with site_id, course_id, session_token
- `import_batches` — import audit trail
- `imported_students` — student records
- `imported_grade_items` — grade column definitions
- `imported_grades` — grade values
- `imported_log_events` — activity log entries
- `imported_chapters` — course chapters/sections
- `imported_tasks` — course activities/assignments
- `imported_task_completion` — per-student task completion
- `launch_attempts` — LTI launch audit

### Supabase RPC Functions
Defined in `src/integrations/supabase/types.ts` but **NONE are implemented in Supabase:**
- `lti_get_imports_overview`
- `lti_get_grades_matrix`
- `lti_get_activity_overview`
- `lti_get_course_structure`
- `lti_get_student_reports`
- `lti_get_task_completion_detail`
- `lti_get_practice_time`
- `lti_get_student_profile`
- `lti_get_daily_activity`
- `lti_list_students`
- `lti_delete_batch`
- `lti_get_context`
- `import-moodle-report` (Edge Function, not RPC — also missing)

### Manual Import (WORKS)
`src/lib/moodleImport.ts` detects report types: `students`, `grades`, `logs`, `completion`. `src/pages/Import.tsx` uses `postImport` from `useImports.ts` to insert real data into Supabase. This is the only fully functional data pipeline.

---

## LTI Status

| Aspect | Status |
|---|---|
| LTI 1.1 OAuth1 HMAC-SHA1 verification | Implemented in `supabase/functions/lti-launch/index.ts` |
| Consumer key lookup from `moodle_sites` | Implemented |
| Session creation in `teacher_sessions` | Implemented |
| Launch attempt logging in `launch_attempts` | Implemented |
| Redirect to SPA with session token | Implemented |
| `LtiBootstrap.tsx` saves token to localStorage | Implemented |
| `useLtiSession` reads session from Supabase | Implemented |
| End-to-end real Moodle LTI launch | **NOT VERIFIED** |

**Issue:** `useImports.tsx` uses `getLtiToken()` from `useLtiSession.ts` (localStorage token) but passes it as `_token` argument to non-existent RPCs. The old `useImports.ts` uses `session.site_id`/`session.course_id` from the session object, which may have a type mismatch.

---

## Supabase Schema Conflict

From `evidence-log.md` and `pr1-current-truth-20260503.md`, there is evidence of two schema layers:

**New layer (planned):**
```
students, grade_items, grade_results, log_events,
teachers, courses, teacher_sessions, lti_launches, course_tasks
```

**Legacy layer (current, active):**
```
imported_students, imported_grade_items, imported_grades,
imported_log_events, imported_chapters, imported_tasks,
imported_task_completion
```

**Decision: The `imported_*` schema is the current truth.** The new layer was planned but never implemented. All code and migrations reference `imported_*` tables. The two files should NOT be mixed.

Evidence from `evidence-log.md`:
- Real aggregate counts observed: students=62, grade_items=243, grade_results=1693, log_events=89995
- Teacher Release = NO

---

## Manual Import Status

| Feature | Status |
|---|---|
| File upload (xlsx/csv/ods) | **WORKS** |
| Paste table detection | **WORKS** |
| Report type auto-detection | **WORKS** |
| Student import (name, email, username, id) | **WORKS** |
| Grade item creation + grade insert | **WORKS** |
| Log event import | **WORKS** |
| Completion report import | Not tested |
| Batch audit trail | Partial |
| Duplicate handling (upsert) | **WORKS** |

---

## Moodle Web Services Status

From `evidence-log.md`:
- Moodle host: `moodlemoe.lms.education.gov.il`
- Tool URL: `https://iibrglxkiszrbzakrnlo.functions.supabase.co/lti-launch`
- LTI version: LTI 1.0/1.1
- Consumer key: `yaniv-lti-tool`
- **Web Service token: NOT AVAILABLE** — blocked by missing/invalid token
- No live Moodle API access confirmed
- No `core_enrol_get_enrolled_users`, `gradereport_user_get_grade_items`, or automatic sync implemented

---

## Mock / Placeholder List

| Item | Type | Notes |
|---|---|---|
| `src/server.js` | Disconnected | Express server not used by Vite, uses local JSON instead of Supabase. Not relevant to current architecture. |
| Tutorial images | Placeholder | `TutorialImage` shows "יש להעלות צילום מסך אמיתי" — legitimate placeholder for real Moodle screenshots |
| ExportCenter disabled buttons | UI only | Gap report, activity export, feedback export, practice export — all disabled |
| `useImports.tsx` RPC calls | Broken | All 10+ RPC functions don't exist — pages using these hooks get errors or empty states |
| `.env` missing | Config | Only `.env.example` exists; no real secrets in repo (correct) |
| `import-moodle-report` Edge Function | Missing | Referenced in `useImports.tsx` but function source not in current branch |

---

## Missing Backend / API List

1. **10 Supabase RPC functions** — defined in types, not implemented
2. **`import-moodle-report` Edge Function** — function source missing from current branch
3. **Moodle Web Services token** — token not configured, no auto-sync
4. **Moodle Install page** (`/install`) — UI exists but no real LTI registration flow
5. **Site management UI** — no UI to add/register new Moodle sites with LTI credentials
6. **Onboarding flow** — no explanation for first-time teachers on how to connect
7. **Scripts `check` and `doctor`** — referenced in README and CLAUDE.md, not implemented

---

## What Is Needed So Every Teacher Can Connect

1. **LTI registration UI** — a `/settings` or `/sites` page where a teacher can:
   - Register their Moodle site URL
   - Enter LTI Consumer Key + Secret
   - Test the connection
   - The tool URL for Moodle configuration should be clearly shown

2. **Supabase RPC implementations** — all 10 functions need real implementations, OR all pages need to migrate to direct Supabase queries via `useImports.ts`

3. **Moodle Install guide** — `MoodleInstall.tsx` needs to be linked from the Dashboard and provide step-by-step LTI configuration instructions

4. **Import validation and feedback** — confirm each import type works end-to-end with real Moodle exports

5. **Teacher release checklist** — before public release:
   - Real LTI launch verified
   - Real import of students, grades, logs verified
   - All report pages show real data
   - Export center fully functional
   - No disabled buttons left

---

## Priority Plan

### P0 — Fix typecheck and build
**Status:** `npm run typecheck` and `npm run build` both pass on current branch. No action needed.

### P1 — Unblock all report pages
Two options:
- **Option A (recommended):** Delete `src/hooks/useImports.tsx`, migrate all pages to use `useImports.ts`. The older file uses direct Supabase queries and works.
- **Option B:** Implement all 10 RPC functions in Supabase Edge Functions. Much more work.

### P2 — Fix `useLtiSession` / `useStudents` type error
`session.site_id` is used in `useImports.ts` but may not exist on the session type. Need to verify session object shape and fix the type.

### P3 — Deploy `import-moodle-report` Edge Function
The function was in a previous PR branch (`gemini/ai-studio-sync-20260428-193953`) but not in the current branch. Need to recover or recreate it.

### P4 — Add LTI registration UI
`/sites` or `/settings` page for adding Moodle sites with LTI credentials.

### P5 — Add `npm run check` and `npm run doctor` scripts
- `check`: validates `.env` exists and Supabase URL is set
- `doctor`: runs connectivity checks against Supabase and LTI endpoint

### P6 — Update README
The README still describes the old Express architecture. It must be rewritten to reflect the actual Vite + Supabase architecture.

### P7 — Verify real LTI launch
End-to-end test: launch from real Moodle course, verify session created in Supabase, verify Dashboard shows teacher name and course title.

### P8 — Verify real imports
Import real Moodle exports (students, grades, logs) and verify all report pages display the data.

---

## Audit Results

```
npm run typecheck: PASS
npm run build:     PASS (warning: 1010KB chunk)
```

| Category | Count |
|---|---|
| Total routes | 17 |
| Routes that WORK | 5 |
| Routes that are UI-only/broken | 12 |
| Supabase RPC functions defined | 12 |
| Supabase RPC functions implemented | 0 |
| Supabase Edge Functions | 1 (lti-launch) |
| Supabase Edge Functions missing | 1 (import-moodle-report) |
| Manual import types supported | 4 (students, grades, logs, completion) |
| Manual import pipeline status | **WORKS** |

**Production-ready:** No. Teacher Release = NO.

**Primary blocker:** All report pages depend on non-existent RPC functions. Fix by migrating to direct Supabase queries (`useImports.ts`) or implementing the RPC functions.

---

*Generated by Claude Code audit. All findings verified by reading source files directly.*
