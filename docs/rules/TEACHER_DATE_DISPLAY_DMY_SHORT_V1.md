# Permanent UI Rule — Teacher-facing date display

Every date visible to teachers in Moodle Teacher Hub must use this short numeric format:

`D/M/YY`

Required example:

`5/3/26`

## Scope

This applies to teacher-facing UI only:

- dashboards
- cards
- tables
- reports
- status screens
- visual exports

## Boundaries

This is a presentation-only rule.

Do not change database storage, API payloads, technical logs, evidence files, machine-readable state files or internal timestamps only for this display rule.

## Implementation

Use a central UI helper for teacher-facing dates.

Do not scatter custom date formatting across components.
