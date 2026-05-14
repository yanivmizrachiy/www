# Moodle Teacher Hub — Final Manual Import Runbook

This runbook defines the remaining manual actions that cannot be automated without a real Moodle course session and real Moodle reports.

## Rule

No fake data.
No mock students.
No student rows in GitHub.
No secrets in GitHub.
No production SQL from chat.
Teacher Release remains NO until all live gates pass.

## Current automatic status

Run:

npm run validate:imports:live
npm run validate:teacher-release:live

## Manual import order

### 1. Participants

Goal:

students > 0
import_batches > 0

Steps:

1. Open Moodle Teacher Hub from the real Moodle course.
2. Press Ctrl+F5.
3. Go to import page.
4. Choose the Participants file exported from Moodle.
5. Confirm import.

If import fails, use the button:

העתק פרטי שגיאה בטוחים

Paste the copied JSON into the work chat.

### 2. Gradebook

Start only after Participants is persisted.

Goal:

grade_items > 0
grade_results > 0

### 3. Logs

Start only after Participants is persisted.

Goal:

log_events > 0

Logs are required for truthful practice-time reporting.

### 4. Isolation validation

Validate at least:

- Two teachers, or
- Two Moodle spaces/courses

Goal: no mixing of students, grades, tasks, or logs.

## Release decision

Teacher Release can become YES only when the live gate confirms all required gates.
