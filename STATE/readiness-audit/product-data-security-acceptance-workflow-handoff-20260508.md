# Product data, security, acceptance and workflow handoff — 2026-05-08

## Purpose

This document extends the Moodle Teacher Hub handoff with product/data rules that must guide the next work. It is documentation only and does not prove any runtime capability.

## Chapter 36 — Data model the system must manage

The product must be built around real entities, not only screens.

Core entities:

### Teacher

- Moodle user identifier.
- Teacher name when received.
- Roles.
- Platform issuer.
- Client/deployment context.

### Course / Moodle space

- Course/context identifier.
- Course title.
- Moodle issuer.
- Deployment context.
- Source: LTI 1.0/1.1 or LTI 1.3.

### Student

- Moodle identifier.
- Full name.
- Email only if available and allowed.
- Group/class when available.
- Source: NRPS or Participants import.
- Last updated timestamp.

### Activity

- Student.
- Task/activity.
- Timestamp.
- Action.
- Source: Logs, API, or another verified source.
- Course/context.

### Daily Practice Summary

- Student.
- Date by Asia/Jerusalem.
- Time in minutes.
- Readable Hebrew duration.
- Event count.
- First event time.
- Last event time.
- Source: official duration, calculated from logs, or missing.

### Grade

- Student.
- Task.
- Grade.
- Maximum grade when available.
- Attempt.
- Date.
- Source: AGS or Gradebook import.

### Task

- Moodle identifier when available.
- Task name.
- Chapter/topic.
- Activity type.
- Real link when available.
- Data source.

### Import Batch

- Report type.
- Import timestamp.
- Row count.
- Valid row count.
- Rejected row count.
- Errors.
- File/source description without private data.
- Course/context.

## Chapter 37 — Privacy, security and secrets

The project handles student data, so privacy rules are mandatory.

Never commit to GitHub:

- Real student names.
- Real grades.
- Moodle reports containing private data.
- CSV/XLSX files with student data.
- API keys.
- Private keys.
- Shared secrets.
- Service-role keys.
- Render operational credentials.

Allowed in GitHub:

- Code.
- Documentation.
- General schema design.
- Empty examples.
- Evidence without personal data.
- Technical status true/false.
- Checked endpoint names.
- Dates/times.
- Commit hashes.

Evidence must not contain student private data or secret values. If student data must be stored, it must be stored only in a secured database with teacher/course isolation, not in Git.

## Chapter 38 — Moodle/LTI permissions to understand

Do not confuse permission types:

- LTI launch: gives login/context/roles, not necessarily students or grades.
- NRPS / Names and Roles: intended source for participants/students.
- AGS / Assignment and Grade Services: related to line items and grades; writing grades must be treated carefully.
- Moodle Web Services: wider API only if a real verified token exists.
- Manual reports: real fallback data exported/copied by the teacher from Moodle.

Key distinction:

```text
NRPS = participants/students
AGS = grades/assignments
LTI launch = entry/context
Web Services = broader API only with token
Manual import = real reports from Moodle
```

## Chapter 39 — Acceptance tests: when a capability may be called working

A capability is working only with real evidence.

### LTI 1.3 configured

Working only if the live status endpoint returns configured=true, all required environment checks pass, deployment is active, and there are no missing configuration keys.

### NRPS

Working only if a fresh Moodle LTI 1.3 launch occurs, services-status shows a live session with NRPS, a real membership URL exists, a service authorization request succeeds, a real membership response is received, and evidence is documented.

### Students

Working only if a real student list comes from NRPS or a verified Participants import, appears in the Students screen, has a clear source, and contains no demo students.

### Grades

Working only if real AGS data or a verified Gradebook import exists, grades appear in a table, and averages are computed only from existing data.

### Daily practice time

Working only if official duration or real logs exist, the calculation is documented, and the UI labels the source as official, calculated, or missing.

### Reports

Working only if based on real data, displayed correctly, and any export has been tested in practice.

## Chapter 40 — Teacher use cases

### First launch

Teacher opens the tool inside Moodle and sees course name, connection status, available data, missing data, and recommended next action.

### NRPS available

The app detects NRPS, fetches real participants, and displays real students.

### NRPS unavailable

The app explains that teacher/course were identified but student permission/data was not received, and recommends importing a real Participants report.

### Daily report

Teacher chooses a date and sees per-student activity, event count, tasks, and data status.

### Inactive students

Teacher filters students who did not work today based only on real data.

### Struggling student

The system helps surface low scores, low activity, missing tasks, or gaps, without pretending to diagnose the student.

## Chapter 41 — Manual import process

Manual import must work as follows:

1. Teacher exports/copies a real Moodle report.
2. Teacher uploads a file or pastes a table.
3. System detects report type.
4. System detects columns.
5. System shows preview.
6. System marks errors.
7. Teacher confirms.
8. System saves.
9. System displays how many rows were accepted/rejected and what is missing.
10. Relevant screen updates.

Priority:

1. Participants.
2. Gradebook.
3. Logs.
4. Activity Completion.

Do not continue to advanced reports before Participants works end-to-end.

## Chapter 42 — Activity-time calculation rules

Activity time is sensitive and must be transparent.

Rules:

1. If official duration exists, use it.
2. If logs exist, calculate session windows only from real timestamps.
3. A single event must not become a fake long duration.
4. Large gaps between events must not be counted automatically without a documented session-timeout rule.
5. Daily totals must use Asia/Jerusalem.
6. Distinguish zero minutes from missing data and from not calculable.
7. UI must say one of: official time, calculated from logs, or insufficient data.

