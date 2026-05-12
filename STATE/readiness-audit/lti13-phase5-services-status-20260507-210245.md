# LTI 1.3 Phase 5 — Live Services Status Endpoint

Date: 20260507-210245

Added a live diagnostic endpoint:

/api/lti13/services-status

Purpose:
- Show whether the latest real Moodle LTI 1.3 launch session includes NRPS service claims.
- Show whether it includes AGS service claims.
- Avoid fake automatic-sync claims.

This does not fetch students or grades yet.
It prepares the next safe step: implement real NRPS fetch only if Moodle sends the required service URL.
