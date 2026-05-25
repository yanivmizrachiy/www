# 2026-05-25 - Launch Home Frontend Fix V1 (deep fix)

**Branch:** feat/launch-home-frontend-fix-v1
**Teacher Release:** NO (unchanged)
**Scope:** ALL launch landing redirects -> home ("/")

## Purpose

PR #145 changed two server redirects but the tool STILL landed on /import.
Deep investigation found the real cause: multiple hardcoded "/import" landing
defaults across BOTH the server and the frontend bootstrap. This PR fixes every
one so opening the tool from Moodle lands on the home ("המודל החכם") with the
big navigation buttons.

## Root cause (all the places that forced /import)

1. src/server.js ~5022: the MAIN LTI 1.3 launch handler set
   `const nextPath = "/import"` (this was the active one for real launches).
2. src/pages/LtiBootstrap.tsx: the `next` fallback defaulted to "/import" in two
   places (missing param, and unsafe-path guard).
3. src/App.tsx: the /api/lti/launch rescue route did `Navigate to="/import"`.
(The two redirects fixed in PR #145 at ~3197/~3248 are secondary paths; this
PR completes the set.)

## What changed

- server.js ~5022: `nextPath = "/"` for the main LTI 1.3 launch.
- LtiBootstrap.tsx: both `next` fallbacks -> "/"; success message text changed
  from "מעביר אותך לייבוא הנתונים..." to "מעביר אותך למודל החכם...".
- App.tsx: rescue route -> `Navigate to="/"`.

The /import PAGE itself remains fully routed and linked - only the post-launch
LANDING target changed.

## Truth / safety rules honored

- Only landing-route targets changed; no auth/session/verification logic.
- node --check on server.js passed; doctor secret-scan passed.
- Teacher Release stays NO.

## What was NOT touched

- All other server.js logic, hooks, Truth Engine, the /import page - unchanged.
- LTI verification, Supabase, Auto Extraction Router, Governance, Teacher
  Release gate, PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
