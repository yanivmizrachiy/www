# Repo Cleanup Audit — Moodle Teacher Hub

## Purpose

Before continuing implementation, this audit checks old files, duplicates, risky tracked files, stale experiments, and contradictions.

## Safety

- No files deleted.
- No files moved.
- No source code changed.
- No deploy.
- No student data added.

## Total tracked files

`228`

## High priority decision

Review required before cleanup:

- `tracked_risky_files`
- `server_ts_and_src_server_js_both_exist_review_required`
- `two_tailwind_configs_review_required`

## Risky tracked files

- `STATE/readiness-audit/salon-pc-public-health-ok-secret-missing-20260503.md`

## Root docs that may need organization/archive

- `docs/README.md`
- `docs/requirements.md`

## Root scripts that may need organization/archive

- `scripts/README.md`

## Duplicate basenames

### `README.md`
- `README.md`
- `docs/README.md`
- `scripts/README.md`
### `index.ts`
- `supabase/functions/import-moodle-report/index.ts`
- `supabase/functions/lti-launch/index.ts`
### `production-reality-hardening-20260511.md`
- `STATE/readiness-audit/production-reality-hardening-20260511.md`
- `docs/architecture/production-reality-hardening-20260511.md`
### `supabase-existing-files-review-20260510.md`
- `STATE/readiness-audit/supabase-existing-files-review-20260510.md`
- `docs/persistence/supabase-existing-files-review-20260510.md`

## Special checks

- `server_ts_exists`: `True`
- `src_server_js_exists`: `True`
- `tailwind_config_ts_exists`: `True`
- `tailwind_config_cjs_exists`: `True`
- `data_store_json_tracked`: `False`
- `project_rules_exists`: `True`
- `readme_exists`: `True`
- `state_project_status_exists`: `True`
- `state_evidence_log_exists`: `True`

## Missing script references from package.json

- None

## Content markers requiring review