## Chapter 43 — Important repository files

Files to know:

```text
package.json
src/server.js
src/main.tsx
src/yaniv-premium-ui.css
vite.config.ts
README.md
PROJECT_RULES.md
STATE/project-status.md
STATE/evidence-log.md
STATE/readiness-audit/
scripts/fix-lti-routing-redirect-cache.cjs
scripts/add-lti13-readiness.cjs
```

Do not ignore the scripts. Before changing `src/server.js`, understand that scripts may patch or verify routing/readiness during check/build/start flows.

## Chapter 44 — Permanent check commands

Repository checks:

```bash
cd ~/www || exit 1
git status -sb
git log --oneline -8
```

Build/check:

```bash
npm run check
npm run build
```

Runtime checks:

```bash
curl -sS --max-time 20 https://www-tijc.onrender.com/health
curl -sS --max-time 20 https://www-tijc.onrender.com/api/lti13/status | head -c 3000
curl -sS --max-time 20 https://www-tijc.onrender.com/api/lti13/services-status | head -c 4000
```

If an API endpoint returns `<!doctype html>`, route order is broken. If services-status returns its JSON mode, route order is correct.

## Chapter 45 — Past mistakes not to repeat

- Do not restore manualChunks without deep testing; it caused a browser runtime failure.
- Do not place API routes after React fallback.
- Do not look for LTI sessions only in the wrong store; check live token/session maps.
- Do not paste explanations into PowerShell; paste code only.
- Do not ask for API keys in chat.
- Do not conclude NRPS is absent before opening the tool from Moodle and checking services-status.
- Do not confuse missing data with zero activity.
- Do not break the existing LTI 1.0/1.1 route.
- Do not return to Supabase Gateway as active route without verified OAuth/signature handling.
- Do not request the same Moodle screenshots if endpoints can answer the question.

## Chapter 46 — What to show to the teacher and what to hide

Show to the teacher:

- Connected/not connected.
- Course name.
- Teacher name.
- Data source.
- Students, grades, and activity only when available.
- What is missing.
- Recommended next action.

Hide from the teacher:

- Private keys.
- API keys.
- Raw tokens.
- Render secrets.
- Long stack traces.
- Confusing internal technical errors.
- Data from another course/teacher.

Developer diagnostics may show issuer, deployment/client context, has_nrps, has_ags, configured true/false, and missing key names, but not secret values.

## Chapter 47 — Capability color/status model

- Green: works and verified by evidence.
- Orange: partial; infrastructure exists but not fully verified.
- Red: blocked by missing permission/configuration/data.
- Gray: planned; no verified implementation/data yet.

Current capability status:

- LTI 1.0/1.1: green/partial; exists and must be preserved.
- LTI 1.3 endpoints: orange-green; exist and partly verified.
- Render LTI 1.3 configuration: red/orange; configured=true not verified.
- NRPS: orange; claim may have appeared, fetch not implemented.
- AGS: gray/orange; possible detection, not implemented.
- Automatic students: red; not working yet.
- Manual import: orange; UI exists, end-to-end not verified.
- Daily practice time: gray/red; central requirement, not implemented.
- Reports: gray/orange; planned and data-dependent.
- Export: gray; do not approve until tested.

## Chapter 48 — Mandatory work order

1. Verify git status.
2. Verify governance documentation.
3. Update STATE if missing.
4. Check LTI 1.3 status endpoint.
5. Finish Render LTI 1.3 configuration if missing.
6. Open Moodle LTI 1.3.
7. Check services-status.
8. If NRPS exists, implement service authorization.
9. Fetch real participants.
10. Show real students.
11. Document evidence.
12. Only then continue to grades.
13. Only then continue to logs/time.
14. Only then continue to reports.
15. Only then continue to exports.

Do not jump to reports before real students and real data exist.

## Chapter 49 — Correct status text for the app

Good text examples:

- החיבור ל־Moodle פעיל, אך עדיין לא התקבלה רשימת תלמידים.
- NRPS זוהה, אך טרם בוצעה משיכת משתתפים.
- חסרים משתני Render עבור LTI 1.3.
- יש נתוני לוגים, ולכן זמן הפעילות מחושב ואינו משך רשמי.
- אין מספיק נתונים לחישוב זמן תרגול.
- ציונים עדיין לא זמינים. יש להפעיל AGS או לייבא Gradebook אמיתי.

Forbidden text:

- הנתונים נטענו בהצלחה, when they did not.
- 0 דקות, when there is no data.
- התלמידים סונכרנו, when no real roster fetch occurred.
- הציונים מחוברים, when no AGS/Gradebook data exists.
- מוכן לשימוש מלא, when not verified.

## Chapter 50 — Most important reminder

This project is not only a technical Moodle connection.

It must become a real teacher product that helps answer:

- Who worked?
- Who did not work?
- How long did students work?
- Who is struggling?
- Which tasks are missing?
- Where is the class stuck?
- Which report can be exported or printed?
- What data is missing?

Every feature must serve the teacher, but never at the expense of truth.

Truth before convenience.
Real data before design.
Maximum automation, only when real.

## Status

Documentation-only handoff extension. No runtime code changed. No secrets added. No new capability is proven by this file.
