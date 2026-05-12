# Repo File Classification — Moodle Teacher Hub

Updated: 2026-05-10T05:26:19Z

Mode: classification only.  
No files were moved.  
No files were deleted.  
No source code was changed.  
No private student data is included in this document.

## Purpose

This file is the official map for organizing the repository before any physical rename/move/archive work.

The project already has a verified milestone:

- LTI 1.3 works from Moodle.
- NRPS works and returned 62 real members: 59 Learners and 3 Instructors.
- Participants import succeeded with 62 accepted rows.
- Students page displays real imported names/emails.
- Gradebook, Logs, daily practice time, reports, and exports are still future work.

## Classification Rules

- `SOURCE_OF_TRUTH`: canonical project rules/status/evidence files.
- `PRODUCTION_SOURCE`: active app/server/build files.
- `STATE_DOCS`: status, evidence, audits, handoff, readiness documents.
- `DOCS`: documentation and contracts.
- `SCRIPTS`: automation scripts.
- `SUPABASE_REVIEW`: Supabase migrations/functions/adapters that require review before use.
- `RUNTIME_LOCAL_DO_NOT_COMMIT`: private/runtime files or patterns that must not enter Git.
- `ARCHIVE_CANDIDATE`: old experiments or temporary paths to review before moving to archive.
- `REVIEW_REQUIRED`: files or markers requiring human/AI review before moving or trusting.
- `OTHER_KEEP_FOR_NOW`: tracked files not yet classified with high confidence.

## SOURCE_OF_TRUTH

- `PROJECT_RULES.md` (13141 bytes)
- `README.md` (6933 bytes)
- `STATE/evidence-log.md` (12655 bytes)
- `STATE/project-status.md` (8065 bytes)


## PRODUCTION_SOURCE

- `index.html` (829 bytes)
- `package-lock.json` (163463 bytes)
- `package.json` (1879 bytes)
- `render.yaml` (799 bytes)
- `src/App.tsx` (3639 bytes)
- `src/components/AppLayout.tsx` (2178 bytes)
- `src/components/AppSidebar.tsx` (5677 bytes)
- `src/components/EmptyDomain.tsx` (2118 bytes)
- `src/components/ImportEmptyState.tsx` (2895 bytes)
- `src/components/LaunchDiagnostics.tsx` (3762 bytes)
- `src/components/PracticeTimeSection.tsx` (6277 bytes)
- `src/components/SafePage.tsx` (955 bytes)
- `src/components/StatusBadge.tsx` (1157 bytes)
- `src/components/TruthBadge.tsx` (1536 bytes)
- `src/components/ui/accordion.tsx` (1977 bytes)
- `src/components/ui/button.tsx` (1139 bytes)
- `src/components/ui/card.tsx` (889 bytes)
- `src/components/ui/input.tsx` (824 bytes)
- `src/components/ui/scroll-area.tsx` (1642 bytes)
- `src/components/ui/sidebar.tsx` (2516 bytes)
- `src/components/ui/sonner.tsx` (34 bytes)
- `src/components/ui/table.tsx` (2764 bytes)
- `src/components/ui/tabs.tsx` (1883 bytes)
- `src/components/ui/textarea.tsx` (772 bytes)
- `src/components/ui/toast.tsx` (187 bytes)
- `src/components/ui/toaster.tsx` (43 bytes)
- `src/components/ui/tooltip.tsx` (277 bytes)
- `src/hooks/use-mobile.tsx` (576 bytes)
- `src/hooks/use-toast.ts` (3935 bytes)
- `src/hooks/useChaptersIndex.ts` (1772 bytes)
- `src/hooks/useImports.tsx` (16847 bytes)
- `src/hooks/useLtiSession.ts` (6173 bytes)
- `src/hooks/useMoodleConnection.ts` (521 bytes)
- `src/hooks/useMoodleData.ts` (1385 bytes)
- `src/index.css` (4339 bytes)
- `src/integrations/supabase/client.ts` (775 bytes)
- `src/integrations/supabase/types.ts` (30415 bytes)
- `src/lib/csv.ts` (789 bytes)
- `src/lib/duration.ts` (769 bytes)
- `src/lib/moodleImport.ts` (7083 bytes)
- `src/lib/utils.ts` (166 bytes)
- `src/main.tsx` (194 bytes)
- `src/pages/ActivityPage.tsx` (1258 bytes)
- `src/pages/ChapterDetail.tsx` (329 bytes)
- `src/pages/Chapters.tsx` (582 bytes)
- `src/pages/Dashboard.tsx` (8740 bytes)
- `src/pages/Export.tsx` (6588 bytes)
- `src/pages/Grades.tsx` (4414 bytes)
- `src/pages/Import.tsx` (17369 bytes)
- `src/pages/LtiBootstrap.tsx` (2756 bytes)
- `src/pages/NotFound.tsx` (211 bytes)
- `src/pages/Reports.tsx` (728 bytes)
- `src/pages/SettingsPage.tsx` (12924 bytes)
- `src/pages/Setup.tsx` (246 bytes)
- `src/pages/Sites.tsx` (221 bytes)
- `src/pages/StudentProfile.tsx` (6434 bytes)
- `src/pages/Students.tsx` (10368 bytes)
- `src/pages/Tasks.tsx` (6084 bytes)
- `src/pages/reports/DayReport.tsx` (3031 bytes)
- `src/pages/reports/GapReport.tsx` (4846 bytes)
- `src/pages/reports/StudentReport.tsx` (3547 bytes)
- `src/pages/reports/TaskReport.tsx` (3124 bytes)
- `src/server.js` (79140 bytes)
- `src/vite-env.d.ts` (38 bytes)
- `src/yaniv-premium-ui.css` (5875 bytes)
- `tsconfig.app.json` (576 bytes)
- `tsconfig.json` (181 bytes)
- `tsconfig.node.json` (402 bytes)
- `vite.config.ts` (483 bytes)


