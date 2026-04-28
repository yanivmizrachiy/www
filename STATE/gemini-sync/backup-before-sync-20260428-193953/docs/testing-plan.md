# Testing Plan — www / Moodle Teacher Hub

תוכנית בדיקות חובה לפני שמסמנים את האתר כעובד, pilot-ready או production-ready.

---

## 1. בדיקות ריפו

- `git status` נקי.
- אין secrets.
- `.env` לא נמצא בגיט.
- אין קבצי תלמידים אמיתיים.
- אין דוחות Moodle פרטיים.
- README, PROJECT_RULES ו־STATE מסונכרנים.

---

## 2. בדיקות התקנה והרצה

פקודות יעד:

```bash
npm install
npm run check
npm run dev
```

בדיקות endpoint:

```text
http://127.0.0.1:3000/health
http://127.0.0.1:3000/dev/login
```

---

## 3. בדיקות UI

- Dashboard נטען בעברית RTL.
- כל כפתור ניווט עובד.
- אין כפתורי סרק.
- empty state ברור בכל מסך בלי נתונים.
- אין מספרים מומצאים.
- עמוד ראשי מציג שם מורה/מרחב רק אם הנתון קיים.

---

## 4. בדיקות LTI

- launch endpoint זמין.
- OAuth signature מאומת.
- consumer key נקי מ־whitespace.
- launch URL נקי מ־Markdown wrapping.
- session נוצר.
- כשל launch מציג שגיאה אמיתית.

---

## 5. בדיקות ייבוא

לכל סוג דוח:

- upload / paste עובד.
- preview לפני כתיבה.
- mapping תקין.
- warnings נשמרים.
- ערכים חסרים נשארים חסרים.
- אין נתונים מומצאים.

סוגי דוחות לבדיקה:

- Students / Participants.
- Grades.
- Activity completion.
- Logs.

---

## 6. בדיקות דוחות וייצוא

- CSV נפתח תקין.
- Excel/XLSX רק אם יש קובץ אמיתי.
- PDF רק אם יש יצוא אמיתי או הדפסה מוצהרת.
- הדפסה נראית מסודרת.
- נתונים חסרים מוצגים כחסרים.

---

## 7. בדיקות API Moodle

רק אם יש token אמיתי:

- קריאת courses.
- קריאת participants.
- קריאת grades.
- קריאת activities.
- בדיקת הרשאות לפי teacher/course.

כתיבה רק אם יש הרשאות כתיבה:

- פעולה קטנה ומבוקרת.
- תיעוד לפני/אחרי.
- rollback או תיקון ידוע.

---

## 8. הגדרת סטטוס אחרי בדיקה

| תוצאה | סטטוס |
|---|---|
| תיעוד בלבד | governance-ready |
| build עובד | build-verified |
| UI עובד בלי נתונים | shell-verified |
| ייבוא אמיתי עובד | pilot-ready |
| LTI אמיתי עובד | lti-verified |
| API קריאה עובד | api-read-ready |
| API כתיבה עובד | api-write-ready |
| הכל נבדק | production-ready |

---

## 9. Evidence

כל בדיקה חייבת להירשם ב:

```text
STATE/evidence-log.md
```

כולל:

- תאריך.
- פקודה/URL.
- תוצאה.
- עבר/נכשל.
- מה לא נבדק.
