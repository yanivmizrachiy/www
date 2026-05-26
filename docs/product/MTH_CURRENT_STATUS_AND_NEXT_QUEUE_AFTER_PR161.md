# Moodle Teacher Hub / המודל החכם — Current Status After PR #161

## Purpose

This document is the current continuation snapshot after PR #159, PR #160, and PR #161.

It exists to prevent future Claude/GPT sessions from repeating completed work or following stale backlog items.

## Product identity

- Product name for teachers: **המודל החכם**
- Repo: `yanivmizrachiy/www`
- Local path: `C:\Users\yaniv\dev\www`
- Teacher Release: **NO**
- PR #127: **draft only, untouched, not merged**

## Recent verified merged work

### PR #159 — Scoped dashboard overview counts

Merged and verified.

Purpose:
- `/api/imports/overview` counts are scoped to the current Moodle/LTI session.
- Dashboard counts must not come from global runtime-store data.
- This protects against misleading cross-space/cross-course counts.

### PR #160 — Teacher sidebar final workflow

Merged and verified.

Purpose:
- Main teacher navigation was reduced to a clean workflow:
  - מרכז המורה
  - תלמידים
  - ציונים
  - פעילויות
  - זמנים
  - דוחות
- Technical/support/admin items were moved out of the primary teacher workflow.
- Routes were not deleted.

### PR #161 — Teacher-facing no-test labels

Merged and verified.

Purpose:
- Teacher-facing test/dev/LTI labels were cleaned.
- Product name for teachers remains **המודל החכם**.
- Teacher Release remains NO.
- PR #127 untouched.

## New improvement progress

Current new-improvement progress after PR #159, #160, #161:

**35%**

This progress number belongs only to the new improvement package, not to the entire historical product.

## What is already done in the new improvement package

- Data trust / dashboard scoping: done.
- Teacher sidebar workflow: done.
- Teacher-facing Test/LTI label cleanup: done.

## What remains next

Recommended next PR order:

1. `feat-teacher-date-time-duration-format-v1`
2. `feat-teacher-time-range-report-v1`
3. `feat-activities-chapters-teacher-flow-v1`
4. `feat-task-report-work-practice-submit-v1`
5. `fix-smart-import-session-scope-v1`
6. `repo-cleanup-evidence-based-archive-v1`

## Important product rules

- No fake data.
- No fake sync.
- No fake practice time.
- No misleading connected/synced/loaded state.
- Never mix data between Moodle spaces, courses, teachers, or sessions.
- If data is missing, say it clearly in Hebrew.
- Manual Moodle report import remains a real fallback.
- Do not break Participants, Gradebook, Logs, Course Structure, Smart Import, Export, Reports, LTI, or Supabase persistence.
- Teacher Release remains NO until production isolation/security/release evidence exists.
- PR #127 remains untouched unless explicitly approved later.

## Field evidence from live Moodle

The work is based on actual screenshots from the live Moodle tool.

Observed issues included:

- Teacher-facing `Moodle Teacher Hub — LTI 1.3 Test`.
- Separate `פרקים` and `משימות` sidebar entries.
- `פעילות / זמנים` instead of a clean `זמנים` entry.
- Technical items visible in the teacher workflow.
- Dashboard counts that needed scoped verification.

These issues are now partially addressed by PR #159–#161.

## Repo governance rule

Future AI sessions must not assume older docs/backlog files are current.

Before implementing a new PR, inspect:
- `PROJECT_RULES.md`
- `RULES.md`
- this current status document
- latest relevant `STATE/progress` files

If an older backlog conflicts with merged PRs, do not follow it blindly.
Update it only in a docs-sync PR.
