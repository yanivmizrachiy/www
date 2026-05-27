# 2026-05-27 - Clean Developer Jargon from Teacher View V1

**Branch:** feat/clean-teacher-jargon-automation-v1
**Teacher Release:** NO (unchanged)
**Scope:** Yaniv saw developer jargon on the automation page (e.g.
core_enrol_get_enrolled_users, MOODLE_WS_TOKEN, "Web Services status", "Render",
"token", "scope") and asked that the app have no such labels. This translates
that jargon to plain Hebrew at the DISPLAY layer only.

## What changed

- src/components/AutoExtractionSourceRouterSection.tsx:
  - New plainHe() display helper maps technical phrases to plain Hebrew, e.g.
    core_enrol_get_enrolled_users -> "שליפת רשימת תלמידים",
    MOODLE_WS_TOKEN -> "הרשאת חיבור אוטומטי",
    Web Services -> "חיבור אוטומטי", AGS -> "שירות הציונים של Moodle",
    NRPS -> "רשימת המשתתפים של Moodle", token -> "הרשאה", Render -> "השרת".
  - Applied plainHe() to the rendered fields: provingSignalHe, whatIsMissingHe,
    adminEnablementHe, the four summary boxes, and the next-step line.

## Why this is safe

- DISPLAY layer only. The Truth Engine (automationCapabilities.ts,
  autoExtractionSourceRouter.ts, server.js) is unchanged - all capability
  statuses, levels, and logic stay exactly the same. The audits
  (automation-capabilities, automation-capability-contract,
  auto-extraction-source-router, automation-evidence-log) all still pass,
  proving the truth logic was not altered.
- No status is faked or hidden; a blocked capability still shows as blocked,
  just described in language a teacher understands.

## Important finding (for the data-automation plan)

Yaniv's screenshots confirmed: MOODLE_WS_TOKEN is not configured, so Web
Services automatic extraction (grades/activity/chapters beyond NRPS) is BLOCKED
until the Ministry provides a real Web Services token. NRPS (students) is the
only automatic source today. This makes manual import the honest fallback for
grades/logs until a token exists.

## Truth / safety rules honored

- No Truth Engine / capability logic changes; no server/auth/LTI changes.
- Does not touch NRPS auto-sync (#170), scoped counts (#159), source-status
  panel (#171), or the fullscreen/back-nav work (#172).
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
