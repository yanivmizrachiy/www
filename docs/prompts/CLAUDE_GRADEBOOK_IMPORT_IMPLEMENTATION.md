# Claude Code Prompt — Implement Gradebook Import After Participants

Repository: yanivmizrachiy/www

Do not use fake data.
Do not commit student rows.
Do not commit grade rows.
Do not commit secrets.
Do not run production SQL from code.
Do not set Teacher Release YES.

## Verified prerequisite

Continue only if live checks show:

students > 0
import_batches > 0

## Goal

Implement real Moodle Gradebook import support.

## Requirements

1. Preserve existing Participants import.
2. Do not break `/api/import` for students.
3. Add Gradebook support only for real uploaded/pasted Moodle Gradebook data.
4. Map grade items into `grade_items`.
5. Map grade results into `grade_results`.
6. Missing grades must remain missing, not 0.
7. If a grade row cannot be matched to a student, keep provenance and report aggregate skipped/unmatched count only.
8. Public diagnostics must return aggregate counts only.
9. UI must clearly say what was imported and what was skipped.
10. Run build/check/doctor before PR.

## Output format

STATUS:
DONE:
FILES_CHANGED:
CHECKS:
PR:
BLOCKERS:
NEXT:
PERCENT:
