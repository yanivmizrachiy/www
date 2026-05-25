# 2026-05-25 — Final Product Rules and Roadmap V1 (docs only)

**Branch:** docs/final-product-rules-roadmap-v1-20260525
**Type:** documentation only
**Teacher Release:** NO (unchanged)

## Purpose

Consolidate the final product vision, core rules, and the 8-PR roadmap into a
single clear product-rules page, and point to it from PROJECT_RULES.md —
without touching any code, SQL, Supabase, .env, or Teacher Release.

## Files changed (3, docs/rules only)

- `docs/product/MOODLE_TEACHER_HUB_FINAL_PRODUCT_RULES_AND_ROADMAP_V1.md` (new):
  final vision, core rules, truth-separation, privacy, current capability
  truth, the 8-PR roadmap, protected features, working method.
- `PROJECT_RULES.md`: added ONE concise additive pointer block
  (MTH_FINAL_PRODUCT_RULES_ROADMAP_POINTER_20260525) after the existing
  end marker. No rewrite, no deletion of existing content.
- `STATE/progress/2026-05-25-final-product-rules-roadmap-v1.md` (this file).

## What this enables

- A single, clear source for the product vision + roadmap that the team and
  future PRs can align to.
- PROJECT_RULES.md now points to it, keeping one authoritative chain.

## What was NOT touched

- No src. No SQL. No Supabase. No .env. No deploy. No UI.
- No deletions anywhere. PROJECT_RULES.md existing content unchanged
  (only an additive block appended).
- Teacher Release remains NO. No truth values changed.

## Roadmap recorded (order)

1. Participants Teacher Roles + Privacy-Safe List
2. Task Type Visual System
3. Chapters → Tasks Premium Flow
4. Practice Time Truth UI
5. Premium Dashboard Teacher Counts
6. Reports Export Filters
7. Live Moodle Automation Expansion
8. Multi-Teacher Release Hardening

Principle: teacher-facing value (1-6) before automation expansion + release
hardening (7-8).

## Checks (docs-only PR — full suite still run for safety)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
