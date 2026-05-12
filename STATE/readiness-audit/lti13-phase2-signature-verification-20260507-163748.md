# LTI 1.3 Phase 2 Signature Verification — 20260507-163748

## What changed

Added real JWT signature verification for the separate LTI 1.3 test launch path.

The app now verifies `id_token` signatures using the Moodle platform JWKS endpoint.

## JWKS endpoint observed

```text
https://moodlemoe.lms.education.gov.il/mod/lti/certs.php
```

## Existing safe boundary

The existing LTI 1.0/1.1 endpoint remains unchanged:

```text
/api/lti/launch
```

## Still not claiming

```text
No full session creation yet.
No automatic student import yet.
No NRPS sync yet.
No AGS grade sync yet.
```

