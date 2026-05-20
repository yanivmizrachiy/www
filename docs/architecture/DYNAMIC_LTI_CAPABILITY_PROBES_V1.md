# Dynamic LTI Capability Probes V1

Status: implementation planning  
Teacher Release: NO

## Product goal

Maximum real automation for every teacher and every Moodle context.

## Rule

Course 259 is live validation evidence only. Production must be dynamic.

## Required capability probes

For every launch/context, safely classify:

- LTI context
- NRPS claim availability
- AGS claim availability
- Moodle Web Services configured / missing
- Manual Smart Import available
- Activity Completion / Course Structure status
- Teacher Release gate

## Output style

Public diagnostics must return only:

- booleans
- status labels
- counts
- next actions

They must not return:

- raw student rows
- tokens
- secrets
- full private launch payloads
- raw grades
- raw logs

## Data isolation

Every future import/sync must bind to:

- platform key
- context key
- user key where relevant
- import batch id
- source provenance

## Next

Use the deep audit JSON as the source for the next coding PR.