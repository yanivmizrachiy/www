# CLAUDE.md
> קרא לפני כל פעולה בריפו זה.

## זהות הריפו
- ריפו: `yanivmizrachiy/www`
- מוצר: Moodle Teacher Hub — כלי מורה עברי RTL
- Runtime: `https://www-tijc.onrender.com`
- Teacher Release: **NO**

## מקור אמת — ניתוב מחייב
בריפו הזה שני מוצרים נפרדים, ולכל אחד מקור אמת אחד ויחיד. אין מקור אמת שלישי.

| נושא | מקור האמת היחיד |
|---|---|
| **מצגת/מדריך ההדרכה — `/guide`** | **`PROJECT_MEMORY.md`** |
| Moodle Teacher Hub (נתונים, LTI, ייבוא, API) | `PROJECT_RULES.md` |
| גבול הריפו ומה לא מוחקים | `RULES.md` |

- תוכן השקפים עצמו חי **רק** ב-`src/data/guideDeckSource.ts`. `guideDeck.ts` נגזר ממנו ו-`Guide.tsx` מרנדר. שינוי תוכן = עריכת קובץ אחד.
- `public/PROJECT_MEMORY.md` הוא **עותק ציבורי בלבד** וחייב להישאר זהה בייט-לבייט ל-`PROJECT_MEMORY.md` (נאכף ב-CI).
- דרישה חדשה למצגת: קודם מעדכנים את `PROJECT_MEMORY.md`, אחר כך מסנכרנים את העותק הציבורי, ורק אז נוגעים בקוד.
- בסתירה בין מסמכים על נושא המצגת — `PROJECT_MEMORY.md` קובע.

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