## STATE_DOCS

- `STATE/AI_STUDIO_AUDIT_CHECKPOINT.md` (1074 bytes)
- `STATE/MOODLE_TEACHER_HUB_PRODUCTION_HARDENING.md` (985 bytes)
- `STATE/TODO-NEXT.md` (330 bytes)
- `STATE/current-verification-20260501.md` (2014 bytes)
- `STATE/deploy-triggers/force-render-lti-routing-fix-20260506.md` (1282 bytes)
- `STATE/deploy-triggers/force-render-lti-routing-fix-v3-20260506.md` (878 bytes)
- `STATE/evidence-log-additions/2026-05-08-lti13-no-duplication-and-render-env-boundary.md` (1039 bytes)
- `STATE/evidence-log-additions/2026-05-08-product-handoff-extension.md` (821 bytes)
- `STATE/evidence-log-additions/2026-05-08-supabase-role-and-boundary-handoff.md` (599 bytes)
- `STATE/gemini-ai-studio-run-2026-04-28.md` (7975 bytes)
- `STATE/gemini-sync/copied-files-20260428-193953.txt` (2917 bytes)
- `STATE/gemini-sync/review-npm-build-20260428-201923.log` (576 bytes)
- `STATE/gemini-sync/review-npm-install-20260428-201923.log` (342 bytes)
- `STATE/gemini-sync/skipped-files-20260428-193953.txt` (13 bytes)
- `STATE/local-audit/post-hardening-search-20260501-070424.txt` (1 bytes)
- `STATE/local-audit/pr-branch-audit-20260501-065132.json` (4202 bytes)
- `STATE/local-audit/pr-branch-audit-20260501-065132.md` (3694 bytes)
- `STATE/local-audit/pr-branch-search-20260501-065132.txt` (10046 bytes)
- `STATE/local-audit/production-hardening-report-20260501-070424.json` (459 bytes)
- `STATE/lovable-intake.md` (4724 bytes)
- `STATE/readiness-audit/assistant-summary-20260501.md` (1824 bytes)
- `STATE/readiness-audit/central-coordinator-plan-20260503.md` (9807 bytes)
- `STATE/readiness-audit/cloudflare-health-ready-false-20260504.md` (1237 bytes)
- `STATE/readiness-audit/cloudflare-public-health-ready-20260503.md` (2058 bytes)
- `STATE/readiness-audit/cloudflare-quick-tunnel-created-20260503.md` (1507 bytes)
- `STATE/readiness-audit/css-local-ok-public-503-20260503.md` (1402 bytes)
- `STATE/readiness-audit/dashboard-data-fallback-20260505.md` (667 bytes)
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md` (7128 bytes)
- `STATE/readiness-audit/error-audit-and-smarter-fixes-20260506.md` (5786 bytes)
- `STATE/readiness-audit/frontend-supabase-env-missing-20260503.md` (2735 bytes)
- `STATE/readiness-audit/import-routes-require-session-verified-20260506.md` (1891 bytes)
- `STATE/readiness-audit/local-clean-build-check-20260506.md` (960 bytes)
- `STATE/readiness-audit/lti-routing-automatic-fix-stack-20260506.md` (4525 bytes)
- `STATE/readiness-audit/lti-routing-recovery-applied-20260506.md` (1993 bytes)
- `STATE/readiness-audit/lti-session-bridge-fix-20260503.md` (592 bytes)
- `STATE/readiness-audit/lti-session-bridge-pushed-20260503.md` (1780 bytes)
- `STATE/readiness-audit/lti13-automation-investigation-20260507.md` (4796 bytes)
- `STATE/readiness-audit/lti13-governance-and-no-duplication-20260508.md` (2924 bytes)
- `STATE/readiness-audit/lti13-live-diagnostics-evidence-20260507.md` (1701 bytes)
- `STATE/readiness-audit/lti13-phase1-safe-oidc-20260507-161549.md` (834 bytes)
- `STATE/readiness-audit/lti13-phase2-signature-verification-20260507-163748.md` (593 bytes)
- `STATE/readiness-audit/lti13-phase3-verified-session-20260507-171227.md` (621 bytes)
- `STATE/readiness-audit/lti13-phase4-service-claims-20260507-195629.md` (421 bytes)
- `STATE/readiness-audit/lti13-phase5-services-status-20260507-210245.md` (472 bytes)
- `STATE/readiness-audit/lti13-phase5b-live-session-map-fix-20260507-211102.md` (260 bytes)
- `STATE/readiness-audit/lti13-services-status-route-order-20260507-213026.md` (290 bytes)
- `STATE/readiness-audit/moodle-css-asset-502-20260503.md` (1086 bytes)
- `STATE/readiness-audit/moodle-iframe-loaded-not-connected-20260503.md` (2969 bytes)
- `STATE/readiness-audit/moodle-launch-503-after-salon-runtime-20260503.md` (1725 bytes)
- `STATE/readiness-audit/moodle-lti-typeid-blocker-20260505.md` (1959 bytes)
- `STATE/readiness-audit/moodle-lti13-screenshot-map-20260507.md` (5892 bytes)
- `STATE/readiness-audit/node-bootstrap-session-bridge-plan-20260503.md` (1887 bytes)
- `STATE/readiness-audit/product-data-security-acceptance-workflow-handoff-20260508.md` (11721 bytes)
- `STATE/readiness-audit/react-root-canonical-cleanup-20260506.md` (1780 bytes)
- `STATE/readiness-audit/render-canonical-root-verified-20260506.md` (1995 bytes)
- `STATE/readiness-audit/render-first-participants-import-v3-verified-20260506.md` (2761 bytes)
- `STATE/readiness-audit/render-health-after-participants-import-v3-20260506.md` (1699 bytes)
- `STATE/readiness-audit/render-production-launch-20260506.md` (4210 bytes)
- `STATE/readiness-audit/repo-alignment-check-20260506.md` (2897 bytes)
- `STATE/readiness-audit/repo-contradiction-cleanup-20260506.md` (3000 bytes)
- `STATE/readiness-audit/repo-governance-sync-20260510.md` (1059 bytes)
- `STATE/readiness-audit/salon-pc-public-health-ok-secret-missing-20260503.md` (1908 bytes)
- `STATE/readiness-audit/salon-pc-public-health-ready-20260503.md` (2221 bytes)
- `STATE/readiness-audit/salon-pc-runtime-tunnel-ok-20260503.md` (2084 bytes)
- `STATE/readiness-audit/supabase-existing-state-audit-20260503.md` (5940 bytes)
- `STATE/readiness-audit/supabase-mobile-navigation-evidence-20260503.md` (2952 bytes)
- `STATE/readiness-audit/supabase-role-and-boundary-handoff-20260508.md` (3114 bytes)
- `STATE/readiness-audit/supabase-table-list-evidence-20260503.md` (2511 bytes)
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505-1228.md` (1206 bytes)
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505-1619.md` (1172 bytes)
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505.md` (1088 bytes)
- `STATE/readiness-audit/termux-runtime-package-20260505.md` (805 bytes)
- `STATE/readiness-audit/termux-runtime-tunnel-evidence-20260503.md` (2509 bytes)
- `STATE/recovery-complete.md` (2003 bytes)
- `STATE/repo-consolidation.md` (2230 bytes)


