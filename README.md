# Moodle Teacher Hub — www

הריפו הרשמי והמחייב של הפרויקט הוא `yanivmizrachiy/www`.

## מה זה

כלי נתונים למורה המופעל מתוך Moodle באמצעות LTI 1.1. מאפשר ייבוא דוחות מ-Moodle, ניתוח הישגי תלמידים, מעקב אחר פעילות, וייצוא ל-Excel — הכל בעברית מלאה, RTL.

**אין דמו. אין נתונים מומצאים. אין ססמה נפרדת.**

## איך זה עובד

```
מורה ב-Moodle → לוחץ על External Tool → LTI OAuth1 → מרכז המורה (WWW)
```

הכניסה היא **רק** דרך Moodle. אין טופס התחברות — האימות מתבצע באמצעות LTI של מודל, שמעביר את זהות המורה ואת מזהה הקורס. כל נתוני התלמידים מסוננים לפי `course_id` של המורה.

## תנאים מוקדמים

- אתר Moodle עם הרשאות LTI מופעלות
- רישום האתר ופרטי LTI בדף `/settings` (Tool URL: `https://your-domain.com/api/lti/launch`)
- קובץ `.env` עם משתני Supabase (ראה `.env.example`)

## הפעלה מקומית

```bash
npm install
npm run dev
```

פתח `http://localhost:3000`. הגישה לנתוני תלמידים דורשת LTI launch מתוך Moodle.

## סקריפטים

| סקריפט | תיאור |
|--------|-------|
| `npm run dev` | הפעלת שרת פיתוח (Vite) |
| `npm run build` | בנייה לייצור |
| `npm run preview` | תצוגה מקדימה של ה-build |
| `npm run typecheck` | בדיקת טיפוסים TypeScript |

## מבנה הפרויקט

```
src/
  pages/          — כל העמודים (Dashboard, Students, Grades, Settings...)
  components/     — קומפוננטות משותפות
  hooks/          — hooks לנתונים (useLtiSession, useImports...)
  lib/            — פונקציות עזר (exportGrades, utils...)
  integrations/   — חיבורים חיצוניים (Supabase client + types)

supabase/
  functions/
    lti-launch/   — Edge Function לאימות LTI 1.1 OAuth1
```

## מסד נתונים (Supabase)

טבלאות `imported_*` מאחסנות נתונים שיובאו מדוחות Moodle:

- `imported_students` — רשימת תלמידים
- `imported_grades` / `imported_grade_items` — ציונים
- `imported_tasks` / `imported_task_completion` — משימות
- `imported_chapters` — פרקים
- `imported_log_events` — לוגים ופעילות

טבלאות ניהול:
- `moodle_sites` — אתרי Moodle + פרטי LTI
- `teacher_sessions` — סשנים פעילים
- `launch_attempts` — לוגים של ניסיונות LTI

## שני מוצרים באותו ריפו

1. **Moodle Teacher Hub** — כלי נתונים שמורה מפעיל מתוך מרחב Moodle שלו
2. **Guide Presentation** — מדריך/מצגת אינטרנטית למורים על מרחבי למידה Moodle

מופרדים באופן מוחלט ברמת ה-URL וההקשר.
