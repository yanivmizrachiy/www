# Tailwind Canonical Audit — Moodle Teacher Hub

## Purpose

Determine which Tailwind config is actually loaded before premium UI work.

## Safety

- No source code changed.
- No files moved.
- No files deleted.
- No deploy.
- No secrets.
- No student data.

## Current decision

- canonical candidate: `tailwind.config.cjs`
- confidence: `high`
- do not archive the other config yet until build and visual/UI checks are complete.

## Why this matters

Premium UI work must be based on the real Tailwind config. If both configs stay active/unclear, future design work may appear correct locally but fail in production.

## Static comparison

### `tailwind.config.ts`
- `exists`: `True`
- `sha256`: `b57f8273c15f85552b871f2c5a15be30e4a6a8362919e6be62e49ba9938ccf08`
- `bytes`: `2029`
- `contains_primary_glow`: `True`
- `contains_sidebar`: `True`
- `contains_fade_in`: `True`
- `contains_gradient_hero`: `False`

Referenced by:
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/gemini-sync/copied-files-20260428-193953.txt`
- `STATE/lovable-intake.md`
- `STATE/roadmap/repo-cleanup-audit-20260512.json`
- `STATE/roadmap/repo-cleanup-decisions-20260512.json`
- `docs/ai-handoff/lovable-handoff-request.md`
- `docs/architecture/repo-cleanup-decisions-20260512.md`
- `scripts/termux/termux-react-shell-autofix.sh`

### `tailwind.config.cjs`
- `exists`: `True`
- `sha256`: `f26fb7fb794f65b3d0b2b2033d575273003237a056625246aa6ddf6cb67e9323`
- `bytes`: `2785`
- `contains_gradient_hero`: `True`
- `contains_gradient_primary`: `True`
- `contains_accordion_down`: `True`
- `contains_primary_glow`: `False`

Referenced by:
- `STATE/file-classification/repo-file-classification-20260510.md`
- `STATE/gemini-ai-studio-run-2026-04-28.md`
- `STATE/gemini-sync/copied-files-20260428-193953.txt`
- `STATE/roadmap/repo-cleanup-audit-20260512.json`
- `STATE/roadmap/repo-cleanup-decisions-20260512.json`
- `docs/architecture/repo-cleanup-decisions-20260512.md`

## Runtime detection

### Default Tailwind load
- `has_gradient_hero`: `True`
- `has_gradient_primary`: `True`
- `has_primary_glow`: `False`
- `has_sidebar_background`: `False`
- `has_accordion_down`: `True`
- `has_fade_in`: `False`
- `ok`: `True`

### Explicit CJS
- `ok`: `True`
- `has_gradient_hero`: `True`
- `has_primary_glow`: `False`
- `has_accordion_down`: `True`
- `has_fade_in`: `False`

### Explicit TS
- `ok`: `True`
- `has_gradient_hero`: `False`
- `has_primary_glow`: `True`
- `has_accordion_down`: `False`
- `has_fade_in`: `True`

## Next action

Do not physically archive either Tailwind config in this PR. Use this audit to decide the later cleanup PR. After any Tailwind config cleanup, run `npm run check` and `npm run build`, then verify premium UI classes.
