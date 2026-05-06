# Deep repo audit and next optimization plan — 2026-05-06

## Purpose

The user explicitly requested to stop before continuing and verify that the repository is fully documented, truthful, efficient, and ready for smarter next steps.

This audit records the current real state after moving from temporary Termux/Cloudflare runtime to a permanent Render runtime.

## Repository

```text
repo: yanivmizrachiy/www
active branch: gemini/ai-studio-sync-20260428-193953
default branch: main
visibility: public
```

## Verified repository facts

- `PROJECT_RULES.md` exists and defines the repo as the source of truth.
- `STATE/project-status.md` exists and was updated after the permanent Render launch.
- `render.yaml` exists and was updated to match the working Render deployment configuration.
- `STATE/readiness-audit/render-production-launch-20260506.md` exists and documents the permanent Render transition.
- The active permanent runtime URL is documented as `https://www-tijc.onrender.com`.
- The canonical permanent LTI endpoint is documented as `https://www-tijc.onrender.com/api/lti/launch`.

## Important correction made during audit

The repo previously had `render.yaml` with this build command:

```text
npm ci && npm run build
```

But Render failed with:

```text
vite: not found
```

because Vite was not available when dev dependencies were not installed.

The repo was corrected to:

```text
npm ci --include=dev && npm run build
```

This aligns the repository source-of-truth with the actual working Render deployment.

## Current architecture decision

The active, simplest permanent launch path is:

```text
Moodle -> Render /api/lti/launch -> Moodle Teacher Hub
```

The previous temporary path is retired for active use:

```text
Moodle -> Supabase Gateway -> Termux/Cloudflare temporary runtime
```

The Supabase Gateway remains documented as a working health endpoint, but it is not currently the recommended active LTI launch path because forwarding caused:

```text
MISSING_OAUTH_SIGNATURE
```

## What is considered working now

```text
Permanent Render service: working according to user screenshots/logs
Render build after fix: working according to user screenshots/logs
Render service live at primary URL: working according to user screenshots/logs
Direct Render LTI endpoint configured in code: exists
User reported direct launch status: connected
```

## What is not yet considered fully done

```text
Students import: not verified end-to-end
Grades import: not verified end-to-end
Logs/practice time import: not verified end-to-end
Activity completion import: not verified end-to-end
Supabase persistence schema/RPC: not verified end-to-end
Moodle Web Services API: blocked-no-token / not verified
Broad production use for many teachers: not ready yet
```

## Code inspection notes

### Import page

`src/pages/Import.tsx` already supports:

- file selection
- Moodle file parsing
- pasted table parsing
- preview of first rows
- confirmation button for import

### Moodle import parser

`src/lib/moodleImport.ts` already detects report type from headers for:

- students / participants
- grades
- logs
- activity completion

### Imports hook

`src/hooks/useImports.tsx` has dashboard overview fallback behavior, but several deeper hooks still depend on Supabase RPCs:

- `lti_list_students`
- `lti_get_grades_matrix`
- `lti_get_course_structure`
- `lti_get_activity_overview`
- `lti_get_student_reports`
- `lti_get_task_completion_detail`
- `lti_get_daily_activity`
- `lti_get_practice_time`
- `lti_get_student_profile`

This means the dashboard may look clean, but full students/grades/activity pages still require persistence/RPC completion or Node fallbacks.

## Efficiency risks if we continue without fixing

1. The teacher may import data but deeper pages may still call Supabase RPCs that are missing or not configured.
2. Data may appear imported in UI preview but not persist correctly unless `postImport` and backend storage are verified.
3. There is risk of mixing three architectures if not enforced:
   - old Termux/Cloudflare runtime
   - Supabase Gateway forwarding runtime
   - direct Render runtime
4. Render is on a free plan and may sleep, so first launch may be slow.
5. The active branch is not main. This must remain explicit until merge/release strategy is decided.

## Next smarter implementation plan

Before adding any new UI features, improve the real data pipeline in this order:

### Phase 1 — Make first import succeed end-to-end

Goal:

```text
Participants report -> Import page -> server import -> Students page shows real names
```

Required work:

- Verify or add backend endpoint for `postImport` on Render.
- Ensure data persists somewhere real.
- Prefer Supabase database persistence if tables/RPCs exist.
- If persistence is not ready, do not pretend it is ready.
- Add clear error if storage is missing.

### Phase 2 — Make student list page resilient

Goal:

```text
Students page shows real imported students or honest empty state.
```

Required work:

- Add Node fallback or verified Supabase RPC for `useImportedStudents`.
- Do not show `Failed to fetch` to the teacher.
- Do not invent students.

### Phase 3 — Gradebook import

Goal:

```text
Gradebook report -> import -> grades matrix page shows real grades.
```

Required work:

- Confirm column detection for real Hebrew Moodle Gradebook export.
- Normalize names/IDs safely.
- Preserve missing grades as missing, not 0.

### Phase 4 — Logs/practice time

Goal:

```text
Logs report -> import -> activity/practice time pages show calculated windows with explanation.
```

Required work:

- Use Moodle log timestamps only.
- Label calculated practice time as calculated from log windows.
- If logs are absent, show: `לא ניתן לחשב ללא לוגים`.

### Phase 5 — Reduce teacher work

After manual import works, optimize:

- copy-paste from Moodle tables
- auto-detect report type more robustly
- show exact Moodle report needed when data is missing
- add import checklist screen
- add last-import timestamps
- add update-only mode to avoid duplicates

## Recommended immediate next action

Do not continue feature work yet.

The next technical action should be a small focused patch:

```text
Add/verify backend import endpoint and persistence path for Participants report first.
```

Then perform one real import test with a Participants report and document the result.

## Success definition for next step

Next step is successful only if all are true:

```text
1. The user opens Moodle Teacher Hub through direct Render LTI.
2. User imports a real Participants report.
3. Import returns success.
4. Students page shows real names.
5. No fake/demo data is present.
6. Result is documented in STATE/evidence-log.md or a dated STATE evidence file.
```

## Current readiness estimate

```text
Permanent runtime: 95%-99% verified by screenshots/logs
Direct LTI connection: user-reported connected, needs final evidence-log entry
Repo documentation after audit: 90%+
Manual import pipeline: not verified, estimated 35%-45%
Full product readiness: not production-ready yet
```
