# Implementation Plan — www / Moodle Teacher Hub

תוכנית עבודה חכמה להמשך סידור, אימות ושדרוג הריפו `yanivmizrachiy/www`.

הכלל המרכזי: לא בונים פיצ'רים על הצהרות. מתקדמים רק לפי קוד, בדיקות והוכחות.

---

## שלב 0 — Governance וניקיון ריפו

סטטוס: מתקדם מאוד.

בוצע:

- `PROJECT_RULES.md`
- `docs/system-rules.md`
- `docs/requirements.md`
- `docs/repository-map.md`
- `docs/import-contract.md`
- `docs/lti-contract.md`
- `docs/testing-plan.md`
- `STATE/project-status.md`
- `STATE/evidence-log.md`

נשאר:

- audit קבצים מלא.
- זיהוי כפילויות.
- בדיקת secrets.
- בדיקת scripts בפועל.

---

## שלב 1 — Runtime audit

מטרה: לדעת מה באמת רץ בריפו הנוכחי.

בדיקות יעד:

```bash
npm install
npm run check
npm run dev
```

URLs לבדיקה:

```text
http://127.0.0.1:3000/health
http://127.0.0.1:3000/dev/login
```

פלט חובה:

- האם השרת עלה.
- האם Dashboard נטען.
- האם הניווט עובד.
- האם אין שגיאות console/server.
- האם אין secrets בריפו.

---

## שלב 2 — מיפוי API פנימי

מטרה: להבין מה באמת קיים ב־Express/API.

Endpoints מתוך README שצריך לבדוק:

- `/health`
- `/api/bootstrap`
- `/api/launches`
- `/api/students`
- `/api/tasks`
- `/api/grades`
- `/api/activity`
- `/api/settings`
- `/api/moodle-summary`
- `/api/moodle-captures`
- `/api/export/grades.csv`

כל endpoint יקבל סטטוס:

- verified
- partial
- empty-state
- not implemented
- broken

---

## שלב 3 — בדיקת LTI

מטרה: להפריד בין LTI עובד לבין API חי.

בדיקות:

- האם `/lti/launch-1p1` קיים.
- האם OAuth1 HMAC-SHA1 מאומת.
- האם launch URL נקי.
- האם consumer key/secret מנוקים מ־whitespace.
- האם session נשמר.
- האם failure מציג שגיאה אמיתית.

אין להסיק מ־LTI שיש נתוני תלמידים/ציונים.

---

## שלב 4 — נתוני אמת וייבוא

מטרה: לוודא שאין דמו ושהנתונים מגיעים ממקור אמיתי.

בדיקות:

- local data store.
- import path אם קיים.
- CSV/XLSX אם קיים.
- empty states.
- חסרים נשארים חסרים.

אין לשמור קבצי Moodle אמיתיים בריפו.

---

## שלב 5 — UI/UX

מטרה: לוודא שהאתר נוח וברור בעברית.

בדיקות:

- RTL.
- כפתורי ניווט בעברית.
- עמוד ראשי עם שם מורה/מרחב רק אם זמינים.
- תאימות מחשב וטלפון.
- אין כפתורי סרק.
- אין counters מזויפים.

---

## שלב 6 — דוחות וייצוא

מטרה: לוודא מה באמת עובד.

בדיקות:

- CSV.
- Excel/XLSX.
- PDF.
- הדפסה.

כל יכולת לא מאומתת נשארת planned / not verified.

---

## שלב 7 — Moodle API ועריכה דו־כיוונית

מטרה: עתידי בלבד עד שיש token אמיתי.

תנאי כניסה:

- Moodle Web Services token.
- endpoint מאומת.
- קריאת ניסיון.
- הרשאות course/teacher.
- כתיבה רק אחרי בדיקת הרשאה.

עד אז:

```text
API live sync: blocked
Moodle write-back: blocked
```

---

## סדר עדיפויות מיידי

1. audit ריפו מלא.
2. בדיקת npm scripts.
3. בדיקת health/dev login.
4. עדכון `STATE/evidence-log.md`.
5. ניקוי README מול הכללים.
6. הכנסת קוד Lovable מלא אם מתקבל ZIP/קבצים.

---

## אחוזי התקדמות לפי תחום

| תחום | סטטוס |
|---|---|
| Governance | מתקדם מאוד |
| Requirements | מתקדם מאוד |
| Runtime verification | חסר |
| Moodle API verification | חסום |
| LTI verification | חסר בדיקה נוכחית |
| UI verification | חלקי |
| Production readiness | לא מאומת |
