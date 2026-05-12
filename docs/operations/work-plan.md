# Work Plan — www / Moodle Teacher Hub

Updated: 2026-05-06

מקור אמת עליון: `PROJECT_RULES.md`.

הריפו הרשמי והמחייב:

```text
yanivmizrachiy/www
```

הענף הפעיל לעבודה הנוכחית:

```text
gemini/ai-studio-sync-20260428-193953
```

## כלל עבודה מרכזי

לא מוסיפים פיצ׳רים חדשים לפני שמוכיחים נתיב נתונים אמיתי ראשון.

אין דמו. אין תלמידים מזויפים. אין ציונים מזויפים. אין זמן פעילות מומצא. אין כפתורי סרק. אין secrets בריפו.

## ארכיטקטורה פעילה

המסלול הפעיל הוא:

```text
Moodle External Tool
  -> Render permanent runtime
  -> /api/lti/launch
  -> React Moodle Teacher Hub
```

כתובת Render קבועה:

```text
https://www-tijc.onrender.com
```

כתובת LTI קנונית ב־Moodle:

```text
https://www-tijc.onrender.com/api/lti/launch
```

## מסלולים שאינם פעילים יותר

אין להשתמש בהם להמשך העבודה:

```text
Termux runtime as production path
Cloudflare temporary trycloudflare URLs
Localtunnel temporary URLs
Supabase Gateway forwarding as active LTI route
legacy /lti/launch-1p1
legacy /dev/login
```

Supabase Gateway נשאר מתועד בלבד, ולא ישמש כנתיב LTI פעיל עד שתתוקן ותאומת בעיית forwarding/signature.

## מצב תשתית

עובד/תועד:

- Render service חי ב־`https://www-tijc.onrender.com`.
- שרת Node מאזין על port 10000 ב־Render.
- endpoint קנוני: `/api/lti/launch`.
- Build ב־Render עבר אחרי תיקון `vite: not found`.
- `render.yaml` עודכן ל־`npm ci --include=dev && npm run build`.
- `APP_BASE_URL=https://www-tijc.onrender.com` מוגדר בתצורת Render.

לא מאומת עדיין:

- ייבוא Participants אמיתי מקצה לקצה.
- Students page אחרי ייבוא.
- Gradebook import.
- Logs import.
- Activity Completion import.
- Supabase persistence/RPC מלא.
- Moodle Web Services API.

## שלב 1 — ניקוי סתירות בריפו

מטרה: למנוע חזרה למסלולים ישנים.

בוצע/נדרש:

- לעדכן `README.md` למצב Render-first.
- לעדכן `docs/work-plan.md` למצב הנוכחי.
- להסיר legacy dashboard artifact אם הוא משתלט על `/`.
- לוודא ש־`STATE/project-status.md` תואם ל־Render.
- לוודא שכל מסמך שמזכיר Termux/Cloudflare מציג אותם כהיסטוריה ולא כנתיב פעיל.

סטטוס:

```text
In progress / mostly done
```

## שלב 2 — נתיב ייבוא תלמידים ראשון

המטרה הטכנית הבאה היחידה:

```text
Participants report אמיתי ממודל
  -> Import page
  -> Render backend
  -> Students page
  -> שמות תלמידים אמיתיים מופיעים
```

### תיקון נדרש בקוד

1. `src/server.js`
   - להוסיף `POST /api/import`.
   - לתמוך קודם רק ב־`report_type=students`.
   - לשמור imported students ב־`store.students`.
   - לשמור import batch metadata.
   - להחזיר `ok`, `row_count`, `warnings`.

2. `src/hooks/useImports.tsx`
   - `postImport()` ינסה קודם:

```text
POST /api/import
```

   - Supabase function תהיה fallback בלבד.

3. `useImportedStudents()` ינסה קודם:

```text
GET /api/imports/students?t=<token>
```

   - Supabase RPC `lti_list_students` תהיה fallback בלבד.

4. `src/pages/Students.tsx`
   - להציג empty state ברור אם אין תלמידים.
   - לא להציג שגיאת RPC גולמית למורה.

### הצלחה נחשבת רק אם

```text
1. מורה פותח מתוך Moodle.
2. קיים session מחובר.
3. דוח Participants אמיתי נטען.
4. מופיע preview.
5. אישור הייבוא מצליח.
6. מסך תלמידים מציג שמות אמיתיים.
7. `STATE/evidence-log.md` מתעד את הבדיקה ללא פרטים פרטיים.
```

## שלב 3 — Gradebook

רק אחרי Participants עובד.

מטרה:

```text
Gradebook export
  -> Import page
  -> grades matrix
```

כללי אמת:

- ציון חסר נשאר חסר.
- אין 0 במקום missing.
- ממוצע מחושב רק על ציונים מספריים אמיתיים.

## שלב 4 — Logs / Practice Time

רק אחרי Students ו־Grades.

מטרה:

```text
Logs export
  -> activity events
  -> calculated practice windows
```

כלל אמת:

```text
אם אין לוגים: לא ניתן לחשב ללא לוגים.
אם הזמן מחושב מלוגים: חובה לסמן שהוא מחושב ולא משך רשמי ממודל.
```

## שלב 5 — Activity Completion

רק אחרי שיש student matching יציב.

מטרה:

```text
Activity completion report
  -> task completion state
```

אין להציג completion אם לא יובא דוח מתאים.

## שלב 6 — Supabase persistence מלא

רק אחרי שהנתיב המקומי/Render-first עובד.

מטרה:

- טבלאות students/import_batches/grades/logs/completion.
- RLS/RPC מתועדים.
- אין service role בפרונט.
- אין SQL רחב ללא סקירה.

## שלב 7 — Moodle Web Services API עתידי

סטטוס נוכחי:

```text
blocked-no-token
```

אין לטעון API חי בלי:

- token אמיתי.
- endpoint מאומת.
- בדיקת קריאה.
- בדיקת הרשאות.
- תיעוד ב־STATE/evidence-log.md.

## בדיקות חובה לפני כל המשך

כל שינוי משמעותי חייב לעבור:

```bash
npm run check
npm run build
```

אם פקודה חסרה או נכשלת — לתעד, לא להמציא הצלחה.

## מדד מוכנות נוכחי

```text
Permanent Render runtime: high confidence
Direct LTI connection: user reported connected
Repo documentation: improving, still must stay aligned
Participants import: not verified
Grades/logs/completion: not verified
Overall product: not production-ready
```

## next action allowed

רק אחרי סיום ניקוי הסתירות:

```text
Implement Render-first Participants import path.
```
