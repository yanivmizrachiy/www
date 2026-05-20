# Progress — Moodle Automation Readiness Audit

Date: 2026-05-20  
Teacher Release: **NO**

## What was added

Added a read-only automation readiness audit for Moodle Teacher Hub:

- `scripts/checks/moodle-automation-readiness-audit.cjs`

## Why

Yaniv asked to continue advancing maximum Moodle automation without asking for manual Moodle extraction now.

This audit does not require a Moodle file. It reads the repository and classifies current Moodle data-acquisition capability by domain.

## What the audit classifies

- LTI context
- Participants
- Gradebook
- Logs
- Course Structure / Activity Completion
- Moodle Web Services
- Teacher Release

Each domain is classified as one of:

- `AUTO`
- `SEMI_AUTO`
- `BLOCKED`
- `NOT_ALLOWED`
- `UNKNOWN`

## Safety

The audit is read-only.

It does not:

- read Moodle exports
- read secrets
- read raw student rows
- change runtime behavior
- change Participants import
- change Gradebook import
- change Logs import
- change Supabase
- change LTI launch
- change Teacher Release

## Current truth

Course Structure & Activities Import V1 is already merged in PR #106.

The next high-leverage work is to measure automation readiness automatically, then build the next real automation layer only from verified gaps.

Teacher Release remains **NO**.

## Next

After this PR is merged:

1. Run `node scripts/checks/moodle-automation-readiness-audit.cjs` locally and in CI/manual checks.
2. Use the audit output to decide the next Claude Work Order.
3. Avoid asking Yaniv for manual Moodle extraction unless the audit says the route is SEMI_AUTO and a real report is actually needed for validation.
