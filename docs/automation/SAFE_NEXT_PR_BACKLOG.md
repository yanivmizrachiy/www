# Safe Next PR Backlog

Updated: 2026-05-24  
Teacher Release: **NO**

This file lists the next safe, bounded PRs in priority order.
Each PR is atomic, reversible, and has explicit safety checks.

---

## PR #1 (HIGHEST PRIORITY) — Course Structure Backend Endpoint

**Goal:** Implement the missing `/api/import/course-structure` POST endpoint in `src/server.js`.

**Why it's highest priority:**
- The import page (`/course-structure-import`) already exists
- The frontend already sends data
- The only missing piece is the backend handler
- This unblocks Activity Completion and Course Structure data pipeline
- The automation audit currently marks this as `BLOCKED`

**Files to change:**
- `src/server.js` — add POST `/api/import/course-structure` handler with Supabase write
- `STATE/progress/YYYY-MM-DD-course-structure-endpoint.md` — evidence

**Safety checks:**
- No touch to Participants / Gradebook / Logs import
- No Supabase migration (uses existing `chapters` / `completionRows` tables or equivalent)
- No Teacher Release change
- No fake data

**Audits to run:**
```bash
npm run check
npm run doctor
npm run typecheck
npm run audit:multi-teacher-safety
npm run audit:moodle-automation
```

---

## PR #2 — UI Date Format `D/M/YY`

**Goal:** Display all dates in the UI as `D/M/YY` (e.g. `5/3/26`).

**Scope:** UI display only. No DB, API, logs, STATE, JSON changes.

**Files likely to change:**
- `src/pages/Students.tsx`
- `src/pages/Grades.tsx`
- `src/pages/ActivityPage.tsx`
- `src/pages/LogsImport.tsx`
- `src/pages/GradebookImport.tsx`
- `src/pages/StudentProfile.tsx`
- Any component that formats dates for display

**Implementation:** Add a shared `formatDateUI(dateString: string): string` utility in `src/lib/` using `Intl.DateTimeFormat` or simple string split.

**Safety:** Pure display change. No data change.

---

## PR #3 — Clickable Teacher Name → Teacher Profile Screen

**Goal:** Make the teacher name on the Dashboard clickable. Click opens a teacher profile screen showing only real LTI/session data.

**Files:**
- `src/pages/Dashboard.tsx` — wrap teacher name in `<Link to="/teacher-profile">`
- `src/pages/TeacherProfile.tsx` — new page showing: name, username, role, course context from session
- `src/App.tsx` — add `/teacher-profile` route

**Rules:**
- Only show fields that actually exist in the session
- If field is missing — show "—" not invented value
- No fake teacher data

**Audits to run:**
```bash
npm run check
npm run typecheck
npm run doctor
```

---

## PR #4 — Teachers List per Space

**Goal:** Button "מורים" opens a list of teachers for the current space only.

**Source of truth:** LTI session only (current teacher). NRPS if available in future.

**Display when NRPS missing:**
```
מורה נוכחי: [שם מורה]
הערה: רשימה מלאה דורשת NRPS — כרגע חסר.
```

**Files:**
- `src/pages/Teachers.tsx` — new page
- `src/App.tsx` — add `/teachers` route
- `src/components/AppSidebar.tsx` — add nav link

**Rules:**
- Only show current teacher from session
- No invented teachers
- Explain what's missing and why

---

## PR #5 — Student List Privacy Guard

**Goal:** Ensure the student list page shows ONLY name. No TZ, no email, no external IDs in the simple list view.

**Files:**
- `src/pages/Students.tsx` — audit columns shown, remove any TZ/email/external ID from list
- Detailed fields (email, external ID) remain accessible only in `StudentProfile.tsx` view

**Note:** This is a safety/privacy hardening PR, not a new feature.

---

## PR #6 — Missing Data Page Improvements

**Goal:** The `/missing-data` page should list each missing capability with a clear Hebrew explanation and a direct action link.

**Each item should show:**
- What's missing
- Why it's needed
- How to get it (upload report / wait for admin / not yet possible)
- Link to the import page if applicable

**Files:**
- `src/pages/MissingData.tsx`

---

## PR #7 — Practice Time UI Copy Fix

**Goal:** When practice time is blocked (`NO_DURATION_FIELD`), the UI shows:

```
לא ניתן לחשב זמן מצטבר ללא מקור משך מאומת
```

Currently the message may not be clear enough in all screen contexts.

**Files:**
- `src/pages/ActivityPage.tsx`
- `src/components/PracticeTimeSection.tsx`

---

## PR #8 — Moodle WS Readiness UI

**Goal:** Show the Moodle Web Services readiness status in the Automation page UI.

The endpoint already exists (`/api/automation/moodle-webservices/readiness`).
The UI should fetch it and display a clear Hebrew status card.

**Status display:**
- `missing_env` → "Web Services לא מוגדרים. נדרשת פעולת מנהל."
- `invalid_token` → "Token שגוי. בדוק את ההגדרות ב-Render."
- `blocked_by_admin_enablement` → "Web Services כבויים ב-Moodle. נדרשת פעולת מנהל."
- `verified_site_info` → "✓ Web Services מחוברים ומאומתים."

**Files:**
- `src/pages/Automation.tsx` — add WS readiness card
- No server.js changes (endpoint already exists)

---

## What NOT to do in these PRs

- No Supabase migrations unless strictly required and reviewed
- No LTI launch changes
- No Participants / Gradebook / Logs import changes
- No Teacher Release YES
- No fake/demo data
- No secrets in code or GitHub

---

## Running all audits before any PR

```bash
npm run check
npm run build
npm run doctor
npm run typecheck
npm run audit:moodle-automation
npm run audit:moodle-webservices-readiness
npm run audit:multi-teacher-safety
npm run audit:deep-launch-context
npm run audit:lti-probes
```
