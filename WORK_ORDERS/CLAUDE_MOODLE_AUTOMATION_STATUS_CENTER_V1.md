# Claude Work Order: Moodle Automation Status Center V1

**Issued by:** GPT  
**Assigned to:** Claude  
**Epic:** Maximum Moodle Automation  
**Status:** OPEN  
**Teacher Release:** NO

## Mission

Build the next automation layer for Moodle Teacher Hub: a safe Moodle Automation Status Center.

Do not ask Yaniv for a Moodle export in this task. This task must inspect existing repository state and backend capabilities, expose safe aggregate readiness/status, and guide the teacher to the next best real action.

## Read first

Before editing code, read:

1. `PROJECT_RULES.md`
2. `docs/AI_CONTROL_TOWER.md`
3. `STATE/project-status.md`
4. `STATE/progress/2026-05-20-moodle-automation-readiness-audit.md`
5. `scripts/checks/moodle-automation-readiness-audit.cjs`
6. `src/server.js`
7. `src/pages/MissingData.tsx`
8. `src/pages/SettingsPage.tsx`
9. `src/pages/CourseStructureImport.tsx`
10. `src/hooks/useImports.tsx`

## Current verified truth

- Participants import works and must not be changed.
- Gradebook import works and must not be changed.
- Logs import works and must not be changed.
- Course Structure & Activities Import V1 is merged in PR #106.
- Supabase persistence exists.
- Teacher Release remains NO.

## Build

Create a safe automation status layer.

### Backend

Add or complete a safe aggregate endpoint, preferably:

`GET /api/moodle/automation/status`

The endpoint must return aggregate/status data only:

- whether an LTI session/context exists
- whether course id/context id is known
- whether teacher/user identity is known
- whether NRPS appears configured or available
- whether AGS appears configured or available
- whether Moodle Web Services appears configured as boolean only
- never return token values
- counts for imported domains when available:
  - participants
  - gradebook items
  - grades
  - logs
  - course sections
  - course tasks
- automation level per domain:
  - AUTO
  - SEMI_AUTO
  - BLOCKED
  - NOT_ALLOWED
- blockers in Hebrew
- next best action in Hebrew
- Teacher Release remains NO

### Frontend

Add a clear Hebrew RTL automation status view in an existing safe location or a new route if cleaner:

Preferred route:

`/automation-status`

The UI must show:

- what is already automatic
- what is semi-automatic
- what is blocked
- what source is needed next
- real navigation buttons only:
  - `/import`
  - `/gradebook-import`
  - `/logs-import`
  - `/course-structure-import`
  - `/tasks`
  - `/students`
  - `/grades`
  - `/missing-data`

### Navigation

Add one real navigation link to the automation status view from either sidebar/settings/missing-data. Do not clutter the dashboard home.

### Checks

Run:

```bash
node scripts/checks/moodle-automation-readiness-audit.cjs
npm run check
npm run build
npm run doctor
```

## Do not touch

- Participants import implementation
- Gradebook import implementation
- Logs import implementation
- Supabase schema migrations
- LTI launch
- `src/practiceTime.js`
- `STATE/teacher-release`
- Teacher Release gate

## Forbidden

- No fake data.
- No raw student rows.
- No token/secret values in any response.
- No invented Moodle APIs.
- No scraping passwords or cookies.
- No Teacher Release YES.
- Do not rewrite the app.

## PR rules

Open exactly one PR.

PR title:

`feat: Moodle Automation Status Center`

PR body must include:

- files changed
- checks passed
- what is now automatic
- what remains semi-automatic
- what remains blocked
- confirmation protected pipelines were not changed

Stop after opening PR. Do not merge.
