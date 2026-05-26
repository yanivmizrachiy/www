# 2026-05-26 - Teacher Facing No Test Labels V1

**Branch:** fix/teacher-facing-no-test-labels-v1-20260526  
**Teacher Release:** NO (unchanged)  
**PR #127:** untouched  
**Scope:** teacher-facing label cleanup only  
**SQL:** not touched  
**Deploy:** not touched  
**Secrets / .env:** not touched  

## Purpose

Clean teacher-facing test/dev labels from the visible Moodle Teacher Hub experience and keep the teacher product name as:

**המודל החכם**

## Field evidence

Live Moodle screenshots showed teacher-facing/dev wording such as:

- Moodle Teacher Hub — LTI 1.3 Test
- LTI 1.3 Test
- technical Moodle/LTI wording visible in the teacher experience

The teacher-facing product must be clean, Hebrew, RTL, premium, and not look like a test tool.

## What changed

Applied exact safe replacements only:

- Moodle Teacher Hub — LTI 1.3 Test -> המודל החכם
- Moodle Teacher Hub – LTI 1.3 Test -> המודל החכם
- Moodle Teacher Hub - LTI 1.3 Test -> המודל החכם
- LTI 1.3 Test -> המודל החכם

## Files changed

- .\src\server.js


## What was not touched

- No .env
- No secrets
- No SQL
- No Supabase migrations
- No deploy
- No Teacher Release change
- PR #127 untouched
- LTI launch logic untouched
- Import/report behavior untouched
- No endpoint deletion

## Verification

The full 11 checks must pass before merge.

## Next safe step

Open PR, review diff, do not merge without explicit approval.
