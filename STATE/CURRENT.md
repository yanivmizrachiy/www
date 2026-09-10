# Current State — `yanivmizrachiy/www`

Last synchronized: 2026-09-10
Canonical branch: `main`
Teacher release: **NO**

## Canonical product split

- **Moodle Teacher Hub** → `https://www-tijc.onrender.com` (Render).
- **Guide** → `https://yanivmizrachiy.github.io/www/guide/` (GitHub Pages; generated from `main` to `deploy/guide-static`).
- Render does not publish or verify the Guide.
- `PROJECT_MEMORY.md` is the repository-wide canonical source of truth.
- `PROJECT_RULES.md` is the detailed Teacher Hub truth under that repository-wide contract.

## Guide current state

- Canonical deck: `src/data/guideDeck.ts`.
- Guide publication gates reject unpublished/missing-capture slides and invalid screenshot derivatives.
- Missing real screenshots remain `needs-capture`; no demo/placeholder substitution is allowed.
- Current missing-capture queue is documented in `docs/GUIDE_MISSING_CAPTURES.md`.

## Teacher Hub verified evidence snapshot

The following real-import evidence is retained from the last documented verification. It is historical evidence, not a claim that a new live validation was run on 2026-09-10:

```text
students = 62
grade_items_written = 243
grade_results_written = 1693
log_events_written = 89995
skipped_rows = 0
```

Verified truth flags from that evidence:

```text
fake_logs = false
empty_grades_saved_as_zero = false
teacher_release_changed = false
```

Practice-time truth gate:

```text
practice_time_available = false
blocker_key = NO_DURATION_FIELD
fake_time = false
window_estimation_enabled = false
```

Reason: the verified Moodle Logs report contained no explicit official duration field; no practice time may be invented from timestamp windows.

## Remaining Teacher Hub blockers retained from verified evidence

```text
multi_teacher_or_multi_course_isolation = not validated
teacher_release_ready = false
```

For dated proof and historical execution details, use `STATE/evidence-log.md` and the dated files under `STATE/`. Do not treat an old branch name or dated snapshot as the active branch/runtime unless `PROJECT_MEMORY.md` says so.
