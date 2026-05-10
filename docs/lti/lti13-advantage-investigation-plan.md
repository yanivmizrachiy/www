# LTI 1.3 Advantage Investigation Plan

Updated: 2026-05-07
Repository: `yanivmizrachiy/www`
Project: Moodle Teacher Hub

## Purpose

This document separates the stable working Moodle Teacher Hub path from the new LTI 1.3 / LTI Advantage investigation path.

The goal is to explore whether automatic Moodle data access is possible without breaking the existing working LTI 1.0/1.1 tool.

## Non-negotiable safety rule

Do not modify or replace the existing working Moodle tool configuration in-place.

The current working path remains:

```text
Moodle External Tool
-> LTI 1.0/1.1
-> https://www-tijc.onrender.com/api/lti/launch
-> Moodle Teacher Hub opens inside Moodle
-> Import screen works
```

No LTI 1.3 setting should be saved on the current working tool until a separate test tool has been created and verified.

## Current stable path

| Area | Current status |
|---|---|
| Moodle tool type | External LTI tool |
| Current LTI version | LTI 1.0/1.1 |
| Current endpoint | `/api/lti/launch` |
| Runtime | Render `https://www-tijc.onrender.com` |
| App opening inside Moodle | Verified by user screenshots |
| Import page | Verified by user screenshots |
| Automatic roster sync | Not verified |
| Automatic grade sync | Not verified |

## New Moodle discoveries from user screenshots

Screenshots from 2026-05-07 show that the Moodle tool configuration UI offers:

```text
LTI 1.0/1.1
LTI 1.3
```

When LTI 1.3 is selected temporarily without saving, the UI shows technical fields:

```text
Client ID
Public key type
Public keyset
Initiate login URL
Redirection URI(s)
```

The `Public key type` option shown is:

```text
Keyset URL
```

This implies the tool must expose a public JWKS/keyset URL before a real LTI 1.3 launch can work.

## Services discovered in Moodle UI

The Moodle UI shows a Services section with at least two relevant services:

```text
סינכרון תתי-מטלות וציונים
סינכרון וניהול משתמשים
```

Observed options for grade/sub-assignment sync include:

```text
אל תשתמשו בשירות זה
השתמשו בשירות זה לסינכרון ציונים בלבד
השתמשו בשירות זה לסינכרון ציונים וניהול פריטי ציון בגיליון הציונים הראשי של הקורס
```

Observed options for user sync / user management include:

```text
אל תשתמשו בשירות זה
השתמשו בשירות זה
השתמשו בשירות זה לאיחזור מידע אודות משתמשים, מותנה בהגדרות פרטיות
```

These options justify a serious LTI 1.3 Advantage investigation.

## Privacy controls discovered

The Privacy section currently shows:

```text
שתפו שם המשתמש עם הכלי החיצוני: אף פעם / תמיד
שתפו כתובת הדואר של המשתמש עם הכלי החיצוני: אף פעם / תמיד
קבלת ציונים מהכלי החיצוני: אף פעם / תמיד / As specified in Deep Linking definition or Delegate to teacher
SSL required: checked
```

Current screenshot evidence shows the name and email sharing defaults as:

```text
אף פעם
```

This may limit usefulness of user synchronization unless changed in a controlled test tool.

## Current missing screenshots / evidence

Before implementing a full LTI 1.3 path, the following must still be captured from Moodle:

```text
1. Full LTI 1.3 technical fields from top to bottom.
2. Whether Moodle shows Deployment ID / מזהה פריסה.
3. Whether Moodle shows Platform ID / Issuer.
4. Full red validation message at the bottom of the form.
5. Any additional fields under הגדרות נוספות.
6. Final chosen options for user sync, grade sync, and privacy — in a separate test tool only.
```

## Required app-side components for LTI 1.3

The app must support these endpoints before real testing:

```text
/api/lti13/status
/api/lti13/config
/api/lti13/jwks
/api/lti13/login
/api/lti13/launch
```

The current diagnostic endpoints are allowed to exist while returning honest `not implemented` states.

A real implementation later requires:

```text
OIDC login initiation
state/nonce storage
JWT launch validation
platform JWKS verification
client/deployment matching
access token request
NRPS membership call if service claim exists
AGS calls only if grade service claim exists
```

## Separate test tool requirement

Any real LTI 1.3 experiment must use a separate Moodle tool named:

```text
Moodle Teacher Hub — LTI 1.3 Test
```

The existing tool named `Moodle Teacher Hub` must remain on LTI 1.0/1.1 until the new tool is proven.

## Truth boundaries

Allowed to say now:

```text
Moodle UI shows LTI 1.3 and service controls that may support automatic users/grades.
```

Not allowed to say yet:

```text
Automatic student sync works.
Automatic grade sync works.
LTI 1.3 launch works.
NRPS works.
AGS works.
```

## Decision tree

If Moodle provides a usable user sync / membership service claim after LTI 1.3 launch:

```text
Implement NRPS roster sync and use it to reduce or remove manual Participants import.
```

If Moodle does not provide user sync service access:

```text
Keep Participants import as the real path and improve it as much as possible.
```

If Moodle provides grade service access:

```text
Investigate whether AGS can read/update relevant grade data for this tool.
```

If AGS only supports tool-owned line items/scores:

```text
Do not claim full Moodle Gradebook sync. Keep Gradebook report import for existing Moodle grades.
```

## Current state

```text
Stable LTI 1.0/1.1 path: preserved
LTI 1.3 possibility: discovered
LTI 1.3 diagnostics in repo: started
Full LTI 1.3 implementation: not started / not verified
Automatic roster sync: not proven
Automatic grade sync: not proven
```
