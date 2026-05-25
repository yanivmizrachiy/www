# 2026-05-25 - Real Setup Page + Remove Dead Sites Stub V1

**Branch:** feat/real-setup-page-v1
**Teacher Release:** NO (unchanged)
**Scope:** turn the empty Setup stub into a real page; remove the dead Sites stub.

## Context (from the mega repo research)

Two pages were 2-line empty stubs. Setup (/setup) is a central landing page -
it's linked from the sidebar, from the "סיים סשן" button, and from the
/install /auth /login /signup redirects - but showed only an empty title. Sites
(/sites) was an orphan route, not linked anywhere after the nav trim.

## What changed

- src/pages/Setup.tsx: rebuilt as a real, useful page - shows the live
  connection status (from the LTI session: connected vs not, with the real
  course/teacher/role when present) and clear 3-step Hebrew instructions for
  opening the tool from inside Moodle, plus the Moodle server name when known.
  No demo, no password, real session data only.
- src/App.tsx: /sites now redirects to "/" (was a dead stub); removed the Sites
  import.
- Deleted src/pages/Sites.tsx (dead 2-line stub, no inbound links).

## Truth / safety rules honored

- Setup shows only real session/site values; "לא מחובר" state when no session.
- Sites deletion staged so repo-doctor (which reads git ls-files) stays green.
- No server, Truth Engine, auth, or governance changes.
- Teacher Release stays NO.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
