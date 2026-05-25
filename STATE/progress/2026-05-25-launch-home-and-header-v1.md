# 2026-05-25 - Launch Lands on Home + Smart Header V1

**Branch:** feat/launch-home-and-header-v1
**Teacher Release:** NO (unchanged)
**Scope:** LTI launch landing route + AppLayout header (display)

## Purpose

Yaniv observed that opening the tool from Moodle landed on the IMPORT page
(big "ייבוא משתתפים") instead of the "המודל החכם" home with the big navigation
buttons (participants / activities / grades). He also asked that the space name
and teacher name appear cleanly in the top header. This PR fixes both.

## What changed

- src/server.js (2 lines only): both LTI launch redirects (1.1 at the canonical
  endpoint, and 1.3 after a successful launch) now send next="/" (the home /
  "המודל החכם" dashboard) instead of next="/import". No auth, session, or
  verification logic touched - only the post-launch landing route.
- src/components/AppLayout.tsx: top header now shows the space title with a book
  icon and the teacher name + Hebrew role with a user icon, visible on mobile
  too (was hidden under sm). Clean, labeled, real values from the session.

## Truth / safety rules honored

- Landing-route change only; the dashboard already shows real counts and "—"
  when empty. No demo, no fake state.
- Header shows real session values (course_title, moodle_username, role via
  hebrewRoleLabel); "—"/placeholder when absent.
- node --check on server.js passed; doctor secret-scan passed.
- Teacher Release stays NO.

## What was NOT touched

- All other server.js logic (auth, session, NRPS, imports), hooks, Truth Engine
  - unchanged.
- LTI verification, Supabase, Auto Extraction Router, Governance, Teacher
  Release gate, PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
