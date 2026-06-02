# 2026-06-01 - NRPS Sync Server-Owned Roster V1 (PR 5)

**Branch:** fix/nrps-sync-server-owned-roster-v1
**Teacher Release:** NO (unchanged)
**Scope:** stop relying on the client payload as the authoritative roster.
`/api/imports/nrps-sync` now fetches the NRPS membership on the SERVER for the
current verified LTI 1.3 session, classifies it, and persists only learners. The
legacy client `students` payload is downgraded to a compat-only fallback. Small,
focused PR; builds directly on PR #235's classifier.

## What changed

### src/server.js
- Added `MTH_NRPS_MEMBER_IDENTITY_V1` shared helpers next to the classifier:
  - `nrpsMemberFullName(member)` — `name` or `given_name + family_name`, trimmed.
  - `nrpsMemberIdHash(member)` — 16-char SHA-256 prefix over a stable identity
    source (`user_id` → `sub` → `lis_person_sourcedid` → name). This is the SAME
    hash the preview already exposed as `members_named[].id`, so the server-owned
    path derives the identical stable student id and UPDATES existing learners in
    place instead of duplicating them.
- `/api/lti13/nrps-preview` `members_named` now builds `id`/`name` via the two
  shared helpers (no behavior change; just deduplicated logic).
- Rewrote `/api/imports/nrps-sync` as `MTH_NRPS_SERVER_OWNED_SYNC_V1`:
  - Endpoint is now `async`.
  - Calls the existing shared `lti13FetchCurrentNrpsMembers(req)` (same
    current-session token/discovery/membership flow as the preview/breakdown).
  - Classifies every member with `classifyNrpsMember` and persists ONLY
    `role_kind === "learner"`. Instructors and unknown/ambiguous roles are counted
    but never stored as students.
  - Counts come exclusively from the live NRPS response (no hard-coded numbers).
  - New helper `persistNrpsLearners(members, spaceId)` does the upsert and also
    writes a counts-only `store.settings.nrpsRosterBreakdown`
    (`{ space_id, learners, instructors, unknown, total_members, updated_at }`)
    into the EXISTING settings object — no new DB schema, no names, no PII.
  - Backward compatibility: only when the server cannot own the fetch (env not
    configured / no live NRPS claim / token / membership failure) does it fall
    back to a client-supplied `students` payload, via
    `legacyClientRosterToMembers()`. That payload is explicitly NON-authoritative
    and flagged `used_legacy_payload: true` / `mode:
    "legacy-client-payload-fallback"`.
  - If neither server-owned NRPS nor a client fallback is available, returns a
    truthful `ok:false` with `error:
    "NO_SERVER_OWNED_NRPS_AND_NO_CLIENT_FALLBACK"` and next-step guidance.
  - Response now returns the required contract: `learners_inserted`,
    `learners_updated`, `instructors_seen`, `unknown_seen`, `total_members`,
    `no_fake_data: true`. Legacy fields (`inserted`, `updated`, `total`,
    `skipped_instructor`, `skipped_unknown`) are kept so existing clients that
    read them keep working.

### src/pages/Dashboard.tsx
- Both NRPS sync callers (`useAutoSyncStatus` and `handleSyncSpace`) now POST
  token-only to `/api/imports/nrps-sync` (no `students` body). The server fetches
  the roster itself. The preview is still fetched, but only to drive truthful UI
  states (auth-failed / empty / network) and to confirm members exist before
  triggering the save. No other dashboard logic changed.

## Server-owned vs backward-compatible behavior

- Primary path (server-owned): client sends only `{ token }`. Server fetches NRPS,
  classifies, saves learners. `mode: "server-owned-nrps"`,
  `used_legacy_payload: false`.
- Fallback path (compat only): server fetch unavailable AND client still sent a
  `students` array → server maps that array to member-shaped objects, runs the
  same classifier + upsert. `mode: "legacy-client-payload-fallback"`,
  `used_legacy_payload: true`. This keeps an older deployed frontend working
  during rollout but is never treated as authoritative.
- Manual report import (`/api/imports/*` participants/gradebook/logs) is a
  separate, untouched path.

## Privacy / truth / safety rules honored

- No names, emails, raw user IDs, `lis_*` source IDs, national IDs, access tokens,
  client assertions, private keys, or secrets are returned. The breakdown stored
  in settings is counts-only.
- No fake/demo data; no hard-coded 216/222/6. All counts come from live NRPS.
- Did NOT change: LTI launch flow, Supabase migrations/schema/RLS, env/secrets,
  Render settings, production SQL, Teacher Release gate, PR #127, the
  participants/gradebook/logs import pipelines, or the NRPS preview/breakdown
  response contracts. No new DB migration or production SQL added. No files
  deleted.
- Teacher Release stays **NO**.

## Checks run

- `node --check src/server.js` — PASS
- `npm run check` — see commit/PR run
- `npm run build` — see commit/PR run
- `npm run doctor` — see commit/PR run
- `npm run typecheck` — pre-existing errors only; server.js is plain JS (outside
  tsc scope); Dashboard.tsx change introduces no new errors
- `npm run audit:moodle-automation` — see commit/PR run
- `npm run audit:automation-capabilities` — see commit/PR run
- `npm run audit:automation-capability-contract` — see commit/PR run
- `npm run audit:automation-evidence-log` — see commit/PR run
- `npm run audit:auto-extraction-source-router` — see commit/PR run
- `npm run audit:multi-teacher-isolation-evidence` — see commit/PR run
- `npm run audit:supabase-rls-isolation-readiness` — see commit/PR run

## What must be checked live in Moodle (לא אומת)

- A real launch where the client POSTs token-only and the server-owned fetch
  returns the live roster and saves the learners. `לא אומת`
- That `learners_inserted + learners_updated` equals the live learner count and
  that previously synced learners are updated, not duplicated. `לא אומת`
- That the fallback path is NOT silently used in production (expect
  `used_legacy_payload: false`). `לא אומת`

## How this avoids breaking the existing synced learners

- The server-owned path reuses `nrpsMemberIdHash`, which is identical to the hash
  the legacy client sent as `members_named[].id`. The resulting
  `stableId("student", spaceId + "|nrps|" + hash)` is therefore the same key, so
  existing learners are matched and UPDATED rather than re-inserted.
- The classifier/learner-only rule is unchanged from PR #235; standard
  `Learner` / `Student` members still classify as `learner` and still sync.
- The legacy client payload still works (as a non-authoritative fallback), so a
  stale frontend during rollout cannot drop existing learners.
- This PR does not delete or rewrite any stored students.

## Progress estimate

Server-owned NRPS sync: ~85% (code complete; live Moodle verification of the
server-owned save and no-duplication is `לא אומת`). Overall new-improvement
progress remains ~90% pending live automation verification, multi-teacher
isolation proof, and release hardening.
