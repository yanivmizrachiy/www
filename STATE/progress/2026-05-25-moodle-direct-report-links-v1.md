# 2026-05-25 - Moodle Direct Report Links V1

**Branch:** feat/moodle-direct-report-links-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new helper + MissingData.tsx

## Purpose

Safe interim PR (while PR 7 live automation is gated on a Ministry WS token).
Based on a verified manual inspection of a real Ministry Moodle course (259 on
moodlemoe.lms.education.gov.il), which confirmed the teacher-accessible report
and export endpoints that exist in every Moodle space. This PR turns the
manual import fallback into ONE CLICK: it gives the teacher direct deep links
to the exact Moodle reports for THEIR course, built from the live session.

## What was built

- src/lib/moodleReportLinks.ts (new): builds the exact Moodle report/export
  URLs from the live session course_id + real Moodle base URL (site_url).
  Reports covered (all teacher-accessible, verified): participants list,
  grade export CSV, grade export ODS, activity-completion (progress), logs,
  outline (views/last access), participation. normalizeMoodleBase() and
  buildMoodleReportUrl() guard against missing base/courseId.
- src/pages/MissingData.tsx: new "קישורים ישירים לדוחות Moodle שלך" section.
  When the session has a real course_id + base URL, it shows per-report cards
  with "פתח ב-Moodle" (opens the exact report in a new tab) + "העלה לכאן"
  (links to the matching app import). When there is no live session, it shows
  an honest message that links appear after launching from Moodle.

## Truth / safety rules honored

- The app NEVER scrapes these URLs, never stores credentials, never auto-fetches.
  They are deep links the teacher clicks; the teacher stays in control.
- Links are built only from the REAL session (course_id) and REAL Moodle base
  URL (site_url). No hardcoded course, no invented URLs. If either is missing,
  no links are shown.
- No claim of automation. Manual import remains the fallback; this just makes
  it one click. Teacher Release stays NO.

## What was NOT touched

- useImports parser/hooks, useLtiSession (read-only), server.js, Truth Engine -
  unchanged. No WS token, no scraping, no live-automation claim.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
