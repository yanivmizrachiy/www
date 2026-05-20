# Progress — Live LTI Capability Probes direct-browser validation

Date: 2026-05-20  
Teacher Release: **NO**

## What was validated

The live Render endpoint exists and responds:

GET /api/automation/lti-capability-probes

## Expected direct-browser behavior

When opened directly, outside Moodle, the endpoint should not invent a Moodle session.

Expected safe behavior:

- connected=false or launchMode=direct
- no raw launch payload
- no tokens
- no secrets
- no student rows
- no raw grades
- no raw logs

## Result

Live endpoint responded and passed the basic safety screen.

## What this proves

PR #111 is live enough for direct endpoint validation.

## What this does not prove

This does not yet prove NRPS/AGS availability, because NRPS/AGS must be tested after opening Teacher Hub from Moodle.

## Next step

Open Teacher Hub from the real Moodle course, then fetch:

https://www-tijc.onrender.com/api/automation/lti-capability-probes

The next decision depends on:

- services.nrps.status
- services.ags.status

If either is eady_for_safe_probe, proceed to Safe NRPS / AGS Read-Only Probe V1.

If both are missing, proceed toward Activity Completion / Manual Smart Import or Moodle Web Services if an authorized token exists.