## DOCS

- `docs/GPT_OPERATING_MANUAL.md` (1203 bytes)
- `docs/adr/ADR-001-base-architecture.md` (551 bytes)
- `docs/api/notes.md` (407 bytes)
- `docs/data-acquisition-and-teacher-workflows.md` (10990 bytes)
- `docs/deployment/lti-tool-setup.md` (793 bytes)
- `docs/deployment/plan.md` (515 bytes)
- `docs/final-teacher-installation-model.md` (5139 bytes)
- `docs/google-ai-studio-execution-prompt.md` (11056 bytes)
- `docs/google-ai-studio-strict-qa-prompt.md` (9683 bytes)
- `docs/implementation-plan.md` (4046 bytes)
- `docs/import-contract.md` (3022 bytes)
- `docs/legacy-moodle-teacher-hub-snapshot.md` (4371 bytes)
- `docs/lovable-handoff-report.md` (12970 bytes)
- `docs/lovable-handoff-request.md` (3707 bytes)
- `docs/lti-contract.md` (4024 bytes)
- `docs/lti13-advantage-investigation-plan.md` (5780 bytes)
- `docs/moodle-api-contract.md` (3237 bytes)
- `docs/product/scope.md` (376 bytes)
- `docs/repository-map.md` (2839 bytes)
- `docs/requirements.md` (4291 bytes)
- `docs/supabase-deployment-runbook.md` (3703 bytes)
- `docs/system-rules.md` (4557 bytes)
- `docs/testing-plan.md` (2853 bytes)
- `docs/typescript-config-notes.md` (3585 bytes)
- `docs/work-plan.md` (6202 bytes)


