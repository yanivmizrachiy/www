# Automation-First Product Execution Plan — Moodle Teacher Hub

## Core decision

The product must not restart from scratch.

The existing Moodle Teacher Hub already passed major barriers and must be upgraded, not replaced.

Existing assets that must be reused:

- LTI 1.3 launch work.
- NRPS membership work.
- real Participants import.
- students page with real imported names/emails.
- existing Dashboard route.
- existing Students route.
- existing Tasks route.
- existing Chapters route.
- existing Grades route.
- existing Activity/Time route.
- existing Reports route.
- existing Export route.
- existing Import route.
- existing governance, docs, scripts, and persistence planning.

## Product principle

The teacher does the minimum.

The system does the maximum.

Manual teacher action is considered a product problem unless Moodle permissions make automation impossible.

## Teacher Action Budget

Ideal teacher flow:

1. Teacher opens the tool from Moodle.
2. Teacher clicks `סנכרן מרחב`.
3. Teacher sees what the system collected automatically.
4. If blocked, teacher receives one exact instruction for one exact Moodle report.

The teacher must not need to understand:

- NRPS.
- AGS.
- Moodle Web Services.
- Supabase.
- JSON.
- GitHub.
- API tokens.
- database schema.
- column mapping, unless automatic mapping failed.

## Automation Core

The next real code milestone is Automation Core.

Automation Core contains:

1. Capability Detector.
2. Sync Engine.
3. Sync Status Endpoint.
4. Missing Data Explainer.
5. Teacher Action Minimizer.
6. Feature Gates for every button.
7. Dashboard command center model.

## Capability Detector

The app must detect these domains:

- lti_session
- nrps_participants
- participants_names_emails
- course_sections
- course_tasks
- grade_items
- grade_results
- logs
- practice_time
- reports
- export
- persistence

Each domain must have one status:

- automatic
- available_from_import
- missing_required_report
- blocked_no_permission
- not_implemented_yet

Every status must include:

- source
- confidence
- last_checked_at
- teacher_message_he
- next_action_he
- required_report_type if needed

## Sync Engine

The `סנכרן מרחב` button must run the sync engine.

Order:

1. Verify LTI session.
2. Check current persisted course context.
3. Check NRPS participants.
4. Check Moodle Web Services only if real token exists.
5. Check AGS only if Moodle exposes grade services.
6. Check existing persisted imports.
7. Determine missing reports.
8. Present one prioritized next action.

The sync engine must never fake success.

## Feature Gates

Every main button must ask the Capability Detector before acting.

Main buttons:

- `סנכרן מרחב`
- `משימות`
- `משתתפים`
- `ציונים`
- `זמנים`
- `דוחות`
- `ייצוא`
- `מה חסר?`

Button behavior:

- If data exists: open feature.
- If report is missing: show exact report needed.
- If permission is blocked: explain permission issue.
- If feature is not implemented: show planned status, not active fake UI.

## Dashboard command center

The existing Dashboard must become the premium command center.

Required sections:

- teacher/course identity
- sync status
- big premium buttons
- data availability cards
- missing data explanation
- last sync evidence
- next action for teacher
- no demo status

## Data modules

### Participants

Sources:

- NRPS
- Participants import
- future Moodle WS if available

Must support:

- students
- instructors
- search
- filters
- profile
- reports
- NRPS ↔ Participants matching

### Tasks and chapters

Sources:

- Moodle Web Services if available
- Activity Completion report
- Course structure report
- imported/pasted real Moodle table

Must support:

- real chapters
- real tasks
- task type
- due date
- completion count
- grade average if available
- task report

### Grades

Sources:

- Gradebook export
- AGS
- Moodle Web Services

Must support:

- grades by task
- grades by student
- highest grade
- averages
- missing submissions
- Excel
- PDF
- WhatsApp helper

Missing grade is not zero.

### Time and logs

Sources:

- Logs report
- official Moodle time fields if available

Must support:

- daily time
- accumulated time
- tasks done during time
- student time report
- class time report

If logs are missing: `נדרש דוח Logs ממודל`.

## Done rules

A feature is Done only if:

- real data source exists,
- UI works,
- empty state exists,
- missing-data state exists,
- build passes,
- no demo fallback,
- no fake data,
- no private data committed,
- STATE evidence updated.

## Current progress estimate

- Moodle/LTI/NRPS/Participants infrastructure: 70%.
- Final product readiness: 30%.
- Broad teacher readiness: 20%.
- Automation-first vision implementation: 25%.
- Premium UI implementation: 15%.

## Immediate next implementation

The next code PR must implement:

1. Capability model.
2. `/api/sync/status` or equivalent.
3. Sync status hook.
4. Premium dashboard button model.
5. `סנכרן מרחב` button.
6. Feature gates.
7. Hebrew missing-data explanations.

No full redesign before Automation Core.
