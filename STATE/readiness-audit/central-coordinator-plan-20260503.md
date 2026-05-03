# Central Coordinator Plan — 2026-05-03

Repository: `yanivmizrachiy/www`
Active PR branch: `gemini/ai-studio-sync-20260428-193953`
PR: #1, still Draft / not merged

This file records the current truth after consolidating the user handoff notes, repository inspection, Moodle screenshots, Supabase screenshots, and Termux runtime output. It is intentionally a coordination document, not a feature implementation.

## Core principle

Do not rebuild from scratch. The project already has real components across Moodle, GitHub, React/Node, and Supabase. The next work is integration, verification, cleanup, and careful synchronization.

## Current architecture to preserve

```text
Ministry Moodle external tool
  -> Node LTI endpoint /api/lti/launch during current local/tunnel testing
  -> OAuth1 HMAC-SHA1 verification in server.ts / src/server.js
  -> LTI session token
  -> React/Vite Moodle Teacher Hub dashboard
  -> Supabase project moodle-teacher-hub for sessions/import metadata/data
  -> Manual Real Data Import until Moodle Web Services token is verified
```

## Evidence now understood

### Moodle evidence from screenshots

- Host visible from screenshot: `moodlemoe.lms.education.gov.il`.
- Moodle external tool name: `Moodle Teacher Hub`.
- Current Tool URL visible in Moodle: `https://nasty-rabbits-wait.loca.lt/api/lti/launch`.
- LTI version visible: `LTI 1.0/1.1`.
- Consumer key visible: `yaniv-lti-tool`.
- Shared secret exists and is masked. The value must never be committed or pasted into chats.
- A launch attempt from Moodle currently shows `503 - Tunnel Unavailable`, which means Moodle is attempting to open the tool but the public tunnel is not reachable. This does not yet test OAuth.

### Supabase evidence from screenshots

- The Supabase Dashboard screenshot is from `supabase.com/dashboard/project/ncoqanascubqkxxfvucfz`.
- Project name visible: `moodle-teacher-hub`.
- Project URL visible: `https://ncoqanascubqkxxfvucfz.supabase.co`.
- Organization visible: `yanivmizrachiy's Org`.
- Status visible: `Healthy`.
- Database visible: Primary Database, Northeast Asia / Seoul.
- SQL Editor screenshot shows a query named like `Moodle LTI Sessions and Launch Attempts Schema` with `Success. No rows returned`.
- The project overview still shows `Last migration: No migrations`, so the SQL may have been run manually in SQL Editor rather than through Supabase CLI migrations.

### Termux evidence from user output

- Clean runtime folder used: `~/www-moodle-runtime`.
- Branch checked out: `gemini/ai-studio-sync-20260428-193953`.
- Head observed: `abd480c Redact LTI shared secret from setup log`.
- Node observed: `v24.14.1`.
- npm observed: `10.9.8`.
- `npm install` completed.
- `npm run build` completed successfully with Vite 5.4.21.
- Local server health succeeded at `http://127.0.0.1:3000/health`.
- Local health reported canonical endpoint `/api/lti/launch` and OAuth required.
- Local health reported `supabaseConfigured: false` at that moment, meaning the local server was not yet supplied with Supabase env variables.
- Local health reported `readyForMoodleUse: false` at that moment, likely because no LTI shared secret was successfully entered into that process.
- `npx localtunnel` CLI failed on Android/Termux because the CLI dependency `openurl` throws `Unsupported platform: android`.
- A Termux-safe Localtunnel wrapper using the `localtunnel` library directly was prepared but has not yet been verified as running successfully.

## Corrected truth after consolidation

| Topic | Current truth |
|---|---|
| Source repo | `yanivmizrachiy/www` |
| Active work branch | `gemini/ai-studio-sync-20260428-193953` |
| PR state | Draft, open, not production-ready |
| AI Studio code | Synced to the PR branch, not merged to `main` |
| Supabase active candidate | `ncoqanascubqkxxfvucfz` / `moodle-teacher-hub` based on screenshots |
| Older Supabase ID | `iibrglxkiszrbzakrnlo` remains historical/possibly old until proven otherwise |
| Moodle Tool URL | Currently `https://nasty-rabbits-wait.loca.lt/api/lti/launch` |
| Node local server | Builds and answers `/health` in Termux |
| Tunnel | Currently the live blocker; Moodle screenshot shows 503 tunnel unavailable |
| OAuth source code | Exists in Node `server.ts` / `src/server.js` |
| OAuth real Moodle verification | Not verified yet |
| Supabase SQL | Screenshot suggests manual SQL success, but schema/tables still need direct verification |
| Supabase migrations | Screenshot says no migrations, so do not claim CLI migration applied |
| Manual import | Parser/source exists, full end-to-end real Moodle import not verified |
| Moodle Web Services API | blocked-no-token / not verified |
| Production-ready | No |

## What to delete from the mental plan

