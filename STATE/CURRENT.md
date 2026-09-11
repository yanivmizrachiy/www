# Repository Current State — 2026-09-11

Canonical branch: \main\

## Live surfaces

- Teacher Hub: \https://www-tijc.onrender.com\
- Guide: \https://yanivmizrachiy.github.io/www/guide/\

Teacher Release: **NO**

## Product separation

Teacher Hub and Guide are separate products.

- Render owns Teacher Hub availability.
- GitHub Pages owns Guide publication.
- Render must not publish or validate Guide.

## Verified data truth retained

\\\	ext
students = 62
grade_items_written = 243
grade_results_written = 1693
log_events_written = 89995
skipped_rows = 0
\\\

## Truth gates

\\\	ext
fake_logs = false
empty_grades_saved_as_zero = false
teacher_release_changed = false
practice_time_available = false
blocker_key = NO_DURATION_FIELD
fake_time = false
window_estimation_enabled = false
\\\

## Guide

Guide publication is evidence-gated.

Missing real screenshots remain hidden as \
eeds-capture\.
No fake screenshot, duplicate substitute or invented control may be published.

## Current truth hierarchy

1. \PROJECT_MEMORY.md\ — Guide + cross-product decisions.
2. \PROJECT_RULES.md\ — Teacher Hub product truth.
3. \RULES.md\ — repository boundary.
4. \STATE/*\ — evidence/history/current snapshots.

Historical STATE files remain evidence and must not be interpreted as current branch/runtime declarations.