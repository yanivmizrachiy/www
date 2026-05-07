# LTI 1.3 live diagnostics evidence — 2026-05-07

## Scope

This evidence records the current safe LTI 1.3 diagnostic state for Moodle Teacher Hub.

This does not prove full LTI 1.3 launch, NRPS roster sync, or AGS grade sync.

## Live Render checks

Base URL:

```text
https://www-tijc.onrender.com
```

Observed live status:

```text
live_health_ok=true
live_lti13_status_seen=true
live_lti13_config_seen=true
live_lti13_jwks_expected=true
```

## Latest Termux build/live final hints

Source report:

```text
/data/data/com.termux/files/home/storage/downloads/YANIV_LTI13_BUILD_LIVE_CHECK_20260507-135617.txt
```

```text
=== FINAL DECISION HINTS ===
npm_ci_ok=true
build_ok=true
local_health_ok=true
local_lti13_status_ok=true
local_lti13_config_ok=true
local_lti13_jwks_expected=true
live_health_ok=true
live_lti13_status_seen=true
live_lti13_config_seen=true
live_lti13_jwks_expected=true
LOCAL_LTI13_DIAGNOSTICS_READY=true
RENDER_DEPLOY_HAS_LTI13_DIAGNOSTICS=true
YANIV_LTI13_BUILD_LIVE_CHECK_DONE
Report: /data/data/com.termux/files/home/storage/downloads/YANIV_LTI13_BUILD_LIVE_CHECK_20260507-135617.txt
FINAL_DECISION_HINTS_COPIED_TO_CLIPBOARD
```

## Truth boundary

Verified:

```text
LTI 1.3 diagnostic endpoints are present on Render if live_lti13_status_seen=true and live_lti13_config_seen=true.
The existing LTI 1.0/1.1 route remains separate.
```

Not verified:

```text
OIDC login
JWT launch validation
NRPS / automatic participant sync
AGS / automatic grade sync
Moodle Web Services API
```

## Safety decision

Do not replace the working Moodle Teacher Hub LTI 1.0/1.1 tool.

Any LTI 1.3 testing must use a separate Moodle tool:

```text
Moodle Teacher Hub — LTI 1.3 Test
```
