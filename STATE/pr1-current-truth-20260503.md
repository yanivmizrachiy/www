# PR #1 Current Truth — Moodle Teacher Hub

Date: 2026-05-03
Repository: `yanivmizrachiy/www`
PR: `#1` — `Sync AI Studio recovery output`
Branch: `gemini/ai-studio-sync-20260428-193953`
Head inspected: `9d85de5b0f78043e095d76d9779e5043fe690fb6`

This file records the current verified understanding after the latest Google AI Studio/Gemini output supplied by the user and direct repository inspection.

---

## Key correction

Earlier state correctly recorded that Gemini itself reported no direct GitHub write access from AI Studio. However, the repository now has a real PR branch:

```text
gemini/ai-studio-sync-20260428-193953
```

A PR exists:

```text
#1 — Sync AI Studio recovery output
```

Therefore the current next step is no longer only “obtain ZIP”. The safer current step is strict PR review and cleanup before any merge.

---

## What PR #1 contains

The PR contains a large sync from AI Studio/Gemini recovery output, including frontend files, UI components, import/report pages, Supabase function source, migrations, scripts, logs, and state documents.

Important changed or added files include:

```text
.env.example
.gitignore
AI_LTI_SETUP_LOG.md
MOODLE_SETUP_GUIDE.md
PROJECT_RULES.md
STATE/*
docs/supabase-deployment-runbook.md
metadata.json
package.json
package-lock.json
scripts/audit-moodle-readiness.mjs
server.ts
src/components/EmptyDomain.tsx
src/components/ImportEmptyState.tsx
src/components/LaunchDiagnostics.tsx
src/components/PracticeTimeSection.tsx
src/components/TruthBadge.tsx
src/components/ui/*
src/integrations/supabase/client.ts
src/lib/csv.ts
src/lib/duration.ts
src/lib/moodleImport.ts
src/pages/*
src/server.js
supabase/functions/import-moodle-report/index.ts
supabase/functions/lti-launch/index.ts
supabase/migrations/20240428_initial_reconstruction_DRAFT_DO_NOT_RUN.sql
supabase/migrations/20260501_initial_schema.sql
tailwind.config.cjs
vite.config.ts
```

---

## Verified build/status evidence in PR branch

`STATE/current-verification-20260501.md` in the PR branch reports user-Termux verification:

```text
TYPECHECK_EXIT=0
BUILD_EXIT=0
BRANCH=gemini/ai-studio-sync-20260428-193953
COMMIT=2036f8f Ignore TypeScript build info files
```

The same file records:

```text
Frontend typecheck/build: verified passing
Export page: source implemented, build passing
Import function source: present, not deployed
Supabase schema source: present, not applied
LTI real launch: not verified
Production-ready: no
```

Another state file, `STATE/readiness-audit/assistant-summary-20260501.md`, also records:

```text
TYPECHECK_EXIT=0
BUILD_EXIT=0
```

and intentionally preserves these blockers:

```text
supabase_sql_not_verified_by_this_script
supabase_functions_not_deployed_by_this_script
real_moodle_launch_not_verified_by_this_script
real_import_not_verified_by_this_script
```

---

## Critical blocking issue: secret committed in PR branch

`AI_LTI_SETUP_LOG.md` in the PR branch contains the LTI Shared Secret value in plain text.

This must be removed before merge, and the secret should be rotated before real/production use.

No file containing real secret values may be merged into `main`.

---

## LTI implementation reality

There are two LTI/server paths in the PR branch:

1. `server.ts` and `src/server.js` include an Express `/api/lti/launch` implementation with OAuth1 HMAC-SHA1 verification logic.
2. `supabase/functions/lti-launch/index.ts` is deliberately blocked by design and returns 501 until real OAuth1 verification is implemented/tested in the Edge Function.

This means:

- Local Express LTI path may be closer to testable.
- Supabase Edge Function LTI path is intentionally not active.
- Real Moodle launch has not been verified yet.
- The final deployment architecture must decide whether LTI launch runs on Express server, Supabase Edge Function, or a staged path.

---

## Current production blockers

PR #1 must not be merged until the following are resolved or explicitly accepted as blocked:

1. Remove committed shared secret from `AI_LTI_SETUP_LOG.md` and related docs.
2. Decide the canonical runtime: Express `/api/lti/launch` vs Supabase Edge Function `lti-launch`.
3. Confirm no real `.env`, service role key, private Moodle data, or student data are committed.
4. Confirm current PR head still passes `npm install`, `npm run typecheck`, and `npm run build`.
5. Review `src/server.js` because it stores local JSON state in `data/store.json`; this may conflict with the Supabase-only truth-first architecture.
6. Review migrations before running anything in Supabase.
7. Real Moodle LTI launch remains unverified.
8. Manual import of a real Moodle report remains unverified.
9. Moodle Web Services token/API remains unavailable.

---

## Recommended next action

Do not merge yet.

Next safe step:

1. Request changes on PR #1.
2. Remove/rotate the committed shared secret.
3. Re-run build/typecheck on the PR branch after cleanup.
4. Only after cleanup continue PR review.

---

## Truth status

```text
Canonical repo: yanivmizrachiy/www
AI Studio output: synced into real PR branch, not main
PR exists: yes, #1
Build/typecheck on PR branch: reported and documented as passing
Main branch still does not contain the Gemini recovery code until PR merge
PR contains a committed LTI shared secret: yes, blocker
Production-ready: no
Need ZIP now: not mandatory if PR #1 contains the sync; PR review and cleanup are priority
```
