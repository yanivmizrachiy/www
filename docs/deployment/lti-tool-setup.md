# Moodle LTI 1.1 Tool Setup

## Current goal
Create one real Moodle launch into the app and verify that the app saves a real capture.

## Required values
- Launch URL: `http://127.0.0.1:3000/lti/launch-1p1` for local testing only
- Consumer Key: from `.env`
- Shared Secret: from `.env`

## Moodle setup flow
1. Site administration
2. Plugins
3. Manage tools
4. Configure a tool manually
5. Enter Launch URL
6. Enter Consumer Key
7. Enter Shared Secret
8. Prefer launch in new window for now
9. Save
10. Add the tool inside a real course
11. Launch once as a teacher
12. Verify:
   - `/health`
   - `/api/launches`
   - `/api/moodle-summary`
   - `/api/moodle-captures`

## Important
Local host is not enough for real cross-system testing.
Next deployment step must provide a stable HTTPS URL.