## SCRIPTS

- `scripts/add-lti13-readiness.cjs` (7458 bytes)
- `scripts/apply-render-first-participants-import-v2.cjs` (10492 bytes)
- `scripts/apply-render-first-participants-import-v3.cjs` (10534 bytes)
- `scripts/apply-render-first-participants-import-v3.py` (10445 bytes)
- `scripts/apply-render-first-participants-import.cjs` (10520 bytes)
- `scripts/audit-moodle-readiness.mjs` (6418 bytes)
- `scripts/check-health.ps1` (301 bytes)
- `scripts/check-repo.ps1` (728 bytes)
- `scripts/fix-lti-routing-redirect-cache.cjs` (5280 bytes)
- `scripts/open-dev-login.ps1` (84 bytes)
- `scripts/open-lti-config.ps1` (87 bytes)
- `scripts/run-all.ps1` (613 bytes)
- `scripts/status-all.ps1` (1210 bytes)
- `scripts/termux/run-runtime-package.sh` (3071 bytes)
- `scripts/termux_react_shell_autofix.sh` (27148 bytes)
- `scripts/verify-lti-routing-fix.cjs` (2306 bytes)


## SUPABASE_REVIEW

Supabase files must be reviewed carefully before any SQL/function deployment. Supabase Gateway is not the active LTI path.

