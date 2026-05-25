# 2026-05-25 - Premium Home "המודל החכם" V1

**Branch:** feat/premium-home-smart-model-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - Dashboard hero redesign + rebrand to "המודל החכם"

## Purpose

Yaniv asked for a premium, luxury home page named "המודל החכם", with the space
and teacher name shown prominently at the top, comfortable buttons, and
everything real (no demo). Also: NRPS privacy was switched to "תמיד" in the
real Moodle tool, so the teacher name now arrives in the launch (confirmed:
header now shows the real teacher name instead of just "teacher").

## What changed

- src/pages/Dashboard.tsx: hero redesigned - title is now "המודל החכם" with a
  refined subtitle; the teacher, space, and last-updated are presented as
  labeled premium cards (label + value) instead of flat strings; connection
  badge dot is emerald when connected / amber when not. All values come from
  the real session + imports-overview (no demo).
- src/components/AppSidebar.tsx: brand text "Teacher Hub" -> "המודל החכם".
- index.html: page <title> -> "המודל החכם".

## Truth / safety rules honored

- Pure presentation. teacherName/courseName/counts still come from the real
  session and imports-overview; "—" when absent. No demo, no fake values.
- No data paths, endpoints, or Truth Engine touched.
- Teacher Release stays NO.

## What was NOT touched

- server.js, hooks (read-only), Truth Engine, all routes/pages logic - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
