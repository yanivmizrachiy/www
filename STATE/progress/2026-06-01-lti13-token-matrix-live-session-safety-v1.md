# 2026-06-01 - LTI 1.3 Token-Matrix Live-Session Safety V1

**Branch:** fix/lti13-token-matrix-live-session-safety-v1
**Teacher Release:** NO (unchanged)
**Scope:** fix an undefined-variable bug in the LTI 1.3 token-matrix diagnostic
endpoint and confirm its safety posture (no secrets/tokens/keys returned).

## Context

`GET /api/lti13/token-matrix` is a diagnostic endpoint that probes the Moodle
token endpoint with multiple client-credentials JWT variants and reports which
variant succeeds. Inside its `try` block it referenced `liveSession` (to prefer
the live launch's client id / deployment id over env values) but never defined
`liveSession` in that scope. The only `liveSession` definitions in the file are
local `const`s inside other handlers, so this endpoint would throw
`ReferenceError: liveSession is not defined` on every call. The error was caught
by the endpoint's own try/catch and returned as `TOKEN_MATRIX_FAILED`, so the
diagnostic could never actually run to completion or honor a live session.

## What changed

- src/server.js: in the `GET /api/lti13/token-matrix` handler, added a local
  definition `const liveSession = importSessionFromRequest(req) || sessionFromRequest(req);`
  at the top of the `try` block, matching the exact pattern already used by the
  status/preview handlers in the same file. This resolves the undefined
  reference so the endpoint runs and correctly prefers the live launch's client
  id / deployment id, falling back to env values when no live session exists.

No other logic was changed. The probing variants, signing, discovery, and the
response shape are untouched.

## Safety / privacy behavior (verified by reading code)

The endpoint already returned only safe values; this fix does not weaken that:

- `client_id`, `deployment_id`, the private key (`LTI13_PRIVATE_KEY_PEM`), and
  the signed `client_assertion` are used internally for JWT signing only and are
  never placed in the response.
- Per-variant results expose `got_access_token` as a boolean only; `body_preview`
  is forced to `null` whenever an `access_token` is present, so a token can never
  leak through the error/body preview path.
- The response carries an explicit privacy block:
  `no_access_token_returned`, `no_private_key_returned`,
  `no_client_assertion_returned`, `no_student_names_returned`,
  `no_save_performed` — all true. The not-configured and error branches assert
  `no_secrets_returned` / `no_tokens_returned` / `no_save_performed`.

Because the endpoint already returns booleans/statuses only and no sensitive
values, no additional dev-only gating was required to make it safe.

## Not touched

- LTI launch flow / session behavior beyond defining the local `liveSession`.
- NRPS token/membership sync, server-owned roster sync, student sync behavior.
- Supabase schema/RLS, production SQL, env/secrets, Render, render.yaml.
- Teacher Release gate, PR #127, manual import fallback, evidence logs.
- The leftover unused `deploymentIdForAssertion` local in this handler was left
  as-is to keep the fix minimal; it is not a safety issue (never returned).
- Unrelated UI and other endpoints.

## Checks

node --check src/server.js (PASS), check (PASS), build (PASS), doctor (PASS),
typecheck (4 pre-existing errors only, all in src/pages/GradebookImport.tsx,
unrelated to this change — confirmed present on clean main; no new errors from
src/server.js), audit:moodle-automation, audit:automation-capabilities,
audit:automation-capability-contract, audit:automation-evidence-log,
audit:auto-extraction-source-router, audit:multi-teacher-isolation-evidence,
audit:supabase-rls-isolation-readiness (all PASS).

## Live Moodle check (must be done by a human, לא אומת here)

Call `GET /api/lti13/token-matrix` from a live LTI 1.3 launch and confirm it
returns a JSON matrix (no longer `TOKEN_MATRIX_FAILED` from the undefined
reference), that no `access_token` / private key / `client_assertion` appears in
the response, and that the privacy block flags are all true.

## Progress

Teacher Release remains NO. PR 11 complete (token-matrix live-session safety
bug fix). Live Moodle verification of the endpoint output is the remaining human
gate; `לא אומת` until run on real Moodle.
