# Project Recovery Status - Cycle 1 Review

## Current verified status

This file records the reviewed state of the AI Studio recovery PR. It must not claim production readiness.

### Verified in PR branch

- The AI Studio recovery output was synced into branch `gemini/ai-studio-sync-20260428-193953`.
- The huge local backup snapshot was removed from the PR.
- The review build log reports `vite build` completed successfully.
- The UI includes upgraded Hebrew RTL pages for dashboard, import, tasks, grades, activity, reports, and student profile.
- The import UI can parse Moodle-style XLSX/CSV/ODS files and pasted tables on the client side before submission.
- The LTI Edge Function is intentionally blocked and returns a truthful not-implemented response until real OAuth1 HMAC-SHA1 verification is implemented and tested.
- The reconstructed SQL file is marked `DRAFT_DO_NOT_RUN` and must not be run on production without review.

### Not verified / not completed

- Real Moodle LTI launch was not verified.
- Real OAuth1 HMAC-SHA1 verification is not implemented.
- Supabase SQL was not run.
- Supabase Edge Functions were not deployed.
- The import backend function `import-moodle-report` is not verified as deployed.
- Moodle Web Services token/API access is still unavailable.
- Real Moodle report import end-to-end still needs testing.
- The app is not production-ready.

## Correct next phase

1. Keep PR #1 as Draft until the final build after the latest review fixes is verified.
2. Do not run SQL automatically.
3. Do not deploy Supabase Functions automatically.
4. Continue with truth-first manual real-data import mode while no Moodle Web Services token exists.
5. After merge, implement and verify the backend import function and real LTI OAuth verification as separate reviewed steps.

## Safety note

No fake students, fake grades, fake tasks, fake practice time, or fake Moodle API access may be presented as real. Missing data must be shown as missing from imported Moodle data.
