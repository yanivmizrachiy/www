# Moodle Teacher Hub — Teacher Release Final Gates

This document is the truth-first final release gate for Moodle Teacher Hub.

## Release rule

Teacher Release must remain NO / false until all required gates pass using real Moodle data.

No fake data.  
No mock students.  
No student rows in GitHub.  
No secrets in GitHub.  
No production SQL from chat.  
No Teacher Release YES without evidence.

## Automated live gate

Run:

npm run validate:teacher-release:live

The script checks only safe aggregate endpoints:

- /api/persistence/validate
- /api/release/readiness
- /api/lti/diagnostics
- /api/import/schema-diagnostics

It returns aggregate counts only and does not write data.

## Required gates

1. Live endpoints return valid JSON.
2. Supabase persistence is configured.
3. missing_tables is empty.
4. Import schema is compatible.
5. Moodle launch/session has been observed.
6. Real Participants import exists: students > 0 and import_batches > 0.
7. Real Gradebook import exists.
8. Real Logs import exists.
9. Multi-teacher or multi-course isolation is validated.
10. Repo/infra safety check is complete.

## Remaining manual work

The following cannot be completed automatically without real Moodle files/session:

- Export/import Participants.
- Export/import Gradebook.
- Export/import Logs.
- Validate two teachers or two courses with no data mixing.

## Teacher Release live checklist (PR 21)

This is the explicit human checklist that must be fully satisfied — with real
Moodle data and recorded evidence — before Teacher Release may change from NO.
Each item is `לא אומת` (not verified) until a human records live evidence in
`STATE/evidence-log.md`. Do not tick a box from chat or from code alone.

### A. Two real spaces, two real teachers

- [ ] `לא אומת` — Course/space A launched from Moodle (record course id + resource link id only; no names/emails).
- [ ] `לא אומת` — Course/space B launched from Moodle, distinct from A (different resource link id).
- [ ] `לא אומת` — Teacher A identity observed on space A launch.
- [ ] `לא אומת` — Teacher B identity observed on space B launch, distinct from teacher A.

### B. Student sync per space, no mixing

- [ ] `לא אומת` — Student sync run in course A; learner count belongs to A only.
- [ ] `לא אומת` — Student sync run in course B; learner count belongs to B only.
- [ ] `לא אומת` — Teachers/instructors listed correctly in each course.
- [ ] `לא אומת` — Re-open A after B: A's counts/course/resource link unchanged (no leak from B). Use `/isolation-check` two-space snapshot/compare.

### C. Live RLS (DB-layer isolation)

- [ ] `לא אומת` — RLS policies applied in a disposable dev project first (see `supabase/manual_sql/teacher_scoped_rls_policies_draft_DO_NOT_RUN.sql`; currently DRAFT, NOT run).
- [ ] `לא אומת` — Cross-teacher read blocked at the DB layer (not only in app code), evidence recorded.

### D. Export and reports

- [ ] `לא אומת` — Export (Excel/CSV hub) produces a real file from real imported data.
- [ ] `לא אומת` — Reports render real per-student / per-activity numbers (no demo placeholders).

### E. Safety invariants

- [ ] `לא אומת` — No demo / fake / mock data present in any shown space.
- [ ] `לא אומת` — No secrets in repo or in any returned response (aggregate-only endpoints).
- [ ] `לא אומת` — No student rows / names / emails / raw user ids in logs or in the repo.
- [ ] PR #127 is NOT merged and NOT touched as part of this gate.

### F. Automated pre-checks (run before/after PRs 1–5 and as the current full suite)

These run in the sandbox/CI and gate the code side. Last observed status on this branch:

- node --check src/server.js — PASS
- npm run check — PASS
- npm run build — PASS
- npm run doctor — PASS
- npm run typecheck — FAIL (pre-existing only): 4 errors in `src/pages/GradebookImport.tsx` (`useLtiSession`, `buildMoodleReportUrl`, `MOODLE_REPORTS` x2). No new errors introduced by this PR (docs-only). `לא אומת` whether fixed elsewhere.
- npm run audit:moodle-automation — PASS
- npm run audit:automation-capabilities — PASS
- npm run audit:automation-capability-contract — PASS
- npm run audit:automation-evidence-log — PASS
- npm run audit:auto-extraction-source-router — PASS
- npm run audit:multi-teacher-isolation-evidence — PASS
- npm run audit:supabase-rls-isolation-readiness — PASS (reports RLS ENABLED, NO policy / default-deny)
- npm run validate:teacher-release:live — live; last recorded run shows participants/gradebook/logs data gates open (see `STATE/teacher-release/live-gate-latest.json`).

### Current explicit blockers (all must clear)

1. RLS live enforcement NOT verified — policies are draft only, never run. `לא אומת`.
2. Multi-space / two-teacher live evidence NOT complete — needs two real launches with no mixing recorded in evidence log. `לא אומת`.
3. GradebookImport typecheck errors are pre-existing (4) — gate stays honest until resolved or confirmed non-blocking. `לא אומת`.
4. Human live screenshots / evidence still required for export + reports on real data. `לא אומת`.

## Decision

Until the live gate passes, real data exists, and every box in the PR 21
checklist above is verified with recorded evidence:

Teacher Release: NO
