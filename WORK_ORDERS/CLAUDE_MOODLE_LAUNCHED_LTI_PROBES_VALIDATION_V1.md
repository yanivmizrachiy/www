# Work Order: Moodle-Launched LTI Capability Probes Validation V1

Teacher Release: NO

## Mission

Validate GET /api/automation/lti-capability-probes after launching Teacher Hub from Moodle.

## Precondition

Direct-browser live validation passed.

## Manual input required

A teacher must open Teacher Hub from Moodle, then fetch:

https://www-tijc.onrender.com/api/automation/lti-capability-probes

## Required output to GPT

Send only the JSON response.

Do not send screenshots containing student names, emails, tokens, or private rows.

## GPT decision rules

If services.nrps.status is eady_for_safe_probe, prepare Safe NRPS Read-Only Probe V1.

If services.ags.status is eady_for_safe_probe, prepare Safe AGS Read-Only Probe V1.

If both are missing, do not build NRPS/AGS probe yet. Move to Activity Completion / Manual Smart Import or Moodle Web Services configuration.

## Protected pipelines

Do not change:

- Participants import
- Gradebook import
- Logs import
- Supabase migrations
- Teacher Release gate

Teacher Release remains NO.