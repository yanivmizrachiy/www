# Repo Cleanup Decisions — Moodle Teacher Hub

## Purpose

This document converts the cleanup audit into decisions. It does not delete, move, or change source code.

## Safety decision

- No file is approved for immediate blind deletion.
- Old/unclear files must be archived with `git mv` before deletion.
- Active runtime files must not be moved until build and package references are verified.
- Evidence files should generally be kept or archived, not deleted.

## Highest priority findings

- `tracked_risky_files`
- `server_ts_and_src_server_js_both_exist_review_required`
- `two_tailwind_configs_review_required`

## Decision table

| Path | Decision | Reason | Next action |
|---|---|---|---|
| `STATE/readiness-audit/salon-pc-public-health-ok-secret-missing-20260503.md` | `REVIEW_REQUIRED` | Audit flagged the path as risky because its name/content references secret-related status. It is a STATE evidence file, not automatically private data. | Open and review content. If it contains no secret values, keep as evidence or rename to a safer filename. If it contains secret values, remove sensitive content and rotate the secret if needed. |
| `server.ts` | `REVIEW_REQUIRED` | package.json uses src/server.js for start/check/build. server.ts is not the active runtime in package scripts, but may contain historical or reference code. | Compare with src/server.js. If obsolete, move to archive/legacy/server.ts with README. Do not delete before comparison. |
| `src/server.js` | `KEEP_ACTIVE` | package.json start/check/build use src/server.js as the active server. | Keep as active production server until a deliberate migration is planned. |
| `tailwind.config.ts` | `REVIEW_REQUIRED` | Both Tailwind config files exist. Need to determine canonical config used by the current Vite/Tailwind toolchain. | Run build after selecting canonical config. Archive the unused config only after proof. |
| `tailwind.config.cjs` | `REVIEW_REQUIRED` | Both Tailwind config files exist. Need to determine canonical config used by the current Vite/Tailwind toolchain. | Run build after selecting canonical config. Archive the unused config only after proof. |
| `docs/README.md` | `MERGE_INTO_CANONICAL` | README duplication can confuse source of truth. Root README and PROJECT_RULES are canonical. | Convert docs/README.md into a short docs index or merge useful content into README/PROJECT_RULES, then archive if redundant. |
| `docs/requirements.md` | `REVIEW_REQUIRED` | Requirements may contain important original product demands. | Compare against PROJECT_RULES and automation-first plan. Merge missing valid requirements into PROJECT_RULES, then archive old duplicate if fully covered. |
| `scripts/README.md` | `MERGE_INTO_CANONICAL` | scripts README should match the organized scripts folders and package.json scripts. | Update as scripts index or merge into docs/operations/scripts-index.md. Do not delete before preserving useful information. |
| `STATE/readiness-audit/production-reality-hardening-20260511.md` | `KEEP_EVIDENCE` | STATE and docs may intentionally share a filename: docs describes architecture; STATE records audit/evidence. | Keep unless content is proven duplicate. |
| `docs/architecture/production-reality-hardening-20260511.md` | `KEEP_ACTIVE` | Architecture/documentation file paired with STATE audit file. | Keep unless content is proven duplicate. |
| `STATE/readiness-audit/supabase-existing-files-review-20260510.md` | `KEEP_EVIDENCE` | STATE and docs may intentionally share a filename: docs describes architecture; STATE records audit/evidence. | Keep unless content is proven duplicate. |
| `docs/persistence/supabase-existing-files-review-20260510.md` | `KEEP_ACTIVE` | Architecture/documentation file paired with STATE audit file. | Keep unless content is proven duplicate. |
| `supabase/functions/import-moodle-report/index.ts` | `KEEP_ACTIVE_OR_REVIEW_REQUIRED` | index.ts duplication under different Supabase functions is normal naming convention, but Supabase functions are currently review-required. | Keep path structure, but do not deploy Supabase functions until reviewed. |
| `supabase/functions/lti-launch/index.ts` | `KEEP_ACTIVE_OR_REVIEW_REQUIRED` | index.ts duplication under different Supabase functions is normal naming convention, but Supabase functions are currently review-required. | Keep path structure, but do not deploy Supabase functions until reviewed. |
| `.github/workflows/build-termux-runtime.yml` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `placeholder`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `server.ts` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `MISSING_OAUTH_SIGNATURE`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `server.ts` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `demo`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `server.ts` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `fake`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `src/components/ui/input.tsx` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `placeholder`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `src/components/ui/textarea.tsx` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `placeholder`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `src/integrations/supabase/client.ts` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `placeholder`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `src/pages/Import.tsx` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `placeholder`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `src/server.js` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `MISSING_OAUTH_SIGNATURE`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `src/server.js` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `fake`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `supabase/functions/import-moodle-report/index.ts` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `demo`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `supabase/functions/lti-launch/index.ts` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `fake`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |
| `supabase/migrations/20260501_initial_schema.sql` | `REVIEW_REQUIRED` | Active or deployment-related file contains marker `demo`. Marker may be harmless context, but cannot be ignored before production work. | Inspect marker context. Remove demo/fake/placeholder logic if it affects runtime. Keep explanatory text only when truthful. |

## Cleanup sequence

1. Review risky STATE file content.
2. Decide canonical server: currently `src/server.js` is active by package scripts.
3. Decide canonical Tailwind config after build evidence.
4. Merge/organize duplicate README and requirements docs.
5. Inspect runtime markers in active files.
6. Create archive PR using `git mv`, not deletion.
7. Run `npm run check` and `npm run build` after any physical move.

## Current decision

The repository is not ready for new implementation until the high-priority cleanup decisions are resolved or explicitly accepted as safe.
