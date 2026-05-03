# Project Status — www / Moodle Teacher Hub

Updated: 2026-05-03
Repository: `yanivmizrachiy/www`
Active PR branch: `gemini/ai-studio-sync-20260428-193953`
PR: #1 — Draft / not merged / not production-ready

## Current source-of-truth position

This project already has real components in several places. The correct work now is integration, verification, and cleanup — not rebuilding from scratch.

```text
Moodle external tool
  -> current temporary Localtunnel URL
  -> Node LTI endpoint /api/lti/launch
  -> React/Vite Moodle Teacher Hub UI
  -> Supabase project moodle-teacher-hub
  -> Manual Real Data Import until Moodle Web Services token is verified
```

## Current verified evidence

### GitHub / PR

- Repository: `yanivmizrachiy/www`.
- Active work branch: `gemini/ai-studio-sync-20260428-193953`.
- PR #1 is still Draft and must not be merged directly.
- AI Studio/Gemini recovery code is present in the PR branch, not fully merged into `main`.
- The PR branch contains important source files including Dashboard, Import, reports, `PracticeTimeSection`, `TruthBadge`, `server.ts`, `src/server.js`, Supabase source functions, and schema files.

### Moodle evidence from screenshots

- Moodle host shown: `moodlemoe.lms.education.gov.il`.
- External tool name shown: `Moodle Teacher Hub`.
- Current Moodle Tool URL shown: `https://nasty-rabbits-wait.loca.lt/api/lti/launch`.
- LTI version shown: `LTI 1.0/1.1`.
- Consumer key shown: `yaniv-lti-tool`.
- Shared secret exists and is masked. It must never be committed or pasted into chat.
- A real launch attempt currently showed `503 - Tunnel Unavailable`, meaning Moodle tried to open the tool but the tunnel was unavailable. This is reachability failure, not OAuth proof.

### Supabase evidence from screenshots

- Correct Supabase project: `moodle-teacher-hub`.
- Correct project id / URL: `ncoqanascubqkxxfvucfz` / `https://ncoqanascubqkxxfvucfz.supabase.co`.
- Supabase status visible: `Healthy`.
- Project overview visible: `Last migration: No migrations`, `Last backup: No backups`, `Recent branch: No branches`.
- `calendar-app` is a wrong/irrelevant paused project and must not be used for Moodle Teacher Hub.
- A SQL Editor screenshot showed `Success. No rows returned` for a Moodle LTI schema query, but actual tables/columns/RPCs still require verification.

### Termux runtime evidence

- Runtime folder: `~/www-moodle-runtime`.
- Branch checked out: `gemini/ai-studio-sync-20260428-193953`.
- Head observed: `abd480c Redact LTI shared secret from setup log`.
- Node observed: `v24.14.1`.
- npm observed: `10.9.8`.
- `npm install` completed.
- `npm run build` completed successfully with Vite 5.4.21.
- Local server answered `http://127.0.0.1:3000/health`.
- Local health showed canonical endpoint `/api/lti/launch` and OAuth required.
- Local health showed `supabaseConfigured: false` at the time of test.
- Local health showed `readyForMoodleUse: false` at the time of test.
- `npx localtunnel` CLI failed on Android/Termux due to `Unsupported platform: android` from `openurl`.

## Current status table

| Area | Status |
|---|---|
| Requirements | Strong / captured |
| Source repo | Verified |
| Active PR branch | Verified |
| AI Studio recovery code | Present in PR branch |
| Main branch merge | Not approved |
| Moodle external tool setup | Screenshot verified |
| Moodle current Tool URL | `https://nasty-rabbits-wait.loca.lt/api/lti/launch` |
| Node build in Termux | Verified passing |
| Local Node `/health` | Verified passing |
| Public tunnel | Failing / not verified |
| Real Moodle LTI OAuth | Not verified |
| Supabase project identity | Screenshot verified: `ncoqanascubqkxxfvucfz` |
| Supabase table schema | Not yet audited |
| Supabase runtime env connection | Not configured in latest Termux health output |
| Manual import end-to-end | Not verified |
| Moodle Web Services token | Not verified / blocked-no-token |
| Production readiness | No |

## Current blockers

1. Public reachability: Localtunnel currently unavailable or failing from Termux.
2. Supabase schema audit: need Table Editor / safe SQL output to know what already exists.
3. Runtime env: local server still needs real Supabase env values locally/server-side; no secrets in repo/chat.
4. Real LTI launch: not verified until tunnel is reachable and Moodle POST reaches server.
5. Manual import: not verified until LTI/session and Supabase schema are confirmed.

## Do not do

- Do not rebuild the app from scratch.
- Do not create a new repo.
- Do not merge PR #1 while Draft/diverged without review.
- Do not run old AI SQL blindly.
- Do not deploy Supabase functions blindly.
- Do not expose or commit secrets.
- Do not use fake students, fake grades, fake activity, or fake practice time.
- Do not claim production-ready.

## Current next step

Work step-by-step with the user screenshots.

Immediate next evidence required:

```text
Supabase Table Editor screenshot for project moodle-teacher-hub showing the list of public tables.
```

After that:

```text
Run safe SQL only for table names / columns / row counts, with no secrets and no student data.
```

Only after Supabase existing state is understood should runtime integration continue.

## Related audit files

- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/supabase-existing-state-audit-20260503.md`
- `STATE/readiness-audit/supabase-mobile-navigation-evidence-20260503.md`

## Current readiness estimate

```text
Requirements clarity: 99%
Repo understanding: 90%+
Moodle setup evidence: 90%
Supabase project identification: 95%
Termux local build/server: verified
Tunnel/public reachability: not working yet
Real LTI launch: not verified
Supabase schema/RPCs: not audited yet
Manual data import: not verified end-to-end
Overall execution readiness: 60%-65%
Production-ready: no
```
