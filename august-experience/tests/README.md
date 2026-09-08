# August Experience — Fixture Test Harness

Purpose: validate Moodle detection/adaptation against sanitized HTML captured from authorized real Moodle pages before Teacher Release.

## Rules

- Never commit passwords, session cookies, CSRF tokens, student names, emails, IDs, grades, submissions or free-text content containing personal data.
- Fixtures must be sanitized before entering the repository.
- A fixture represents only the minimum DOM structure required to test selectors and rendering decisions.
- Student fixtures must prove that August remains inactive.
- Unsupported fixtures must prove fail-open behavior.

## Planned fixture set

1. `teacher-course-standard.html` — authenticated teacher course landing page.
2. `teacher-course-alternate-format.html` — second verified Ministry course format.
3. `student-course-standard.html` — same course shape without teacher capability controls.
4. `unsupported-page.html` — non-course Moodle page.
5. `course-empty.html` — course surface with no extractable sections.

## Required assertions

For teacher fixtures:

- `detectContext().isCourse === true`
- teacher capability evidence is present
- context confidence meets the supported threshold
- `moodle-course-v1` is selected
- extracted model has a course title and sections
- compatibility score is at or above render threshold
- no write action is performed

For student fixtures:

- teacher capability is not verified
- August shell does not mount
- native Moodle remains untouched

For unsupported/ambiguous fixtures:

- compatibility must reject or bootstrap must decline
- native Moodle remains available

## Status

Harness contract is defined. Real fixtures are intentionally not fabricated. The next fixture files must come from sanitized, authorized Ministry Moodle evidence.
