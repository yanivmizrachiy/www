# Claude Code Prompt — After Participants Import Succeeds

You are working in repository yanivmizrachiy/www.

Do not use fake data.
Do not commit student rows.
Do not commit secrets.
Do not run production SQL.
Do not set Teacher Release YES.

## Verified prerequisite

Only continue if live checks show:

students > 0
import_batches > 0

## Next task

Implement the next real-data import path in this order:

1. Gradebook import support.
2. Logs import support.
3. Practice-time summaries from real logs only.

## Rules

- Use only real Moodle reports.
- If data is missing, UI must say it is missing.
- Do not invent grades, tasks, logs, or practice time.
- Preserve provenance: teacher, course, source file/report, import batch, import time.
- Public diagnostics must return aggregate counts only.
- Run build/check/doctor before PR.

## Output

STATUS:
DONE:
FILES_CHANGED:
CHECKS:
PR:
BLOCKERS:
NEXT:
PERCENT:
