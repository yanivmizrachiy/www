# Moodle Teacher Hub — Repo Organization Master Summary

## Purpose

This file summarizes the repository organization work after the verified Moodle Teacher Hub milestone.

## Verified product milestone

- LTI 1.3 works from Moodle.
- NRPS works.
- NRPS returned 62 real course members:
  - 59 Learners
  - 3 Instructors
- NRPS returns identifiers and roles but not names/emails.
- Real Moodle Participants import succeeded.
- Participants import accepted 62 rows.
- Students page displays imported real names/emails.
- Gradebook, Logs, daily practice time, reports, exports, and durable persistence are future work.

## Organization PR chain

- PR #2 — Governance/source-of-truth sync.
- PR #3 — Repository file classification.
- PR #4 — Runtime data safety; `data/store.json` removed from tracked source.
- PR #5 — Documentation structure organization.
- PR #6 — Scripts structure organization.
- PR #7 — Final rules/index summary.

## Repository source-of-truth model

Primary files:

- `PROJECT_RULES.md`
- `README.md`
- `STATE/project-status.md`
- `STATE/evidence-log.md`
- `STATE/file-classification/repo-file-classification-20260510.md`

Supporting organization files:

- `docs/README.md`
- `scripts/README.md`
- `docs/privacy/runtime-data-safety.md`
- `docs/examples/store.example.json`

## Current repository structure direction

- `src/` — active production source.
- `docs/` — organized by purpose.
- `scripts/` — organized by purpose.
- `STATE/` — status, evidence, classification, and readiness audits.
- `supabase/` — review-required future persistence layer.
- `data/` — runtime/local only, not tracked as source.

## Mandatory next steps

1. Keep all PRs as Draft until review.
2. Confirm local browser backup summary for imported students.
3. Merge only when safe and only in order.
4. Implement durable persistence before expanding to grades/logs.
5. Build NRPS ↔ Participants matching.
6. Then build Gradebook import.
7. Then build Logs/daily practice time.
8. Then build reports/export.

## Safety rules

- Do not commit real student data.
- Do not commit Moodle exports.
- Do not commit browser backup JSON.
- Do not commit secrets/tokens/private keys.
- Do not mark Gradebook/Logs/Reports as working until verified.
- Do not deploy/restart without backup or durable persistence.
