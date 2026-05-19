# Work Order: Course Structure & Activities Import V1

**Issued by:** GPT (project manager)
**Assigned to:** Claude (coding agent)
**Epic:** Level 2 — Course Structure / Activity Completion
**Status:** OPEN

---

## Mandatory pre-flight (read before touching any file)

1. Read `PROJECT_RULES.md` in full.
2. Read `STATE/project-status.md`.
3. Read `STATE/CURRENT.md`.
4. Read `STATE/evidence-log.md`.
5. Read `docs/AI_CONTROL_TOWER.md`.

Do not write a single line of code before completing the above.

---

## Scope — what to build

Build or complete Course Structure & Activity import so the teacher can
upload a Moodle Course Structure / Activity Completion report and see
course sections and activities truthfully in the UI.

### Backend

- Build or complete `src/courseStructureImport.ts` (or `.js` if TypeScript
  is not used elsewhere in `src/`).
- Parse the Moodle course structure / activity completion report (ODS/CSV).
- Store sections and activities in Supabase (use existing table patterns —
  do not create new Supabase migrations without GPT approval).
- Expose a POST import endpoint at `/api/import/course-structure`.
- Return aggregate counts only — no raw student rows in the response.

### Frontend

- Build or complete `src/components/CourseStructureImport.tsx` (or `.jsx`).
- Wire the `/course-structure-import` route in the router.
- Add a real navigation link from the dashboard or import hub.
- Improve `/tasks` to show real course sections and activities when data
  exists, with a clear empty state when no import has been done.

---

## Scope — what NOT to touch

- Do not touch Participants import.
- Do not touch Gradebook import code.
- Do not touch Logs import code.
- Do not touch Supabase schema migrations (use existing patterns only).
- Do not touch LTI launch.
- Do not touch `src/practiceTime.js`.
- Do not touch `STATE/teacher-release/`.
- Do not start over or rewrite the app.
- Teacher Release remains NO.

---

## Quality gates (run before opening PR)

```
npm run check
npm run build
npm run doctor
```

All three must pass with zero errors.

---

## PR rules

- Open exactly one PR.
- PR title: `feat: Course Structure & Activities Import V1`
- PR body must list: files changed, checks passed, aggregate counts only.
- Stop after opening the PR — do not merge.

---

## Truth rules

- If the Moodle report does not contain a field, do not invent it.
- Empty state is acceptable and required when no import has been done.
- Do not label estimated data as official Moodle data.
- Teacher Release remains NO.
