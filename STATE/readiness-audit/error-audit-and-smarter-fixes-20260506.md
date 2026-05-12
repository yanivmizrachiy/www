# Error audit and smarter fixes — 2026-05-06

## Purpose

User asked to stop and check repository errors deeply before continuing. This file records concrete errors/risk points found by inspecting key repo files after the permanent Render deployment.

## Audited files

- `src/server.js`
- `src/hooks/useImports.tsx`
- `src/pages/Import.tsx`
- `src/lib/moodleImport.ts`
- `src/pages/Students.tsx`
- `src/pages/Grades.tsx`
- `package.json`
- `render.yaml`
- `STATE/project-status.md`
- `PROJECT_RULES.md`

## Confirmed good state

### 1. Permanent Render path exists

The repo now contains `render.yaml` aligned with the working Render deployment:

```text
buildCommand: npm ci --include=dev && npm run build
startCommand: npm run start
APP_BASE_URL=https://www-tijc.onrender.com
```

### 2. Server LTI endpoint exists

`src/server.js` contains canonical LTI endpoint:

```text
/api/lti/launch
```

and OAuth1 HMAC-SHA1 verification logic.

### 3. Import UI exists

`src/pages/Import.tsx` supports:

- upload file
- paste table
- parse Moodle file/table
- preview rows
- confirm import

### 4. Moodle parser exists

`src/lib/moodleImport.ts` detects report types:

- students
- grades
- logs
- completion

## Real errors / risks found

### Error 1 — Import submit still depends on Supabase function

`src/hooks/useImports.tsx` currently posts imports to:

```text
${VITE_SUPABASE_URL}/functions/v1/import-moodle-report
```

Risk:

- If this Edge Function is missing or not configured, the user can preview a Moodle report but the actual import will fail.
- This blocks the first real goal: Participants report -> Students page.

Required fix:

- `postImport` should try a Render/Node endpoint first:

```text
POST /api/import
```

- Supabase function can remain as fallback only after it is verified.

### Error 2 — Server has overview fallback but not full import API

`src/server.js` currently has:

```text
GET /api/imports/overview
```

but there is no verified matching:

```text
POST /api/import
GET /api/imports/students
GET /api/imports/grades-matrix
GET /api/imports/course-structure
GET /api/imports/activity-overview
```

Risk:

- Dashboard can look clean with empty counts.
- But actual import and deeper pages can still fail or stay empty.

Required fix:

- Add Node import routes for at least the Participants report first.
- Add deeper routes only after they are tested.

### Error 3 — Students page still relies on Supabase RPC through hook

`src/pages/Students.tsx` uses `useImportedStudents()`.

`useImportedStudents()` currently calls:

```text
lti_list_students
```

Risk:

- If Supabase RPC is missing, students page may show an error or no real imported students even after Render is connected.

Required fix:

- Add Node-first fallback in `useImportedStudents()`:

```text
GET /api/imports/students?t=<token>
```

or use the existing local server `/api/students` with a verified session-aware route.

### Error 4 — Grades/activity/report hooks still depend on Supabase RPCs

Several hooks still call Supabase RPC directly:

```text
lti_get_grades_matrix
lti_get_course_structure
lti_get_activity_overview
lti_get_student_reports
lti_get_task_completion_detail
lti_get_daily_activity
lti_get_practice_time
lti_get_student_profile
```

Risk:

- After LTI connection, pages can still show `Failed to fetch` or empty/error states if RPCs are missing.

Required fix:

- Do not try to fix every domain at once.
- Fix students first.
- Then grades.
- Then logs/practice time.

### Error 5 — Store schema incomplete for import batches

`emptyStore()` does not explicitly include:

```text
importBatches
score/gradeItems
chapters
logEvents
completion rows
```

The overview route defensively handles missing arrays, but imports need a stable schema.

Required fix:

- Extend `emptyStore()` with explicit arrays:

```text
importBatches: []
gradeItems: []
chapters: []
logEvents: []
completionRows: []
```

### Error 6 — Render free plan sleep risk

Render free service may sleep. First Moodle launch may be slow.

Required mitigation:

- Add honest documentation: first launch can take time.
- Do not treat first slow response as a Moodle/LTI failure until checked.

### Error 7 — branch/main mismatch

The active branch is:

```text
gemini/ai-studio-sync-20260428-193953
```

Default branch is:

```text
main
```

Risk:

- Future work may accidentally target `main` or another branch.

Required rule:

- Until explicitly merged, all Moodle Teacher Hub runtime work must target `gemini/ai-studio-sync-20260428-193953`.

## Smart next fix order

Do not continue broad feature development.

### Fix A — minimal participants import path

Patch only these pieces:

1. `src/server.js`
   - Add `POST /api/import` supporting report_type=`students` first.
   - Save imported real participants to `store.students`.
   - Save import batch metadata.

2. `src/hooks/useImports.tsx`
   - `postImport()` tries `/api/import` first.
   - `useImportedStudents()` tries `/api/imports/students` first.
   - Supabase remains fallback only.

3. `STATE/evidence-log.md`
   - Document test result after real Participants import.

### Fix B — gradebook import path

Only after Fix A works.

### Fix C — logs/practice time path

Only after gradebook works.

## Current recommendation

Next code patch should be small and targeted:

```text
Make Participants import work end-to-end on Render without requiring Supabase RPC.
```

This is the most useful next improvement because it proves the first real teacher data flow.

## Current readiness

```text
Permanent Render runtime: high confidence
Direct LTI connection: user reported connected
Dashboard empty fallback: partial
Participants import end-to-end: not yet verified
Overall product readiness: not production-ready
```
