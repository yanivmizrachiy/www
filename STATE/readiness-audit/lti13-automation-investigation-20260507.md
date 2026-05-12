# LTI 1.3 automation investigation — 2026-05-07

## Current verified stable path

The existing Moodle Teacher Hub tool is configured and verified as an LTI 1.0/1.1 external tool using:

```text
https://www-tijc.onrender.com/api/lti/launch
```

The current working path is:

```text
Moodle LTI 1.0/1.1 launch
-> Render service www
-> React app opens inside Moodle
-> Import / ייבוא נתונים screen appears
```

This path must not be broken.

## Newly discovered Moodle facts from screenshots

The Moodle tool configuration screen shows that the platform offers:

```text
LTI 1.0/1.1
LTI 1.3
```

When exploring the LTI 1.3/tool settings area, the Moodle UI shows service controls including:

```text
סינכרון תתי-מטלות וציונים
סינכרון וניהול משתמשים
```

The UI also shows privacy controls:

```text
שתפו שם המשתמש עם הכלי החיצוני: אף פעם / תמיד
שתפו כתובת הדוא״ל של המשתמש עם הכלי החיצוני: אף פעם / תמיד
קבלת ציונים מהכלי החיצוני: אף פעם / תמיד / As specified in Deep Linking definition or Delegate to teacher
```

These facts mean a real LTI 1.3 / LTI Advantage investigation is justified.

## What this does NOT prove yet

The screenshots do not yet prove that the current application can automatically pull users or grades.

The current code is still mainly LTI 1.0/1.1 and import-first. Repository search found no existing LTI 1.3/OIDC/JWKS/NRPS/AGS implementation.

Therefore automatic roster or grade sync is not yet implemented.

## External standard context

LTI Advantage can include:

```text
Names and Role Provisioning Services (NRPS) — user/role roster access
Assignment and Grade Services (AGS) — grade/assignment exchange
Deep Linking — content selection and placement
```

But these services require an LTI 1.3 security flow and must be implemented by the tool application before Moodle can use them.

## Safety decision

Do not convert the existing working Moodle Teacher Hub tool from LTI 1.0/1.1 to LTI 1.3 in-place.

Do not save LTI 1.3 changes on the existing working tool.

The correct safe path is parallel testing:

```text
Keep existing Moodle Teacher Hub working as LTI 1.0/1.1.
Build a separate LTI 1.3 readiness path in code.
Then create a separate Moodle tool named:
Moodle Teacher Hub — LTI 1.3 Test
```

## Required app-side components before real LTI 1.3 testing

A safe implementation should add new endpoints without removing LTI 1.0/1.1:

```text
/api/lti13/login       — OIDC login initiation endpoint
/api/lti13/launch      — LTI 1.3 JWT launch endpoint
/api/lti13/jwks        — public JWKS endpoint for tool keys
/api/lti13/config      — human-readable configuration helper
/api/lti13/status      — readiness/status endpoint
/api/lti13/nrps-check  — only after launch token/service claims are available
/api/lti13/ags-check   — only after launch token/service claims are available
```

The existing endpoint must remain unchanged:

```text
/api/lti/launch
```

## Required secrets/configuration before production use

LTI 1.3 requires new configuration separate from the LTI 1.0/1.1 shared secret:

```text
LTI13_PRIVATE_KEY_PEM
LTI13_KEY_ID
LTI13_ISSUER or platform issuer discovered from Moodle
LTI13_CLIENT_ID from Moodle registration
LTI13_DEPLOYMENT_ID from Moodle registration
LTI13_AUTH_LOGIN_URL
LTI13_TOKEN_URL
LTI13_PLATFORM_JWKS_URL
```

Do not commit private keys or secrets to GitHub.

## Minimal success criteria for the LTI 1.3 track

The LTI 1.3 path is not considered successful until all are proven:

```text
1. /api/lti13/status reports configured=false/partial/true honestly.
2. Moodle can launch the separate LTI 1.3 Test tool without breaking the LTI 1.1 tool.
3. The launch JWT validates against Moodle platform keys.
4. The launch includes NRPS / membership service claim or a clear absence signal.
5. If NRPS claim exists, the app can call it and receive real user/role data.
6. Only after real NRPS data exists may the app show automatic roster sync as available.
```

## Current project status after this discovery

```text
LTI 1.0/1.1 launch: working
Import screen: working
Manual file import path: working UI, data import still needs file verification
LTI 1.3 option in Moodle: discovered
User/grade sync service controls in Moodle UI: discovered
LTI 1.3 implementation in app: not yet implemented
Automatic roster sync: not yet proven
Automatic grade sync: not yet proven
```

## Next safe action

Prepare app-side LTI 1.3 diagnostic/readiness endpoints only if doing so is non-breaking and clearly separated from the existing LTI 1.0/1.1 path.

No Moodle setting should be saved until the app exposes and verifies LTI 1.3 readiness endpoints.
