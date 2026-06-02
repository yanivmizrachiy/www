# 2026-06-01 - LTI 1.3 Registration Admin Report V1

**Branch:** feat/lti13-registration-admin-report-v1
**Teacher Release:** NO (unchanged)
**Scope:** when an unknown client_id/deployment_id launches LTI 1.3, do not
auto-approve; return a safe diagnostic report useful for updating the admin
allowlist.

## Context

The LTI 1.3 launch handler (`/api/lti13/launch` in `src/server.js`) verifies the
id_token signature, then verifies core claims via `lti13VerifyCoreClaims`. That
function matches the incoming `client_id`/`deployment_id` against a trusted
allowlist (built-in primary-env + the imported course pair + any
`LTI13_ALLOWED_REGISTRATIONS` env entries). If the registration is not matched,
`claimVerification.ok` was false and the handler returned the full
`claim_verification` object — which included `expected.registrations`, i.e. the
entire trusted allowlist (all known client_ids/deployment_ids). That both failed
to give an admin a focused "add this line" report and unnecessarily echoed the
trusted allowlist back to an unknown caller.

## What changed

- `src/server.js`: added `lti13BuildRegistrationDiagnostic(payload,
  claimVerification, signature)` — builds a safe, admin-focused report for an
  unknown registration. It reports: issuer, audience/client_id, deployment_id,
  message_type, version, signature_ok, nonce_ok, matched_allowlist (false), and
  a suggested env line `client_id:deployment_id` for `LTI13_ALLOWED_REGISTRATIONS`.
  It explicitly sets `auto_approved: false` and `allowlist_modified: false` and a
  privacy block asserting no secrets / no private key / no access token / no
  client assertion / no JWT body / no PII.
- `src/server.js`: in the launch handler's claims-failure branch, when the
  signature is valid but `client_id`/`deployment_id` is not allowlisted
  (`!checks.audience || !checks.deployment_id`), the handler now returns HTTP 403
  `mode: "phase3-unknown-registration"` with `registration_diagnostic` instead of
  the generic 401 that echoed the full trusted allowlist. Other claim failures
  (nonce, message_type, version) still hit the existing 401 path unchanged.

## Not touched

- The trusted allowlist itself is NOT modified at runtime (read-only).
- LTI launch is never auto-approved for unknown registrations.
- LTI 1.0/1.1 launch (`/api/lti/launch`, OAuth1 HMAC-SHA1) — unchanged.
- Trusted imported deployment pairs (primary-env + the imported course pair +
  `LTI13_ALLOWED_REGISTRATIONS`) still match and launch exactly as before.
- Supabase schema/RLS, production SQL, env/secrets, Render, render.yaml.
- Teacher Release gate, PR #127, manual import fallback, evidence logs.
- Student sync behavior — unchanged.

## Registration diagnostic behavior

For a signed launch whose client_id/deployment_id is not allowlisted:
- The launch is rejected (403), not approved.
- The allowlist is not changed.
- A diagnostic report is returned with the installation identifiers an admin
  needs (issuer, client_id, deployment_id, message_type, version), boolean
  signature_ok / nonce_ok flags, matched_allowlist=false, and a suggested env
  line `client_id:deployment_id`.

## Privacy behavior

The diagnostic exposes only installation/context identifiers (issuer, client_id,
deployment_id, message_type, version) plus boolean signature/nonce state. It does
NOT expose: secrets, the LTI13 private key, access tokens, the client assertion,
the raw JWT header/body, the trusted allowlist contents, or any PII (no name,
email, sub, national ID, raw headers). Booleans are reported from the existing
verification state; nothing is claimed as verified that was not verified.

## Live Moodle check (must be done by a human, לא אומת here)

1. Configure a Moodle tool with a client_id/deployment_id NOT in the allowlist
   and launch → confirm HTTP 403 `phase3-unknown-registration` with a
   `registration_diagnostic` containing the correct identifiers and a
   `suggested_env_line`, and that no secrets/JWT body/PII appear.
2. Add that line to `LTI13_ALLOWED_REGISTRATIONS` in Render, relaunch →
   confirm the launch now succeeds (session created), proving the allowlist
   path still works.
3. Launch from an already-trusted pair → confirm it still launches normally.

## Why this does not break the trusted 216 synced learners

This PR changes only the rejection response for *unknown* registrations. Trusted
registrations still match `lti13VerifyCoreClaims` and proceed to
`lti13BuildVerifiedSession` and the NRPS/sync path exactly as before. No write
path, learners table, or sync logic was touched, so the existing 216 synced
learners are unaffected.

## Checks

node --check src/server.js, check, build, doctor, typecheck,
audit:moodle-automation, audit:automation-capabilities,
audit:automation-capability-contract, audit:automation-evidence-log,
audit:auto-extraction-source-router, audit:multi-teacher-isolation-evidence,
audit:supabase-rls-isolation-readiness.

## Progress

Teacher Release remains NO. PR 13 complete. Live Moodle verification of the
unknown-registration 403 + allowlist round-trip is the remaining human gate
(`לא אומת` until run on real Moodle). Estimated overall progress: ~95%.
