# LTI 1.3 Phase 3 Verified Session — 20260507-171227

## What changed

Added issuer/client/deployment/nonce checks for the separate LTI 1.3 test path.

If all checks pass, the app creates a real Moodle Teacher Hub session and redirects to:

```text
/lti?...&next=/import
```

## Verified live before this change

```text
signature.ok=true
issuer=https://moodlemoe.lms.education.gov.il
client/audience=WgIZjAqxrP2zFbz
deployment_id=3
role=Instructor
```

## Safety boundary

The existing LTI 1.0/1.1 endpoint remains unchanged:

```text
/api/lti/launch
```

No NRPS, AGS, or automatic Moodle data import is claimed yet.