- Do not rebuild a new app from scratch.
- Do not open a new repository.
- Do not treat Google AI Studio text as authoritative without repo evidence.
- Do not treat the old Supabase project ID as active unless proven.
- Do not use the Supabase Edge `lti-launch` blocked function as if it is the currently working launch path.
- Do not merge PR #1 directly while it is Draft/diverged without review.
- Do not run SQL or deploy Supabase functions automatically without a focused safety step.
- Do not add demo students, demo grades, demo activity, fake time, or fake Moodle API.

## Immediate smart plan

### Phase 1 — Freeze and document truth

Status: this file records the freeze point. Evidence log and project status must also be updated before feature work.

### Phase 2 — Make the existing runtime reachable

Goal: eliminate `503 - Tunnel Unavailable`.

Required actions:

1. Start Node server from the PR branch runtime.
2. Provide `LTI_SHARED_SECRET` locally only, never in GitHub/chat.
3. Provide `APP_BASE_URL=https://nasty-rabbits-wait.loca.lt` to match the Moodle Tool URL exactly.
4. Use a Termux-safe tunnel runner, not `npx localtunnel` CLI, because the CLI fails on Android.
5. Verify public health returns JSON from `https://nasty-rabbits-wait.loca.lt/health`.

Success evidence needed:

```text
TUNNEL_OK
https://nasty-rabbits-wait.loca.lt/health returns JSON
Moodle no longer shows 503
```

### Phase 3 — Test real Moodle LTI launch

After tunnel works, click the external tool from Moodle.

Possible expected outcomes:

- `OAUTH_VERIFIED` and redirect to `/lti-bootstrap` / app dashboard.
- `BAD_OAUTH_SIGNATURE` if `APP_BASE_URL`, Tool URL, or shared secret mismatch.
- `BAD_CONSUMER_KEY` if the key differs.
- `MISSING_LTI_SHARED_SECRET` if the secret was not passed to the server process.

Success evidence needed:

- Screenshot of the app after launch, or exact server log lines.
- Server log showing POST to `/api/lti/launch` and the result.
- No secret values in screenshots/logs committed to the repo.

### Phase 4 — Connect runtime to the active Supabase project

Only after LTI reachability is stable:

Required env values locally/server-side:

```text
VITE_SUPABASE_URL=https://ncoqanascubqkxxfvucfz.supabase.co
SUPABASE_URL=https://ncoqanascubqkxxfvucfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<local only>
SUPABASE_SERVICE_ROLE_KEY=<local/server only>
```

Do not commit keys.

Success evidence needed:

- `/health` shows `supabaseConfigured: true`.
- A launch can record session/attempt without exposing secrets.
- Supabase table editor or safe SQL confirms expected rows/tables.

### Phase 5 — Verify Supabase schema without guessing

Required screenshots/evidence:

1. Supabase Table Editor list showing actual tables.
2. SQL query result for table names only, no secrets/student data.
3. Optional row counts for safe tables such as `moodle_sites`, `teacher_sessions`, `launch_attempts`, `import_batches`.

Do not paste keys or student data.

### Phase 6 — Manual Real Data Import proof

Only after session/context is stable:

1. Export or paste a small real Moodle report with private data masked if sharing screenshots.
2. Test parser detection.
3. Verify import batch and normalized storage.
4. Verify dashboard/reports reflect only imported real data.
5. Verify missing data stays missing.

### Phase 7 — PR cleanup before merge

1. Re-check PR #1 against latest `main` because branch is diverged.
2. Identify useful files to keep.
3. Remove/adjust misleading placeholders.
4. Fix Supabase client fallback behavior.
5. Confirm build/typecheck after rebase or clean branch.
6. Keep PR Draft until LTI/import evidence exists.

## Screenshots needed next

Priority order:

1. Termux output after starting the Termux-safe tunnel, especially public `/health`.
2. Moodle screen after clicking the external tool again, after tunnel is running.
3. `tail -f ~/moodle-hub-logs/server.log` around the Moodle click, with secrets hidden.
4. Supabase Table Editor table list for project `ncoqanascubqkxxfvucfz`.
5. Supabase SQL result for table names/counts only, no keys and no student records.
6. If the app opens: dashboard screenshot showing whether Moodle session/context is recognized.
7. If import is tested: Import screen preview and resulting status, with student names masked if needed.

## Current readiness estimate

```text
Requirements clarity: 99%
Repo understanding: 90%
Moodle tool configuration evidence: 90%
Supabase project identification: 90%
Termux build/local server: verified
Tunnel/public reachability: not yet working
Real LTI launch: not yet verified
Supabase runtime connection: not yet configured/verified
Manual import end-to-end: not yet verified
Production readiness: no
Overall execution readiness: about 60%-65%
```

## Stop rule

No feature work should continue until this truth is recorded in the repo and the next runtime evidence is captured. The next technical target is reachability: `https://nasty-rabbits-wait.loca.lt/health` must return the local server health JSON.
