# LTI / SSO Contract — www / Moodle Teacher Hub

מסמך זה מגדיר את חוזה הכניסה, ההקשר והאבטחה מול Moodle / משרד החינוך.

---

## עיקרון בסיסי

LTI הוא שער כניסה והקשר. הוא לא מקור נתוני תלמידים, ציונים, משימות או פעילות.

הנתונים עצמם מגיעים רק מ:

- Moodle API מאומת.
- ייבוא ידני של דוחות Moodle אמיתיים.

---

## דרישת יעד

המורה פותח את הכלי מתוך Moodle ומקבל:

- teacher context
- course context
- role/context permissions
- session מאומת

אין צורך בסיסמה נוספת לאתר.

---

## LTI 1.1

אם עובדים ב־LTI 1.1 חובה:

- OAuth1 HMAC-SHA1 verification.
- consumer key תקין.
- shared secret תקין.
- launch URL נקי ללא Markdown wrapping.
- ניקוי whitespace.
- signature base string נכון.
- error אמיתי במקרה כשל.

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
