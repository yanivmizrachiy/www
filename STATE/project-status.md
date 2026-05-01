# Project Status — www / Moodle Teacher Hub

Updated: 2026-05-01
Repository: `yanivmizrachiy/www`
Active PR branch: `gemini/ai-studio-sync-20260428-193953`

## Current verified checkpoint

Latest verified local/Termux status from user output:

```text
TYPECHECK_EXIT=0
BUILD_EXIT=0
BRANCH=gemini/ai-studio-sync-20260428-193953
COMMIT=2036f8f Ignore TypeScript build info files
STATUS: clean
```

Additional repo commits after that checkpoint prepared source/docs only and require another pull/build verification:

- `90cf9b8` — current verification checkpoint file
- `ccab1d6` — Supabase deployment runbook

## What is now actually built in source

- Hebrew RTL React/Vite app.
- Main routes for Dashboard, Import, Students, Student Profile, Tasks, Chapters, Grades, Activity, Reports, Export, Settings, Setup, and LTI bootstrap.
- Dashboard no longer claims verified Moodle connection without a session.
- Student profile no longer uses fake average grade `85`; average is calculated only from real numeric grades.
- Export page includes real XLSX export code for available real data only.
- Import page parses Moodle files/tables and posts to the import endpoint.
- Safe source for `supabase/functions/import-moodle-report/index.ts` exists.
- Safe blocked source for `supabase/functions/lti-launch/index.ts` exists.
- Reviewed minimal Supabase schema source exists in `supabase/migrations/20260501_initial_schema.sql`.
- `.gitignore` ignores `*.tsbuildinfo`.

## What is verified

| Area | Status |
|---|---|
| Correct PR branch | verified |
| TypeScript typecheck | verified passing at commit `2036f8f` |
| Vite build | verified passing at commit `2036f8f` |
| Export source | implemented, build-passing after local verification |
| Import function source | present in repo |
| Reviewed schema source | present in repo |
| Secrets in GitHub | no known real secret committed; must keep verifying |
| Moodle production readiness | not ready |

## What is not verified / not done

- Supabase SQL has not been run.
- Supabase Edge Functions have not been deployed.
- Real Moodle LTI launch has not been verified end-to-end.
- Real OAuth1 HMAC-SHA1 launch evidence has not been recorded.
- Manual Real Data Import has not been tested end-to-end with a real Moodle export.
- Excel export has not yet been tested from real imported data.
- Moodle Tool URL must not be changed yet.
- PR is still Draft and should not be merged until final review.

## Strict truth rules

- Do not claim production-ready.
- Do not claim real Moodle connection until a real Moodle launch is verified.
- Do not run SQL automatically.
- Do not deploy functions automatically.
- Do not paste or commit real secrets.
- Do not create demo students, fake grades, fake activity, or fake practice time.
- Any future change must preserve existing working UI unless the exact file/scope is approved.

## Current readiness estimate

```text
Repository control: strong
Frontend typecheck/build: verified passing
Export source: implemented
Import backend source: implemented but not deployed
Supabase schema source: reviewed source only, not applied
LTI source: safe/blocked until real OAuth verification
Real teacher use: not approved
Estimated readiness: 80%-82%
```
