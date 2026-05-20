# Work Order: Safe NRPS / AGS Read-Only Probe V1

Teacher Release: NO

## Mission

After `GET /api/automation/lti-capability-probes` exists, implement the next safe step: read-only capability probes for NRPS and AGS when claims are available.

## Rules

- Do not return student rows.
- Do not return raw grade rows.
- Do not return secrets or raw launch payloads.
- Do not rewrite the app.
- Do not touch Participants / Gradebook / Logs import unless a verified bug requires it.
- Do not mark Teacher Release YES.

## Build target

If NRPS claim exists, add safe probe that reports:

- reachable true/false
- status code class
- members count only, if permitted
- no names, no emails, no identifiers in public response

If AGS claim exists, add safe probe that reports:

- lineitems endpoint reachable true/false
- lineitems count only, if permitted
- no raw grade data in public response

## Required checks

- npm run audit:moodle-automation
- npm run audit:multi-teacher-safety
- npm run audit:deep-launch-context
- npm run audit:lti-probes
- npm run check
- npm run build
- npm run doctor

Open one PR and stop.