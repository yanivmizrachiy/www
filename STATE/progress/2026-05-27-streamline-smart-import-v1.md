# 2026-05-27 - Streamline Smart Import With Direct Moodle Links V1

**Branch:** feat/streamline-smart-import-v1
**Teacher Release:** NO (unchanged)
**Scope:** Yaniv wants data to load with as little manual effort as possible.
Since Web Services (full auto-extraction of grades/tasks/logs) is BLOCKED until
the Ministry provides a token (MOODLE_WS_TOKEN is not configured - confirmed by
the teacher's own screenshot), manual import is the honest path for those. This
makes that path one-click instead of a multi-step hunt.

## Why not just auto-fetch grades?

Investigated: the server only DETECTS the AGS/NRPS claims; it has no AGS grade
fetch implemented (would require full OAuth2 token exchange + lineitems/scores
APIs), and there is no evidence the live launch even exposes AGS scopes. NRPS
(students) is the only confirmed automatic source. Building AGS fetch blind
would be high-risk and possibly irrelevant. The certain, high-value win is to
make the manual import nearly effortless.

## What changed

- src/pages/SmartImport.tsx:
  - Pulls the live course context (course_id + Moodle base) from useLtiSession.
  - Replaced the verbose "how to get the files" paragraph (which sent the
    teacher off to another page) with a grid of DIRECT one-click links to the
    teacher's own Moodle reports (participants, grades CSV/ODS, activity
    completion, logs, outline, participation), built via the existing
    buildMoodleReportUrl + MOODLE_REPORTS library.
  - Each link opens the exact report in the teacher's real Moodle (new tab);
    they download there and drag the file back. One click instead of navigating
    to "מה חסר" first.
  - Graceful fallback text when course context is missing (tool opened outside
    Moodle).

## Truth / safety rules honored

- No scraping, no stored credentials, no "auto-fetched" claim - these are deep
  links to the teacher's OWN Moodle that they click themselves.
- No invented data; links only render when a real course_id + base exist.
- Pure presentation; no Truth Engine, capability, or server changes.
- Does not touch #170-#178 flows.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
