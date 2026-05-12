# Moodle API Contract — www / Moodle Teacher Hub

מסמך זה מגדיר את התנאים להפעלת חיבור Moodle API חי בריפו `yanivmizrachiy/www`.

הכלל המרכזי: אין להציג API חי, סנכרון חי או עריכה מול Moodle בלי token אמיתי, הרשאות אמיתיות ובדיקה מתועדת.

---

## 1. מצב נוכחי

סטטוס ברירת מחדל:

```text
Moodle API live sync: not verified / blocked-no-token
Moodle write-back: blocked-no-token
```

אם אין token מאומת, המערכת עובדת רק דרך:

- LTI לצורך כניסה והקשר.
- ייבוא ידני של דוחות Moodle אמיתיים.

---

## 2. תנאי כניסה ל־API חי

API חי ייחשב פעיל רק אחרי שכל התנאים מתקיימים:

1. קיים Moodle Web Services token אמיתי.
2. ידוע base URL אמיתי של Moodle.
3. endpoint קריאה נבדק בפועל.
4. מתקבלת תשובה אמיתית מ־Moodle.
5. ההרשאות תואמות מורה וקורס.
6. הבדיקה מתועדת ב־`STATE/evidence-log.md`.

---

## 3. קריאות קריאה יעד

יכולות קריאה רצויות:

- course context.
- participants / students.
- groups.
- gradebook.
- activities / modules.
- activity completion.
- logs.
- quiz attempts אם זמין דרך API.
- assignment submissions אם זמין דרך API.

כל endpoint צריך לקבל סטטוס:

- `not-tested`
- `blocked-no-token`
- `verified-read`
- `partial`
- `failed`

---

## 4. כתיבה ל־Moodle

כתיבה מותרת רק אם קיימים:

- token עם הרשאות כתיבה.
- endpoint כתיבה ידוע.
- בדיקת הרשאות למורה/קורס.
- בדיקת פעולה מבוקרת.
- תיעוד before/after.
- דרך rollback או תיקון ידוע.

דוגמאות יעד:

- שינוי שם מרחב.
- שינוי הגדרות משימה.
- שינוי מספר ניסיונות.
- פעולות ניהול לפי הרשאות Moodle.

לפני בדיקה כזו, כל כפתור כתיבה חייב להיות מוסתר או מסומן חסום.

---

## 5. הפרדה בין LTI ל־API

LTI אינו API נתונים.

LTI מספק:

- כניסה.
- teacher context.
- course context.
- role context.
- session.

LTI לא מוכיח שיש:

- רשימת תלמידים.
- ציונים.
- לוגים.
- משימות.
- ניסיונות.
- הרשאת כתיבה.

---

## 6. UI מחייב

מותר להציג:

- `כניסה דרך Moodle פעילה` רק אם LTI נבדק.
- `נתונים מיובאים מדוח Moodle` אם יש import אמיתי.
- `Moodle API לא זמין` אם אין token.
- `עריכה מול Moodle חסומה` אם אין הרשאת כתיבה.

אסור להציג:

- `מחובר ל־Moodle API` בלי בדיקת קריאה.
- `סנכרון פעיל` בלי sync אמיתי.
- `נשמר במודל` בלי כתיבה מוצלחת.

---

## 7. Evidence חובה

כל בדיקת API חייבת להירשם ב־`STATE/evidence-log.md` עם:

- תאריך.
- endpoint.
- פעולה.
- קלט לא סודי.
- תוצאה.
- עבר/נכשל.
- מה לא נבדק.

אין לשמור token או secret בלוג.
