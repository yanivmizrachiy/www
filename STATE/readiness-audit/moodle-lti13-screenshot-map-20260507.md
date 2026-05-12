# Moodle LTI 1.3 screenshot map — 2026-05-07

Repository: `yanivmizrachiy/www`
Project: Moodle Teacher Hub
Purpose: preserve screenshot-derived Moodle facts before changing code or Moodle settings.

## Safety rule

The existing working Moodle Teacher Hub tool must not be changed in-place.

Current working tool:

```text
Moodle Teacher Hub
LTI version: LTI 1.0/1.1
Tool URL: https://www-tijc.onrender.com/api/lti/launch
```

All LTI 1.3 work must remain investigative until a separate test tool is created and verified.

## Moodle course navigation observed

Screenshots show a real Moodle course/space with top navigation including:

```text
משתתפים
ציונים
דוחות
אפשרויות נוספות
```

The course has topic/section navigation and course content sections, including visible labels such as:

```text
פסגת זאב
פונקציה ריבועית
אלגברה
Section 3
Section 4
Section 5
למורה
נושאים נוספים
```

## More options menu observed

The `אפשרויות נוספות` menu includes:

```text
מאגר שאלות
מאגר תכנים
תנאי השלמת קורס
הישגים
מיומנויות
מסננים
ציונים
כלי או שירות LTI חיצוני
תעודות סיום
שימוש חוזר בתכנים
החלפת תפקיד ל...
תזכורות
```

This confirms that the LTI tool is managed from the course UI via `כלי או שירות LTI חיצוני`.

## Existing LTI 1.0/1.1 tool facts observed

Screenshots show the existing tool configuration:

```text
Tool name: Moodle Teacher Hub
Tool URL: https://www-tijc.onrender.com/api/lti/launch
LTI version: LTI 1.0/1.1
Consumer key: yaniv-lti-tool
Secret: present but hidden
```

Do not expose, copy, or commit the secret.

## LTI 1.3 option observed

Screenshots show the LTI version dropdown includes:

```text
LTI 1.0/1.1
LTI 1.3
```

When LTI 1.3 is selected temporarily without saving, Moodle shows fields including:

```text
Client ID
Public key type
Public keyset
Initiate login URL
Redirection URI(s)
```

Observed public key type:

```text
Keyset URL
```

This implies the tool must expose a JWKS/keyset URL before a real LTI 1.3 launch can work.

## Services observed

The Moodle LTI 1.3 configuration area shows a `שרות` section.

Observed services:

```text
סינכרון תתי-מטלות וציונים
סינכרון וניהול משתמשים
```

### Grade/sub-assignment sync options observed

The dropdown for `סינכרון תתי-מטלות וציונים` includes:

```text
אל תשתמשו בשירות זה
השתמשו בשירות זה לסינכרון ציונים בלבד
השתמשו בשירות זה לסינכרון ציונים וניהול פריטי ציון בגיליון הציונים הראשי של הקורס
```

This suggests a possible AGS/grade-service path, but does not prove full Gradebook read access.

### User sync / user management options observed

The dropdown for `סינכרון וניהול משתמשים` includes:

```text
אל תשתמשו בשירות זה
השתמשו בשירות זה
השתמשו בשירות זה לאיחזור מידע אודות משתמשים, מותנה בהגדרות פרטיות
```

This is the most important observed option for possible automatic participant/user/role sync.

It still requires a real LTI 1.3 implementation and proof by API response before automatic roster sync may be claimed.

## Privacy controls observed

The `פרטיות` section includes:

```text
שתפו שם המשתמש עם הכלי החיצוני
שתפו כתובת הדואר של המשתמש עם הכלי החיצוני
קבלת ציונים מהכלי החיצוני
SSL נדרש
```

Observed dropdown options:

```text
שם משתמש: אף פעם / תמיד
דוא״ל: אף פעם / תמיד
קבלת ציונים: אף פעם / תמיד / As specified in Deep Linking definition or Delegate to teacher
```

Observed defaults in screenshots:

```text
שם משתמש: אף פעם
דוא״ל: אף פעם
SSL נדרש: checked
```

These privacy settings may determine whether user sync produces useful names/emails or only limited identifiers.

## Current missing screenshots

Still needed before any real LTI 1.3 implementation decision:

```text
1. Full clear screenshot of the entire LTI 1.3 technical field area.
2. Whether a Deployment ID / מזהה פריסה field appears anywhere.
3. Whether a Platform ID / Issuer field appears anywhere.
4. Full red validation message at the bottom of the form.
5. The full contents under הגדרות נוספות / advanced settings, if present.
6. Screenshot of the exact current value of every LTI 1.3 field, without secrets.
7. Screenshot of a new/separate tool creation form, if Moodle offers it, before saving anything.
8. Screenshot of the Reports menu options.
9. Screenshot of the Grades export/report options.
10. Screenshot of Participants export/copy options, with student names hidden if possible.
```

## Current conclusion

Facts proven by screenshots:

```text
Moodle offers LTI 1.3.
Moodle exposes user sync and grade/sub-assignment sync service controls.
Moodle exposes privacy controls that may affect user sync.
The current tool still works through LTI 1.0/1.1 and must not be modified in-place.
```

Not proven yet:

```text
LTI 1.3 launch works.
OIDC login works.
JWT launch validation works.
NRPS/user roster API works.
AGS/grade API works.
Full Moodle Gradebook can be read automatically.
Logs/activity can be read automatically.
```

## Practical product direction

The repo should keep both tracks separate for now:

```text
stable-lti11-import-track
lti13-advantage-investigation-track
```

If LTI 1.3 proves viable, the tracks can later be merged into one cleaner architecture.

If LTI 1.3 is blocked, the stable track remains useful and should be improved with smart/manual real-data import.
