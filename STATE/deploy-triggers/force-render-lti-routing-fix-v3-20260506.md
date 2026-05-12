# Trigger Render deploy for LTI routing cache v3 — 2026-05-06

## Purpose

Trigger Render Auto Deploy after improving the automatic LTI routing/cache fix script to version v3.

## What v3 adds

```text
ltiRoutingFixVersion = 2026-05-06-render-lti-routing-cache-v3
no-store for API session endpoints
no-store for SPA index.html and fallback route
GET /api/lti/launch rescue route
POST /api/lti/launch 303 redirect to /lti?t=TOKEN&next=/import
safe LtiBootstrap next handling
```

## Expected health marker after Render deployment

```json
"ltiRoutingFixVersion": "2026-05-06-render-lti-routing-cache-v3"
```

## Success definition

```text
Moodle Teacher Hub opens from Moodle without the Hebrew NotFound screen and lands on the Import page.
```

## Still not verified

```text
Render deploy completion
Live health marker v3
Moodle UI after deploy
Real Participants import
```
