# 2026-06-01 - Install Check Page V1

**Branch:** feat/install-check-page-v1
**Teacher Release:** NO (unchanged)
**Scope:** add a live, safe install/readiness check page at /install-check for a
new Moodle course/space.

## Context

When the tool is installed in a new Moodle space a teacher needs a quick, safe way
to confirm the space is ready for automatic student sync (LTI 1.3 + NRPS) before
relying on it. This PR adds a read-only readiness page that consumes only the
existing safe diagnostics endpoint and a safe count, and tells the teacher in
Hebrew whether the space is ready or still on the old LTI 1.0/1.1 tool.

## What changed

- src/pages/InstallCheck.tsx (new): reads ONLY the safe
  /api/lti13/participants-breakdown endpoint plus the safe students_count from
  /api/imports/overview (useImportsOverview). Shows boolean checks and counts:
  opened from Moodle, LTI version, NRPS claim exists, known Client ID, known
  Deployment ID, token request works, membership request works, total
  participants, learners, instructors, unknown, and whether a roster sync is
  saved/available. No raw student rows, no names, no emails, no person IDs, no
  tokens, no secrets.
  - If no live LTI 1.3 session / NRPS claim: shows the Hebrew message
    "זה הכלי הישן. תלמידים אוטומטיים דורשים LTI 1.3 + NRPS."
  - If a live LTI 1.3 + NRPS session is present: shows the Hebrew message
    "הכלי מוכן לסנכרון תלמידים במרחב הזה."
  - Unverified states render as "לא אומת", never "עובד".
- src/App.tsx: added the /install-check route (existing /setup is unchanged).
- src/pages/Setup.tsx: added a single minimal discoverable link to /install-check
  (no sidebar entry, no clutter), consistent with the existing setup layout.

## Not touched

- LTI launch flow, NRPS token/membership logic, server-owned sync behavior.
- src/server.js (no new or changed endpoints — page reuses existing safe ones).
- Supabase schema/RLS, production SQL, env/secrets, Render, render.yaml.
- Teacher Release gate, PR #127, manual import fallback, evidence logs.
- Student sync behavior — unchanged, so the 216 synced learners are not affected.
- Unrelated pages and the sidebar.

## Privacy behavior

The page never requests or renders person-level data. It consumes only the
boolean/count/diagnostics fields of participants-breakdown (whose server response
already strips emails, raw IDs, names, tokens, and performs no save) and the
students_count from imports/overview. Client ID, Deployment ID, course id/title
and resource link id are installation/context diagnostics already available in the
app session and are safe to display.

## Install-check behavior

- Verdict banner: green "LTI 1.3 + NRPS" + ready message when a live 1.3 session /
  NRPS claim is present; amber old-tool message when only a non-1.3 session or no
  NRPS claim is detected; neutral "לא אומת" when state cannot be determined.
- Per-check rows show ok / fail / unknown(לא אומת). token/membership are marked
  fail only when the endpoint reports stage "token"/"membership" respectively.
- Counts section renders only when the breakdown is live (ok), otherwise "לא אומת".

## Live Moodle check (must be done by a human, לא אומת here)

1. Open the tool from a NEW course configured with LTI 1.3 + NRPS → confirm the
   green "הכלי מוכן לסנכרון תלמידים במרחב הזה." message and real counts.
2. Open the tool from an old LTI 1.0/1.1 course → confirm the amber
   "זה הכלי הישן..." message and no counts.

## Why this does not break the 216 synced learners

This PR adds a read-only page that reuses existing safe endpoints. It does not
touch the NRPS sync path, the learners table, or any write logic, so the existing
216 synced learners are unaffected.

## Checks

node --check src/server.js, check, build, doctor, typecheck,
audit:moodle-automation, audit:automation-capabilities,
audit:automation-capability-contract, audit:automation-evidence-log,
audit:auto-extraction-source-router, audit:multi-teacher-isolation-evidence,
audit:supabase-rls-isolation-readiness.

## Progress

Teacher Release remains NO. PR 12 (install-check page) complete.
Estimated overall progress: ~96% (live Moodle verification on a real new 1.3 space
is the remaining human gate; `לא אומת` until run on real Moodle).
