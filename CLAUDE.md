# CLAUDE.md
> קרא לפני כל פעולה בריפו זה.

## זהות הריפו
- ריפו: `yanivmizrachiy/www`
- מוצר: Moodle Teacher Hub — כלי מורה עברי RTL
- מקור אמת עליון: `PROJECT_RULES.md`
- Runtime: `https://www-tijc.onrender.com`
- Teacher Release: **NO**

## שפה
- קוד / comments / commits → אנגלית
- תשובות / README / תיעוד → עברית
- תאריך ב-UI: `D/M/YY`

## Git — חובה
- אין commit ישיר ל-main
- branch: feat/<name> / fix/<name> / chore/<name>
- חובה PR לפני merge
- אין מחיקת קבצים בלי אישור

## אבטחה
- אין secrets בקוד לעולם
- secrets רק דרך GitHub Secrets / Render Environment

## אמת
- אין דמו, אין נתונים מזויפים, אין כפתורים מזויפים
- Teacher Release נשאר NO עד מעבר כל השערים

## לא לגעת בלי הוראה מפורשת
- LTI launch flow
- Participants / Gradebook / Logs import
- Supabase migrations
- Teacher Release gate
- deploy / render.yaml

## הפעלת Claude אוטומטית
כתוב `@claude` בכל Issue או PR comment.
