# LTI / SSO Contract — www / Moodle Teacher Hub

מסמך זה מגדיר את חוזה הכניסה, ההקשר והאבטחה מול Moodle / משרד החינוך.

---

## עיקרון בסיסי

LTI הוא שער כניסה והקשר. הוא לא מקור נתוני תלמידים, ציונים, משימות או פעילות.

הנתונים עצמם מגיעים רק מ:

- Moodle API מאומת בעתיד, רק אם יוגדר token אמיתי וייבדק.
- ייבוא דוחות Moodle אמיתיים.
- הדבקת טבלאות Moodle אמיתיות.

---

## הגדרת הכלי החיצוני שזוהתה מצילומי המשתמש

המשתמש שלח צילומים מתוך מסך עריכת כלי חיצוני במרחב Moodle שלו.

הפרטים שנקלטו מהצילומים:

| שדה | ערך שנראה בצילום | סטטוס |
|---|---|---|
| Moodle host | `moodlemoe.lms.education.gov.il` | observed |
| מסך ניהול | `mod/lti/coursetooledit.php` | observed |
| שם הכלי | `Moodle Teacher Hub` | observed |
| כתובת הכלי / Tool URL | `https://iibrglxkiszrbzakrnlo.functions.supabase.co/lti-launch` | observed, must be exact raw URL |
| תיאור כלי/שירות | `כלי לניהול משימות ודוחות` | observed |
| LTI version | `LTI 1.0/1.1` | observed |
| Consumer Key | `yaniv-lti-tool` | observed |
| Shared Secret | קיים ומוסתר בנקודות | exists, value not stored |

ה־Shared Secret אינו ידוע לריפו ואסור להכניס אותו לגיטהאב. הוא חייב להישמר רק בסביבת deploy/Supabase secrets.

---

## דרישת יעד

המורה פותח את הכלי מתוך Moodle ומקבל:

- teacher context
- course context
- role/context permissions
- session מאומת

אין צורך בסיסמה נוספת לאתר.

---

## LTI 1.0/1.1

ההגדרה שנצפתה במרחב Moodle של יניב היא `LTI 1.0/1.1`.

לכן חובה לתמוך בפועל ב:

- OAuth1 HMAC-SHA1 verification.
- consumer key תקין: `yaniv-lti-tool`.
- shared secret תקין מסביבת secrets בלבד.
- launch URL נקי ללא Markdown wrapping.
- ניקוי whitespace מכל ערך שמגיע מ־env או מהגדרה.
- signature base string נכון.
- error אמיתי במקרה כשל.

אין לטעון ש־LTI מוכן עד שהשקה אמיתית מתוך Moodle עוברת ונרשמת ב־`STATE/evidence-log.md`.

---

## Session

session חייב להיות מוגבל זמן.

חובה לשמור:

- launch id אם קיים.
- teacher id/name אם זמין.
- course id/name אם זמין.
- role אם זמין.
- created at.
- expires at.

מעבר מכשיר = session חדש או launch חדש.

---

## מה אסור להסיק מ־LTI

אסור להניח ש־LTI מספק:

- תלמידים.
- ציונים.
- משימות.
- לוגים.
- ניסיונות.
- קישורים למשימות.

---

## Moodle Web Services

Moodle API נחשב פעיל רק אם קיימים:

1. token אמיתי.
2. endpoint אמיתי.
3. בדיקת קריאה מוצלחת.
4. בדיקת הרשאות לפי מורה/קורס.
5. תיעוד ב־STATE/evidence-log.md.

כתיבה ל־Moodle נחשבת פעילה רק אחרי בדיקת כתיבה מוצלחת.

---

## סטטוסים מותרים

| מצב | משמעות |
|---|---|
| `lti-config-observed` | הגדרת כלי חיצוני נצפתה בצילום |
| `lti-ready` | LTI נבדק ונפתח |
| `lti-configured-not-tested` | הגדרה קיימת אך לא אומתה |
| `manual-import-only` | אין API, עובדים מייבוא |
| `api-read-ready` | API קריאה נבדק |
| `api-write-ready` | API כתיבה נבדק |
| `blocked-no-token` | אין token |

---

## כלל UI

אין להציג למורה "מחובר ל־Moodle API" אם רק LTI הצליח.

יש להפריד בממשק בין:

- כניסה דרך Moodle.
- נתונים שיובאו מדוחות Moodle.
- חיבור API חי.
