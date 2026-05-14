# Moodle Teacher Hub — Teacher Release Final Gates

This document is the truth-first final release gate for Moodle Teacher Hub.

## Release rule

Teacher Release must remain NO / false until all required gates pass using real Moodle data.

No fake data.  
No mock students.  
No student rows in GitHub.  
No secrets in GitHub.  
No production SQL from chat.  
No Teacher Release YES without evidence.

## Automated live gate

Run:

npm run validate:teacher-release:live

The script checks only safe aggregate endpoints:

- /api/persistence/validate
- /api/release/readiness
- /api/lti/diagnostics
- /api/import/schema-diagnostics

It returns aggregate counts only and does not write data.

## Required gates

1. Live endpoints return valid JSON.
2. Supabase persistence is configured.
3. missing_tables is empty.
4. Import schema is compatible.
5. Moodle launch/session has been observed.
6. Real Participants import exists: students > 0 and import_batches > 0.
7. Real Gradebook import exists.
8. Real Logs import exists.
9. Multi-teacher or multi-course isolation is validated.
10. Repo/infra safety check is complete.

## Remaining manual work

The following cannot be completed automatically without real Moodle files/session:

- Export/import Participants.
- Export/import Gradebook.
- Export/import Logs.
- Validate two teachers or two courses with no data mixing.

## Decision

Until the live gate passes and real data exists:

Teacher Release: NO
