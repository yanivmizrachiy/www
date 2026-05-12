# Server Runtime Canonical Audit — Moodle Teacher Hub

## Purpose

Determine the active server runtime before any cleanup or implementation work.

## Safety

- No source code changed.
- No file moved.
- No file deleted.
- No deploy.
- No secrets.
- No student data.

## Current decision

- `src/server.js`: `KEEP_ACTIVE`
- `server.ts`: `REVIEW_REQUIRED_BEFORE_ARCHIVE`

## Reason

`package.json` lifecycle scripts use `src/server.js` for start/check/build. Therefore `src/server.js` is the active runtime server until a deliberate migration is planned.

## Package script usage

- package mentions `src/server.js`: `True`
- package mentions `server.ts`: `False`

## Render YAML mentions

- render mentions `src/server.js`: `False`
- render mentions `server.ts`: `False`

## File comparison

### `server.ts`

- exists: `True`
- size: `7096`
- lines: `165`
- sha256: `58e8a47b023c16cb6267b2279aea6c440ed12d980f3b44d831f3c3304399d80b`
- markers: `demo, fake, MISSING_OAUTH_SIGNATURE`
- route_count: `2`
- referenced_by_count: `14`

Referenced by:
- `STATE/MOODLE_TEACHER_HUB_PRODUCTION_HARDENING.md`
- `STATE/evidence-log.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/local-audit/pr-branch-audit-20260501-065132.json`
- `STATE/local-audit/pr-branch-audit-20260501-065132.md`
- `STATE/local-audit/pr-branch-search-20260501-065132.txt`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/roadmap/repo-cleanup-audit-20260512.json`
- `STATE/roadmap/repo-cleanup-decisions-20260512.json`
- `docs/architecture/repo-cleanup-audit-20260512.md`
- `docs/architecture/repo-cleanup-decisions-20260512.md`
- `scripts/audit/audit-moodle-readiness.mjs`
- `supabase/functions/import-moodle-report/index.ts`
- `supabase/functions/lti-launch/index.ts`

Routes found:
- `GET /health`
- `GET *`

### `src/server.js`

- exists: `True`
- size: `79140`
- lines: `2194`
- sha256: `6c58cc9ae8189800a4c518cbb5a990bacfcfe82a073632bf48c796da7ea0bb6c`
- markers: `fake, MISSING_OAUTH_SIGNATURE`
- route_count: `28`
- referenced_by_count: `39`

Referenced by:
- `.github/workflows/build-termux-runtime.yml`
- `.github/workflows/moodle-teacher-hub-safety-check.yml`
- `STATE/MOODLE_TEACHER_HUB_PRODUCTION_HARDENING.md`
- `STATE/deploy-triggers/force-render-lti-routing-fix-20260506.md`
- `STATE/evidence-log.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/local-audit/pr-branch-audit-20260501-065132.md`
- `STATE/local-audit/pr-branch-search-20260501-065132.txt`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/error-audit-and-smarter-fixes-20260506.md`
- `STATE/readiness-audit/lti-routing-automatic-fix-stack-20260506.md`
- `STATE/readiness-audit/lti-routing-recovery-applied-20260506.md`
- `STATE/readiness-audit/lti-session-bridge-pushed-20260503.md`
- `STATE/readiness-audit/lti13-phase1-safe-oidc-20260507-161549.md`
- `STATE/readiness-audit/moodle-launch-503-after-salon-runtime-20260503.md`
- `STATE/readiness-audit/product-data-security-acceptance-workflow-handoff-20260508.md`
- `STATE/readiness-audit/react-root-canonical-cleanup-20260506.md`
- `STATE/readiness-audit/render-canonical-root-verified-20260506.md`
- `STATE/readiness-audit/render-first-participants-import-v3-verified-20260506.md`
- `STATE/readiness-audit/repo-alignment-check-20260506.md`
- `STATE/readiness-audit/repo-contradiction-cleanup-20260506.md`
- `STATE/readiness-audit/termux-runtime-package-20260505.md`
- `STATE/roadmap/repo-cleanup-audit-20260512.json`
- `STATE/roadmap/repo-cleanup-decisions-20260512.json`
- `docs/architecture/repo-cleanup-audit-20260512.md`
- `docs/architecture/repo-cleanup-decisions-20260512.md`
- `docs/operations/work-plan.md`
- `package.json`
- `scripts/archive-candidates/render-first-participants-import/apply-render-first-participants-import-v2.cjs`
- `scripts/archive-candidates/render-first-participants-import/apply-render-first-participants-import-v3.cjs`
- `scripts/archive-candidates/render-first-participants-import/apply-render-first-participants-import-v3.py`
- `scripts/archive-candidates/render-first-participants-import/apply-render-first-participants-import.cjs`
- `scripts/audit/audit-moodle-readiness.mjs`
- `scripts/audit/verify-lti-routing-fix.cjs`
- `scripts/maintenance/add-lti13-readiness.cjs`
- `scripts/maintenance/fix-lti-routing-redirect-cache.cjs`
- `scripts/termux/run-runtime-package.sh`
- `scripts/termux/termux-react-shell-autofix.sh`
- `server.ts`

Routes found:
- `GET /health`
- `GET /lti11/config`
- `GET /api/bootstrap`
- `POST /api/import`
- `GET /api/imports/students`
- `GET /api/imports/overview`
- `GET /api/moodle-ws/status`
- `GET /api/moodle-ws/site-info`
- `GET /api/moodle-ws/enrolled-users-preview`
- `GET /api/launches`
- `GET /api/students`
- `GET /api/tasks`
- `GET /api/grades`
- `GET /api/activity`
- `GET /api/settings`
- `GET /api/moodle-captures`
- `GET /api/moodle-summary`
- `GET /api/export/grades.csv`
- `GET /legacy-dashboard`
- `GET /api/lti13/token-matrix`
- `GET /api/lti13/nrps-preview`
- `GET /api/lti13/status`
- `GET /api/lti13/config`
- `GET /api/lti13/jwks`
- `ALL /api/lti13/login`
- `ALL /api/lti13/launch`
- `GET /api/lti13/services-status`
- `GET *`

## Next cleanup decision

Do not archive `server.ts` yet. First compare route/logic differences against `src/server.js`. If it is historical only, move it with `git mv` into `archive/legacy-runtime/server.ts` and add an archive README explaining that `src/server.js` remains canonical.
