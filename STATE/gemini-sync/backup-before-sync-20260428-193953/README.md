# Moodle Teacher Hub — www

הריפו הרשמי והמחייב של הפרויקט הוא:

```text
yanivmizrachiy/www
```

הריפו הזה הוא מקור האמת היחיד להמשך העבודה על אתר Moodle Teacher Hub המשודרג.

## מטרה

מוצר אמיתי למורים מתוך Moodle באמצעות LTI 1.1, עם Dashboard בעברית מלאה, RTL, API פנימי, דוחות, ייצוא וארגון ריפו לקראת הרחבות עתידיות.

המערכת לא מציגה דמו ולא ממציאה נתונים. כל נתון חייב להגיע ממקור Moodle אמיתי: LTI/API מאומת או ייבוא ידני של דוחות Moodle אמיתיים.

## סטטוס איחוד ריפואים

היה קיים גם ריפו בשם:

```text
yanivmizrachiy/moodle-teacher-hub
```

הריפו הזה סומן כ־legacy / לא מקור אמת. החומר החשוב ממנו נשמר ותועד בתוך `www`, והמשך העבודה חייב להתבצע רק כאן.

## עקרונות

- לא דמו.
- לא נתונים מומצאים.
- לא לשבור מה שכבר עובד.
- Launch דרך Moodle הוא נקודת הכניסה.
- נתונים אמיתיים מגיעים מ־Moodle Web Services / APIs רק אם יש token אמיתי ומאומת.
- אם אין token — עובדים במצב Manual Real Data Import בלבד.
- UI נפרד מלוגיקה עסקית.
- אין כפתורים שלא עושים פעולה אמיתית.
- אין לטעון production-ready בלי בדיקות.

## קיים כרגע לפי README המקורי

- Node.js + Express.
- `/lti/launch-1p1`.
- `/health`.
- Dashboard בעברית.
- `data/store.json`.
- API בסיסי:
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

## דרישות מוצר מחייבות

- עמוד ראשי עם שם המורה ושם המרחב כאשר הנתונים זמינים.
- ניווט עברי לתלמידים, משימות, פרקים, דוחות, פעילות/זמנים, הגדרות וייצוא.
- סינון תלמיד, קבוצה, כיתה וטווח תאריכים כאשר הנתונים זמינים.
- הצגת ציונים, ניסיונות, פעילות, ממוצעים וזמן תרגול רק מנתוני אמת.
- משימות עם שיוך לפרק/נושא, כמות שאלות אם קיימת, וקישור ישיר רק אם מאומת.
- דוחות ציונים, משימות, זמנים ופעילות.
- ייצוא CSV/Excel/PDF/הדפסה — רק מה שבאמת קיים ונבדק יסומן כעובד.
- עריכה דו־כיוונית מול Moodle רק אחרי token אמיתי והרשאות כתיבה מאומתות.

## מסמכי מקור אמת

- `PROJECT_RULES.md` — דף הכללים העליון.
- `docs/system-rules.md` — כללי עבודה מעשיים.
- `docs/requirements.md` — דרישות המוצר המרוכזות.
- `docs/legacy-moodle-teacher-hub-snapshot.md` — חומר שנשמר מהריפו הישן.
- `STATE/project-status.md` — סטטוס אמת עדכני.
- `STATE/repo-consolidation.md` — תיעוד איחוד הריפואים.

## הפעלה מקומית

```bash
npm install
npm run check
npm run dev
```

לאחר הפעלה מקומית:

```text
http://127.0.0.1:3000/health
http://127.0.0.1:3000/dev/login
```

או דרך LTI 1.1 כאשר מוגדרים ערכי הסביבה המתאימים.

## מבנה ידוע

- `src/server.js` — שרת ראשי.
- `src/ui/dashboard/dashboard.html` — דשבורד.
- `docs/` — החלטות, פריסה, API ומוצר.
- `STATE/` — סטטוס, איחוד, הוכחות בדיקה.
- `data/store.json` — אחסון מקומי זמני.

## סטטוס אמת

הריפו מאוחד תיעודית תחת `www`. עדיין נדרש אימות קוד מלא לפני סימון production-ready.
