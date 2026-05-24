# 2026-05-24 — Auto Extraction Discovery + Source Router V1

**Branch:** feat/auto-extraction-discovery-source-router-v1
**Teacher Release:** NO (unchanged)
**Mode:** automation-first discovery, read-only, aggregate-only

## Purpose

First real automation-first layer. For the current Moodle/LTI context it
decides, per data domain, what automatic path is actually available, what is
blocked, and which real fallback import route applies. This is the bridge from
manual fallback toward maximum automatic extraction — without faking anything.

## What was built

### Core logic (typed contract)
- `src/lib/autoExtractionSourceRouter.ts` (new)
  - `buildAutoExtractionSourceMap(signals)` — pure routing over real signals.
  - Routes 12 domains: course_identity, teacher_identity, students_roster,
    teachers_roles, gradebook, logs, practice_time, course_structure,
    activity_completion, moodle_web_services, nrps, ags.
  - Levels: AUTOMATIC | AUTOMATIC_READY | SEMI_AUTOMATIC | BLOCKED | REFUSE.
  - Marker: MTH_AUTO_EXTRACTION_SOURCE_ROUTER_V1.

### Backend endpoint
- `GET /api/automation/auto-extraction/sources` (new, in src/server.js)
  - Gathers real signals only: LTI session, course/teacher identity,
    live NRPS/AGS claims (from lti13DiagnosticSessionsSnapshot), WS token
    configured + site-info live-verified flag, aggregate Supabase counts.
  - Returns sanitized metadata only. Safety block declares: read_only,
    no_secrets, no_token_values, no_raw_student_rows, no_raw_grade_rows,
    no_raw_logs, no_pii, teacher_release_remains_no.
  - teacher_release: "NO", teacher_release_ready: false — always.

### Frontend
- `src/components/AutoExtractionSourceRouterSection.tsx` (new)
  - Hebrew RTL section on /automation. Reads ONLY the new endpoint.
  - Shows: נשלף אוטומטית / מוכן לאוטומציה / ייבוא דוח אמיתי / חסום,
    next automation step, per-domain source + proving signal + missing +
    admin enablement + real fallback route link.
- `src/pages/Automation.tsx` — renders the new section after the status panel.

### Audit
- `scripts/checks/auto-extraction-source-router-audit.cjs` (new)
  - Enforces: module+endpoint+UI exist; safety flags present; blocked
    sources (WS/NRPS/AGS) guarded by live-signal conditions, not hard-coded
    AUTOMATIC; practice_time keeps refuse path with hasVerifiedDurationSource
    defaulting to false; UI does not import the base Truth Engine directly;
    Teacher Release never ready.
- `package.json` — adds `audit:auto-extraction-source-router`.

## How this advances maximum automatic extraction

- The app now KNOWS, per domain, the best available automatic source given the
  real current context, and routes accordingly.
- The moment Moodle exposes a real signal (WS token verified, NRPS/AGS claim
  in a live launch), the relevant domain automatically reclassifies from
  fallback/blocked to AUTOMATIC/AUTOMATIC_READY — no code change needed.
- Until then it honestly routes to the existing real import fallback.

## What is truly automatic now
- course_identity, teacher_identity (when launched from Moodle).

## What is only fallback now
- students_roster, teachers_roles, gradebook, logs, course_structure,
  activity_completion (real report import).

## What is blocked and why
- moodle_web_services: no verified MOODLE_WS_TOKEN + site-info not live-verified.
- nrps / ags: claims absent from the live launch.
- practice_time: no verified duration source — REFUSE (no synthetic compute).

## Protected pipelines NOT changed
- Participants / Gradebook / Logs / Course Structure import logic — untouched.
- LTI launch (1.1 / 1.3) — untouched.
- Supabase migrations — untouched.
- automationCapabilities.ts / governance / types — untouched.
- STATE/evidence-log.md — untouched.
- Teacher Release gate — remains NO.

## Checks passed (sandbox pre-verify, all green)
check, doctor, typecheck, build, audit:multi-teacher-safety,
audit:moodle-webservices-readiness, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router.
