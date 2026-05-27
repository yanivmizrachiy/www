# 2026-05-27 - Auto-Sync With LTI Token V1

**Branch:** feat/auto-sync-with-token-v1
**Teacher Release:** NO (unchanged)
**Scope:** root-cause fix - the dashboard auto-sync (#170) and manual sync
button were silently failing with 401 in cross-site iframe contexts because
session cookies (SameSite restrictions) were not reaching the server.

## Live evidence

Yaniv reported that after a recent refresh, the dashboard returned to showing
0 students even though NRPS-preview still showed the teacher's name correctly
in the header. The pattern: NRPS-preview works (no session required - uses
LTI service tokens server-side), but POST /api/imports/nrps-sync requires
importSessionFromRequest, which returns 401 when the session cookie does not
arrive (third-party cookie blocking in the Moodle iframe). The .catch(() => {})
silently swallowed the 401, leaving the dashboard at 0.

## Root cause

The auto-sync and manual sync POST used only credentials: "include", relying on
the session cookie. In a cross-site iframe (Moodle -> our app), modern browsers
often block third-party cookies, so the cookie is dropped and the request
arrives unauthenticated.

PR #167 already solved this for Smart Import by sending the LTI token in the
request body. importSessionFromRequest checks body.token FIRST (before falling
back to the cookie), so adding the token guarantees authentication regardless
of cookie policy.

## What changed

- src/pages/Dashboard.tsx:
  - Imported getLtiToken from useLtiSession.
  - Auto-sync POST now also includes the LTI token in the JSON body:
    body: JSON.stringify({ students: named, ...(ltiToken ? { token: ltiToken } : {}) })
  - Manual "סנכרן מרחב" POST got the same fix - it had the same bug.

## Truth / safety rules honored

- No data invented; server still skips instructors and persists only real named
  learners, space-isolated.
- No Truth Engine, capability, auth, or governance logic changed; only the
  request adds the token already used elsewhere.
- Does not touch #170/#171/#172/#173/#174 logic; this is a follow-up fix to the
  same auto-sync flow.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