### `demo`
- `PROJECT_RULES.md`
- `STATE/AI_STUDIO_AUDIT_CHECKPOINT.md`
- `STATE/MOODLE_TEACHER_HUB_PRODUCTION_HARDENING.md`
- `STATE/evidence-log.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/local-audit/pr-branch-audit-20260501-065132.json`
- `STATE/local-audit/pr-branch-audit-20260501-065132.md`
- `STATE/local-audit/pr-branch-search-20260501-065132.txt`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md`
- `STATE/readiness-audit/lti-session-bridge-fix-20260503.md`
- `STATE/readiness-audit/lti13-governance-and-no-duplication-20260508.md`
- `STATE/readiness-audit/node-bootstrap-session-bridge-plan-20260503.md`
- `STATE/readiness-audit/product-data-security-acceptance-workflow-handoff-20260508.md`
- `STATE/readiness-audit/production-reality-hardening-20260511.md`
- `STATE/readiness-audit/react-root-canonical-cleanup-20260506.md`
- `STATE/readiness-audit/render-first-participants-import-v3-verified-20260506.md`
- `STATE/readiness-audit/repo-contradiction-cleanup-20260506.md`
- `STATE/roadmap/automation-first-execution-map-20260511.json`
- `STATE/roadmap/production-reality-hardening-20260511.json`
- `docs/ai-handoff/google-ai-studio-execution-prompt.md`
- `docs/ai-handoff/google-ai-studio-strict-qa-prompt.md`
- `docs/ai-handoff/lovable-handoff-request.md`
- `docs/architecture/automation-first-product-execution-plan-20260511.md`
- `docs/architecture/production-reality-hardening-20260511.md`
- `docs/persistence/supabase-deployment-runbook.md`
- `docs/persistence/supabase-existing-files-review-20260510.md`
- `scripts/audit/audit-moodle-readiness.mjs`
- `scripts/termux/termux-react-shell-autofix.sh`
- `server.ts`
- `supabase/functions/import-moodle-report/index.ts`
- `supabase/migrations/20260501_initial_schema.sql`
### `fake`
- `PROJECT_RULES.md`
- `STATE/AI_STUDIO_AUDIT_CHECKPOINT.md`
- `STATE/evidence-log-additions/2026-05-08-lti13-no-duplication-and-render-env-boundary.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/project-status.md`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/dashboard-data-fallback-20260505.md`
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md`
- `STATE/readiness-audit/lti13-governance-and-no-duplication-20260508.md`
- `STATE/readiness-audit/lti13-phase1-safe-oidc-20260507-161549.md`
- `STATE/readiness-audit/lti13-phase4-service-claims-20260507-195629.md`
- `STATE/readiness-audit/lti13-phase5-services-status-20260507-210245.md`
- `STATE/readiness-audit/node-bootstrap-session-bridge-plan-20260503.md`
- `STATE/readiness-audit/product-data-security-acceptance-workflow-handoff-20260508.md`
- `STATE/readiness-audit/react-root-canonical-cleanup-20260506.md`
- `STATE/readiness-audit/repo-contradiction-cleanup-20260506.md`
- `STATE/readiness-audit/termux-runtime-package-20260505.md`
- `STATE/recovery-complete.md`
- `STATE/roadmap/automation-first-execution-map-20260511.json`
- `docs/ai-handoff/google-ai-studio-execution-prompt.md`
- `docs/ai-handoff/google-ai-studio-strict-qa-prompt.md`
- `docs/ai-handoff/lovable-handoff-request.md`
- `docs/architecture/automation-first-product-execution-plan-20260511.md`
- `docs/architecture/next-code-pr-automation-core-spec-20260511.md`
- `docs/architecture/premium-ui-design-system-spec-20260511.md`
- `docs/architecture/production-reality-hardening-20260511.md`
- `server.ts`
- `src/server.js`
- `supabase/functions/lti-launch/index.ts`
### `mock`
- `STATE/file-classification/repo-file-classification-20260510.md`
### `placeholder`
- `.github/workflows/build-termux-runtime.yml`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/gemini-ai-studio-run-2026-04-28.md`
- `STATE/local-audit/pr-branch-search-20260501-065132.txt`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/frontend-supabase-env-missing-20260503.md`
- `STATE/readiness-audit/lti13-phase1-safe-oidc-20260507-161549.md`
- `docs/ai-handoff/lovable-handoff-report.md`
- `docs/ai-handoff/lovable-handoff-request.md`
- `docs/operations/system-rules.md`
- `scripts/audit/audit-moodle-readiness.mjs`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/integrations/supabase/client.ts`
- `src/pages/Import.tsx`
### `localtunnel`
- `.env.example`
- `AI_LTI_SETUP_LOG.md`
- `MOODLE_SETUP_GUIDE.md`
- `README.md`
- `STATE/evidence-log.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/project-status.md`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/cloudflare-quick-tunnel-created-20260503.md`
- `STATE/readiness-audit/css-local-ok-public-503-20260503.md`
- `STATE/readiness-audit/frontend-supabase-env-missing-20260503.md`
- `STATE/readiness-audit/lti13-governance-and-no-duplication-20260508.md`
- `STATE/readiness-audit/moodle-css-asset-502-20260503.md`
- `STATE/readiness-audit/moodle-launch-503-after-salon-runtime-20260503.md`
- `STATE/readiness-audit/repo-contradiction-cleanup-20260506.md`
- `STATE/readiness-audit/salon-pc-public-health-ok-secret-missing-20260503.md`
- `STATE/readiness-audit/salon-pc-public-health-ready-20260503.md`
- `STATE/readiness-audit/salon-pc-runtime-tunnel-ok-20260503.md`
- `STATE/readiness-audit/termux-runtime-tunnel-evidence-20260503.md`
- `docs/operations/work-plan.md`
### `cloudflare`
- `README.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/project-status.md`
- `STATE/readiness-audit/cloudflare-health-ready-false-20260504.md`
- `STATE/readiness-audit/cloudflare-public-health-ready-20260503.md`
- `STATE/readiness-audit/cloudflare-quick-tunnel-created-20260503.md`
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md`
- `STATE/readiness-audit/lti-session-bridge-pushed-20260503.md`
- `STATE/readiness-audit/lti13-governance-and-no-duplication-20260508.md`
- `STATE/readiness-audit/moodle-lti-typeid-blocker-20260505.md`
- `STATE/readiness-audit/render-production-launch-20260506.md`
- `STATE/readiness-audit/repo-alignment-check-20260506.md`
- `STATE/readiness-audit/repo-contradiction-cleanup-20260506.md`
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505-1228.md`
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505-1619.md`
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505.md`
- `STATE/readiness-audit/termux-runtime-package-20260505.md`
- `docs/architecture/final-teacher-installation-model.md`
- `docs/operations/work-plan.md`
- `scripts/termux/run-runtime-package.sh`
### `ngrok`
- None
### `TODO`
- `STATE/TODO-NEXT.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/gemini-sync/copied-files-20260428-193953.txt`
- `STATE/local-audit/pr-branch-search-20260501-065132.txt`
### `FIXME`
- `STATE/file-classification/repo-file-classification-20260510.md`
### `MISSING_OAUTH_SIGNATURE`
- `README.md`
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/project-status.md`
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md`
- `STATE/readiness-audit/moodle-iframe-loaded-not-connected-20260503.md`
- `STATE/readiness-audit/moodle-lti-typeid-blocker-20260505.md`
- `STATE/readiness-audit/render-production-launch-20260506.md`
- `STATE/readiness-audit/supabase-role-and-boundary-handoff-20260508.md`
- `server.ts`
- `src/server.js`

## Cleanup rule

Do not delete old experiments blindly. First archive candidates with `git mv` into `archive/`, then remove only after build and source-of-truth review.

## Recommended next action

Create a cleanup PR that archives only files confirmed as unused and not required by package scripts, runtime, evidence, or source-of-truth.
