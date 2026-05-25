# 2026-05-25 - Live Capability Probe V1

**Branch:** feat/live-capability-probe-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new CapabilityProbe page + route + dashboard link

## Purpose

The honest "truth table" page GPT and the proxy report pointed to as the right
step before PR 7. Instead of another pretty page, it shows EXACTLY what Moodle
gives us automatically right now, what is blocked, and what requires a Moodle
admin. It only reads the existing real /api/capabilities/status endpoint - no
guessing, no fake NRPS/AGS, teacher_release_ready stays false.

## What was built

- src/pages/CapabilityProbe.tsx (new): fetches /api/capabilities/status and
  renders a per-source truth table with Hebrew status badges
  (פעיל / חלקי / חסר / חסום / לא ידוע) for: LTI 1.1, LTI 1.3, NRPS, AGS,
  Moodle Web Services, gradebook (imported), logs (imported), manual report
  import. Each blocked/missing row shows "כדי להפעיל: ..." with the exact
  requirement (e.g. WS needs MOODLE_WS_TOKEN from a Moodle admin; NRPS/AGS
  need a live launch). A blockers section maps blocker_keys to Hebrew and
  links to /missing-data + /import. A footer states clearly that full auto
  extraction needs a Ministry-admin WS token or live NRPS/AGS, and that the
  system detects this automatically once enabled. A "בדוק שוב" button re-probes.
- src/App.tsx: import + <Route path="/capabilities" .../>.
- src/pages/Dashboard.tsx: a "בדיקת יכולות Moodle" link in the secondary menu.

## Truth / safety rules honored

- Reads only the real capability endpoint; never invents a capability.
- Never claims "connected"/"auto" when it is not; blocked is shown as blocked.
- States honestly that full automation depends on an external Moodle-admin
  token / live NRPS/AGS - the blocker is permission, not our code.
- teacher_release_ready stays false; no secrets surfaced.

## What was NOT touched

- src/server.js (capability endpoint read-only), useImports, Truth Engine,
  Governance - unchanged.
- LTI, Supabase, Auto Extraction Router, Teacher Release gate, PR 127 RLS
  draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