- `supabase/functions/import-moodle-report/index.ts` (6905 bytes)
- `supabase/functions/lti-launch/index.ts` (1603 bytes)
- `supabase/migrations/20240428_initial_reconstruction_DRAFT_DO_NOT_RUN.sql` (5751 bytes)
- `supabase/migrations/20260501_initial_schema.sql` (3127 bytes)


## RUNTIME_LOCAL_DO_NOT_COMMIT

These are path/name candidates only. Real student data, backups, CSV/XLSX/ODS, and runtime stores must never be committed.

- `.env.example` (583 bytes)
- `data/store.json` (1263 bytes)


## ARCHIVE_CANDIDATE

Do not delete. Review first, then move to `archive/` with a local README explaining why.

אין פריטים כרגע.


## REVIEW_REQUIRED_BY_PATH

- `supabase/functions/import-moodle-report/index.ts` (6905 bytes)
- `supabase/functions/lti-launch/index.ts` (1603 bytes)
- `supabase/migrations/20240428_initial_reconstruction_DRAFT_DO_NOT_RUN.sql` (5751 bytes)
- `supabase/migrations/20260501_initial_schema.sql` (3127 bytes)


## REVIEW_REQUIRED_BY_CONTENT_MARKERS

The following list is path-only and contains no secret/student values.

### Marker: `demo`

- `PROJECT_RULES.md`
- `STATE/AI_STUDIO_AUDIT_CHECKPOINT.md`
- `STATE/evidence-log.md`
- `STATE/local-audit/pr-branch-audit-20260501-065132.json`
- `STATE/local-audit/pr-branch-audit-20260501-065132.md`
- `STATE/local-audit/pr-branch-search-20260501-065132.txt`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md`
- `STATE/readiness-audit/lti-session-bridge-fix-20260503.md`
- `STATE/readiness-audit/lti13-governance-and-no-duplication-20260508.md`
- `STATE/readiness-audit/node-bootstrap-session-bridge-plan-20260503.md`
- `STATE/readiness-audit/product-data-security-acceptance-workflow-handoff-20260508.md`
- `STATE/readiness-audit/react-root-canonical-cleanup-20260506.md`
- `STATE/readiness-audit/render-first-participants-import-v3-verified-20260506.md`
- `STATE/readiness-audit/repo-contradiction-cleanup-20260506.md`
- `data/store.json`
- `docs/google-ai-studio-execution-prompt.md`
- `docs/google-ai-studio-strict-qa-prompt.md`
- `docs/lovable-handoff-request.md`
- `docs/supabase-deployment-runbook.md`
- `scripts/audit-moodle-readiness.mjs`
- `scripts/termux_react_shell_autofix.sh`
- `server.ts`
- `supabase/functions/import-moodle-report/index.ts`
- `supabase/migrations/20260501_initial_schema.sql`

### Marker: `fake`

- `PROJECT_RULES.md`
- `STATE/AI_STUDIO_AUDIT_CHECKPOINT.md`
- `STATE/evidence-log-additions/2026-05-08-lti13-no-duplication-and-render-env-boundary.md`
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
- `docs/google-ai-studio-execution-prompt.md`
- `docs/google-ai-studio-strict-qa-prompt.md`
- `docs/lovable-handoff-request.md`
- `server.ts`
- `src/server.js`
- `supabase/functions/lti-launch/index.ts`

### Marker: `mock`

אין פריטים.

### Marker: `placeholder`

- `STATE/gemini-ai-studio-run-2026-04-28.md`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `STATE/readiness-audit/frontend-supabase-env-missing-20260503.md`
- `STATE/readiness-audit/lti13-phase1-safe-oidc-20260507-161549.md`
- `docs/lovable-handoff-report.md`
- `docs/lovable-handoff-request.md`
- `docs/system-rules.md`
- `github/workflows/build-termux-runtime.yml`
- `scripts/audit-moodle-readiness.mjs`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/integrations/supabase/client.ts`
- `src/pages/Import.tsx`

