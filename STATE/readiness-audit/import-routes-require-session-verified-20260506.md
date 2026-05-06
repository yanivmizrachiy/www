# Import routes session protection verified — 2026-05-06

## Purpose

Document endpoint-level verification that the new Render-first import routes are deployed and protected by verified Moodle/LTI session requirement.

## Verified from user PowerShell output

Base URL:

```text
https://www-tijc.onrender.com
```

### GET `/api/imports/students` without session

Command attempted:

```powershell
Invoke-RestMethod "https://www-tijc.onrender.com/api/imports/students" -TimeoutSec 30
```

Observed response:

```text
401
```

```json
{
  "ok": false,
  "error": "NO_VERIFIED_MOODLE_SESSION"
}
```

### POST `/api/import` without session

Command attempted:

```powershell
Invoke-RestMethod "https://www-tijc.onrender.com/api/import" -Method POST -ContentType "application/json" -Body '{"report_type":"students","payload":[]}' -TimeoutSec 30
```

Observed response:

```text
401
```

```json
{
  "ok": false,
  "error": "NO_VERIFIED_MOODLE_SESSION"
}
```

## Truth status

```text
/api/imports/students route exists on Render: verified
/api/import route exists on Render: verified
Routes reject unauthenticated access: verified and expected
Security behavior: correct
Real import with verified Moodle session: not yet verified
Students page real names: not yet verified
```

## Interpretation

The 401 response is not a failure. It proves the routes are deployed and require a real Moodle/LTI session token or session cookie.

The next test must be performed from inside Moodle Teacher Hub after a real Moodle launch, because that is where the LTI session token exists.

## Next required verification

Inside Moodle:

```text
Moodle -> Moodle Teacher Hub -> Import page -> Participants report -> confirm import -> Students page shows real names
```

Do not test real import from plain PowerShell without session unless a safe temporary test endpoint is intentionally added and then removed.
