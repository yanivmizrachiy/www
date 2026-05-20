# Dynamic LTI Capability Probes Runtime V1

Status: implemented in PR candidate  
Teacher Release: NO

## Endpoint

`GET /api/automation/lti-capability-probes`

## Purpose

Classifies the current Moodle/LTI launch safely and dynamically for every teacher/context.

## Returns

- connected status
- launch mode
- LTI version signal
- context/course presence
- normalized key presence
- NRPS claim availability
- AGS claim availability
- Moodle Web Services configured/missing
- blocker keys
- next best action
- safety flags

## Does not return

- raw launch payload
- ID token
- tokens
- secrets
- student rows
- raw grades
- raw logs

## Product meaning

This moves the product from pilot validation toward dynamic automation for every Moodle context.