### Marker: `localtunnel`

- `AI_LTI_SETUP_LOG.md`
- `STATE/evidence-log.md`
- `STATE/readiness-audit/central-coordinator-plan-20260503.md`
- `env.example`

### Marker: `cloudflare`

- `STATE/readiness-audit/cloudflare-health-ready-false-20260504.md`
- `STATE/readiness-audit/cloudflare-public-health-ready-20260503.md`
- `STATE/readiness-audit/cloudflare-quick-tunnel-created-20260503.md`
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505-1228.md`
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505-1619.md`
- `STATE/readiness-audit/termux-prebuilt-runtime-ready-20260505.md`
- `docs/final-teacher-installation-model.md`
- `docs/work-plan.md`
- `scripts/termux/run-runtime-package.sh`

### Marker: `MISSING_OAUTH_SIGNATURE`

- `README.md`
- `STATE/project-status.md`
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md`
- `STATE/readiness-audit/moodle-iframe-loaded-not-connected-20260503.md`
- `STATE/readiness-audit/moodle-lti-typeid-blocker-20260505.md`
- `STATE/readiness-audit/render-production-launch-20260506.md`
- `STATE/readiness-audit/supabase-role-and-boundary-handoff-20260508.md`
- `server.ts`
- `src/server.js`

### Marker: `TODO`

- `STATE/TODO-NEXT.md`
- `STATE/gemini-sync/copied-files-20260428-193953.txt`
- `STATE/local-audit/pr-branch-search-20260501-065132.txt`

### Marker: `FIXME`

אין פריטים.

## OTHER_KEEP_FOR_NOW

- `.editorconfig` (173 bytes)
- `.gitattributes` (198 bytes)
- `.github/workflows/build-termux-runtime.yml` (3715 bytes)
- `.github/workflows/moodle-teacher-hub-safety-check.yml` (1869 bytes)
- `.gitignore` (964 bytes)
- `AI_LTI_SETUP_LOG.md` (1395 bytes)
- `MOODLE_SETUP_GUIDE.md` (1444 bytes)
- `metadata.json` (219 bytes)
- `postcss.config.js` (67 bytes)
- `server.ts` (7096 bytes)
- `tailwind.config.cjs` (2785 bytes)
- `tailwind.config.ts` (2029 bytes)
## Recommended Next Actions

1. Keep PR #2 as the governance baseline.
2. Keep this PR as classification-only.
3. Do not merge active branch until local backup is confirmed.
4. After classification review, create the next branch for `docs/` and `STATE/` organization.
5. Move files only when their classification is clear.
6. Use archive, not deletion, for old experiments.
7. Do not touch active source files unless `npm run check` and `npm run build` pass.

## Proposed Next Physical Organization

- `docs/architecture/`
- `docs/operations/`
- `docs/privacy/`
- `docs/imports/`
- `docs/lti/`
- `docs/persistence/`
- `docs/future-adapters/`
- `scripts/audit/`
- `scripts/maintenance/`
- `scripts/termux/`
- `scripts/render/`
- `scripts/dev/`
- `archive/old-tunnels/`
- `archive/old-supabase-gateway/`
- `archive/experiments/`
- `archive/old-audits/`

## Done Criteria For Repo Organization

Repo organization is considered ready only when:

- `PROJECT_RULES.md` explains the project, status, requirements, and next steps.
- `README.md` is short and points to the right source-of-truth files.
- `STATE/project-status.md` reflects the latest verified status.
- `STATE/evidence-log.md` contains aggregate evidence only.
- No private student data is tracked.
- Old experiments are archived, not deleted.
- Scripts have clear names and locations.
- `npm run check` passes after any move/rename affecting code.
