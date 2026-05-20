# Activity Completion / Manual Smart Import Readiness V1

## Purpose

This document defines a safe readiness layer for importing Moodle Activity Completion / Progress reports into Moodle Teacher Hub.

This is a readiness/spec/audit layer. It does not claim full automatic sync.

## Current verified truth

- Moodle LTI launch works.
- The current Moodle context/course is detected dynamically.
- Course `259` is pilot evidence only and must never become the product basis.
- NRPS is missing.
- AGS is missing.
- Moodle Web Services are missing.
- `courseStructure=false`.
- Participants / Gradebook / Logs imports already exist and are protected.
- Teacher Release must remain **NO**.

## Suitable report

A suitable report is a real Moodle report/table representing one of:

- Activity Completion
- Completion Progress
- Progress report
- Completion matrix
- Learner/activity completion status

Positive signals:

- learner/student/user information exists.
- activity/task/module information exists.
- completion/status/progress information exists.
- the report is connected to the current Moodle course/context.
- the report may be row-based or matrix-based.

## Not suitable

Reject or classify as not suitable:

- Gradebook export
- Participants export
- Logs export
- random table
- screenshot-only evidence
- PDF-only evidence
- table containing only grades/totals
- table containing only log events/actions/components
- roster/list of students without activity completion signals

## Supported formats for V1 readiness

Supported:

- CSV
- XLSX
- HTML table

Deferred unless safely implemented later:

- ODS
- pasted free text
- screenshots
- PDF

## Header aliases

### learner

- תלמיד
- לומד
- משתמש
- שם
- שם מלא
- Student
- User
- Learner
- Participant
- Name
- Full name

### activity

- פעילות
- משימה
- רכיב
- מודול
- שם פעילות
- Activity
- Task
- Module
- Item
- Activity name
- Module name

### completion

- השלמה
- הושלם
- הושלמה
- מצב השלמה
- סטטוס השלמה
- התקדמות
- Completion
- Completed
- Completion status
- Status
- Progress

### completedAt

- תאריך
- שעה
- תאריך השלמה
- הושלם בתאריך
- Date
- Time
- Completed at
- Completion date
- Last modified

### group

- קבוצה
- קבוצות
- Group
- Groups

### grade

- ציון
- ניקוד
- Grade
- Score

A grade field may appear in some reports, but grade-only reports must not be treated as completion reports.

### section

- נושא
- יחידה
- פרק
- Section
- Topic
- Unit
- Chapter

## Detection rules

A report can be classified as Activity Completion / Progress if at least one strong pattern exists:

1. learner + activity + completion headers
2. learner rows with activity columns and completion/status cells
3. activity rows with learner and completion/status fields
4. multiple completion/progress keywords together with activity-like fields

Reject likely non-matching reports:

- Gradebook: many grade item columns, total/course total, numeric-grade dominant layout
- Logs: event, component, action, description, origin, logreader, IP-like fields
- Participants: role, enrolment, last access, group roster without completion signals

## Validation contract

### Input

- uploaded file or table
- current LTI context
- selected report type if provided
- optional teacher confirmation for ambiguous mappings

### Output

The validation response must return:

- detectedReportType
- confidence
- requiredColumnsFound
- missingColumns
- rowCount
- activityCount
- learnerCount
- hasCompletionSignals
- hasCourseStructureSignals
- canImport
- cannotImportReasons
- safetyWarnings
- provenance
- normalizedPreview

## Normalized preview contract

The preview must be sanitized and may include:

- rowCount
- learnerCount
- activityCount
- completionStatesSeen
- activitySamples without student identity
- sectionSamples without student identity
- missingColumns
- safetyWarnings
- confidence

The preview must not return:

- no raw student rows
- emails
- personal identifiers
- raw grades
- raw logs
- raw source file content
- tokens, cookies, secrets, or headers

## Context binding

No import may proceed without current context.

Every future persisted row must include:

- platform_key
- context_key
- import_batch_id
- source_provenance
- observed_at
- row_fingerprint

If context cannot be resolved, the upload must remain rejected or pending manual confirmation and must not update production state.

## Provenance

Allowed source provenance values for future ingestion:

- manual_activity_completion_csv
- manual_activity_completion_xlsx
- manual_activity_completion_html
- manual_progress_csv
- manual_progress_xlsx
- manual_progress_html

Rows without `source_provenance` must be rejected.

## State gating

### `courseStructure=true`

Allowed only after real validated structure evidence is imported and persisted.

Required evidence may include:

- course_sections
- course_modules
- course_tasks
- activity/module identifiers
- valid import_batch_id
- valid source_provenance
- valid context_key

Never set `courseStructure=true` based on:

- preview only
- filename only
- course 259 only
- fake/demo data
- UI assumption
- incomplete report

### `completionAvailable=true`

Allowed only after validated completion evidence exists.

### `activityCompletionImported=true`

Allowed only after:

- validation passed
- current context exists
- import_batch_id exists
- source_provenance exists
- normalized data was persisted successfully

Preview alone must never set `activityCompletionImported=true`.

## Privacy rules

Public endpoints, diagnostics and previews must not expose:

- student rows
- emails
- raw grades
- raw logs
- raw launch payloads
- secrets
- cookies
- tokens

## V1 boundary

This V1 does not build:

- NRPS live probe
- AGS live probe
- Moodle Web Services connector
- runtime full importer
- automatic Moodle sync
- Teacher Release YES

Teacher Release remains **NO**.
