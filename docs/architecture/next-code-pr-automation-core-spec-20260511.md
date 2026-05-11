# Next Code PR Spec — Automation Core

## Purpose

The next real code PR must create the foundation for maximum automation.

## Do not do

- Do not redesign all UI at once.
- Do not delete existing routes.
- Do not start a new app.
- Do not add fake data.
- Do not make inactive buttons look active.

## Implement

### 1. Capability model

Create a typed capability model for:

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

### 2. Sync status endpoint

Add a safe endpoint that returns aggregate sync/capability status only.

No student names.
No emails.
No secrets.
No tokens.

### 3. Frontend hook

Create a hook for sync status.

### 4. Dashboard command center

Upgrade the dashboard with:

- `סנכרן מרחב`
- premium feature buttons
- feature gates
- missing data explanations

### 5. Feature gates

Each button must show:

- active if available,
- missing report if needed,
- blocked if no permission,
- planned if not implemented.

## Validation

Run:

- npm run check
- npm run build

## Evidence

Add aggregate-only evidence under STATE.
