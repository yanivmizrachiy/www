# 2026-06-01 — Teacher Release Gate Live Checklist V1 (PR 21)

**Branch:** teacher-release-gate-live-checklist-v1
**Teacher Release:** NO (unchanged)
**Mode:** documentation / checklist only. No code, env, secrets, SQL, or schema changes.

## Purpose

Prepare an explicit, truth-first Teacher Release checklist that a human must
satisfy with real Moodle data and recorded evidence before Teacher Release may
move from NO. Builds on the existing final-gates doc and the live gate script
(`validate:teacher-release:live`) without deleting any prior evidence.

## What was added

- `docs/operations/teacher-release-final-gates.md` — appended a "Teacher Release
  live checklist (PR 21)" section with grouped, unticked items, each marked
  `לא אומת` until a human records evidence:
  - A. Two real spaces, two real teachers (distinct resource link ids).
  - B. Student sync per space, no mixing (re-open A after B, no leak; via `/isolation-check`).
  - C. Live RLS (DB-layer cross-teacher read blocked; policies still DRAFT, not run).
  - D. Export works + reports show real numbers (no demo).
  - E. Safety invariants: no demo, no secrets, no student data in logs/repo, PR #127 untouched.
  - F. Automated pre-checks with last observed pass/fail on this branch.
  - Explicit blockers list (RLS live, multi-space evidence, GradebookImport typecheck, human screenshots).
- This STATE progress note.

## Checks run on this branch

- node --check src/server.js — PASS
- npm run check — PASS
- npm run build — PASS
- npm run doctor — PASS
- npm run typecheck — FAIL (pre-existing only): 4 errors in `src/pages/GradebookImport.tsx`
  (`useLtiSession`, `buildMoodleReportUrl`, `MOODLE_REPORTS` x2). No new errors from
  this docs-only PR.
- npm run audit:moodle-automation — PASS
- npm run audit:automation-capabilities — PASS
- npm run audit:automation-capability-contract — PASS
- npm run audit:automation-evidence-log — PASS
- npm run audit:auto-extraction-source-router — PASS
- npm run audit:multi-teacher-isolation-evidence — PASS
- npm run audit:supabase-rls-isolation-readiness — PASS (RLS ENABLED, NO policy / default-deny)

## Not changed (protected)

- Teacher Release flag — remains NO.
- LTI launch flow / allowlist, NRPS/student sync behavior — untouched.
- Supabase migrations / production SQL / RLS — untouched (draft remains DO_NOT_RUN).
- env / secrets / Render / render.yaml — untouched.
- Manual import fallback, evidence logs (no deletions) — untouched.
- PR #127 — untouched.

## What must be checked live in Moodle (`לא אומת`)

- Two distinct spaces + two distinct teachers, real launches.
- Per-space student sync with no mixing on re-open.
- DB-layer RLS cross-teacher read blocked (after policies reviewed + applied in dev).
- Export file + reports from real data, screenshots recorded in `STATE/evidence-log.md`.

## Progress

Teacher Release gate documentation: checklist complete and authoritative.
Live verification still pending (human, real Moodle). Teacher Release remains NO.
Estimated checklist-track progress: ~90% (only live human evidence + RLS live
enforcement remain). `לא אומת` for all live items.
