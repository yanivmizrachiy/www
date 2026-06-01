# 2026-06-01 - LTI 1.3 Participants Breakdown API V1

**Branch:** feat/lti13-participants-breakdown-api-v1
**Teacher Release:** NO (unchanged)
**Scope:** add a safe, counts-only server endpoint that returns an ordered
participant breakdown from the CURRENT LTI 1.3 NRPS session only. Backend-only PR
(no UI changes).

## What changed (src/server.js only)

- Added shared helper `lti13FetchCurrentNrpsMembers(req)` that performs the
  current-session NRPS flow once: env check -> current session resolution
  (`importSessionFromRequest` -> `sessionFromRequest`, i.e. token/query `?t=`/
  header/cookie, never the global/latest session) -> openid discovery -> client
  credentials token (with/without `client_id` fallback) -> membership GET. Returns
  a discriminated result (`ok` + `stage`) with `members`, `roleCounts`, and safe
  diagnostics. The access token, client assertion and private key never leave the
  helper.
- Refactored the existing `/api/lti13/nrps-preview` endpoint to call the new
  helper instead of duplicating the discovery/token/membership logic inline. The
  preview response shape is unchanged (same fields, same `mode`, same privacy
  block); only the internal data source moved into the shared helper.
- Added new endpoint `GET /api/lti13/participants-breakdown?t=<token>`:
  - Returns ONLY aggregate counts + safe diagnostics, never a member list.
  - `classifyNrpsRole(roles)` separates obvious Instructor/Teacher/Faculty/Staff/
    Mentor/Manager/Administrator from obvious Learner/Student; anything else is
    counted as `unknown`. (Basic classifier, consistent with the existing preview;
    the full robust classifier is PR 4.)
  - All numbers come from the live NRPS response only. No hard-coded 222/216/6.

## Endpoint contract

`GET /api/lti13/participants-breakdown?t=<token>` (also accepts session cookie /
`x-lti-session` header, same resolution as the preview).

Success (HTTP 200):
```
{
  ok: true,
  source: "nrps",
  total_members: <number>,
  learners_count: <number>,
  instructors_count: <number>,
  unknown_count: <number>,
  role_counts: { <shortRole>: <count>, ... },
  has_names: true|false,
  course_id: <context id string | null>,
  deployment_id: <string | null>,
  client_id: <string | null>,
  membership_http_status: <number>,
  token_http_status: <number>,
  updated_at: <ISO string>,
  privacy: {
    no_emails_returned: true,
    no_raw_ids_returned: true,
    no_access_token_returned: true,
    no_names_returned: true,
    no_save_performed: true
  }
}
```

Non-success states return `ok:false` with a `stage`
(`env` 503 / `session-or-nrps-claim` 200 / `token` 502 / `membership` 502 /
`unexpected` 500) and the same `privacy` block.

## Privacy / truth / safety rules honored

- No names, no emails, no raw user IDs, no `lis_*` source IDs, no national IDs,
  no access token, no client assertion, no private key, no secrets are ever
  returned by this endpoint — only counts and non-sensitive diagnostics.
- `course_id`/`deployment_id`/`client_id` are LTI context/tool identifiers from the
  current session, not personal data; required by the contract.
- Uses the current session only (`importSessionFromRequest`), never the global /
  latest session.
- No data is saved/persisted by this endpoint.
- No fake/demo data; counts render only from a real live NRPS response. No
  hard-coded 216/222/6.
- Did NOT touch: LTI launch flow, student sync (`/api/imports/nrps-sync`),
  participants/gradebook/logs import, manual import fallback, evidence logs,
  Supabase schema/migrations/RLS, env/secrets, Render settings, Teacher Release
  gate, or PR #127. No files deleted.
- Teacher Release stays NO.

## Checks run

- `node --check src/server.js` — PASS
- `npm run check` — PASS
- `npm run build` — PASS
- `npm run doctor` — PASS
- `npm run typecheck` — pre-existing errors only (unchanged from main; no new
  errors from server.js — server.js is plain JS, not in tsc scope)
- `npm run audit:moodle-automation` — PASS
- `npm run audit:automation-capabilities` — PASS
- `npm run audit:automation-capability-contract` — PASS
- `npm run audit:automation-evidence-log` — PASS
- `npm run audit:auto-extraction-source-router` — PASS
- `npm run audit:multi-teacher-isolation-evidence` — PASS
- `npm run audit:supabase-rls-isolation-readiness` — PASS (documented RLS blocker;
  Teacher Release stays NO)

## What must be checked live in Moodle (לא אומת)

- Actual total/learner/instructor/unknown counts (e.g. 222 / 216 / 6) — surfaced
  only from live NRPS; real numbers confirmed only by opening the tool from Moodle
  with a valid session token. (`לא אומת`)
- Whether the live NRPS membership exposes role claims that map cleanly to
  learner vs instructor for this course (basic classifier). (`לא אומת`)

## How this avoids breaking the 216 synced learners

- This PR is read-only and counts-only; it never writes to students and never
  touches the auto-sync path or `/api/imports/nrps-sync`. The existing
  `nrps-preview` behavior is preserved (only its internals were extracted into a
  shared helper, response shape unchanged), so the Dashboard/Students reads from
  PR #232/#233 are unaffected.

## Progress estimate

~80% for a safe participants-breakdown API; remaining work is the full robust role
classifier (PR 4) and live Moodle verification of real counts (`לא אומת`).
