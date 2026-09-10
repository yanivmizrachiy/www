# CLAUDE.md
> קרא לפני כל פעולה בריפו זה.

## זהות הריפו
- ריפו: `yanivmizrachiy/www`
- שני מוצרים נפרדים באותו ריפו:
  - **Moodle Teacher Hub** — כלי מורה עברי RTL.
  - **Guide** — מצגת/מדריך Moodle סטטי למורים.
- חריג היסטורי זמני: `luz-teddy/`; אין להרחיב אותו ואין למחוק בלי העברה מאומתת ואישור.

## מקור אמת וסדר קדימות
1. `PROJECT_MEMORY.md` — מקור האמת הקנוני ברמת הריפו, כולל ההפרדה בין Guide ל-Teacher Hub וה-Runtimes שלהם.
2. `PROJECT_RULES.md` — אמת מפורטת של Moodle Teacher Hub בלבד, בכפוף ל-`PROJECT_MEMORY.md`.
3. `RULES.md` — גבולות ריפו וכללי פרטיות/עבודה, בכפוף לשני הקבצים לעיל.
4. `STATE/**` ו-`docs/**` — ראיות, snapshots, runbooks והיסטוריה; אינם רשאים לגבור על מקור האמת הקנוני.

## Runtime קנוני
- Teacher Hub: `https://www-tijc.onrender.com` — Render.
- Guide: `https://yanivmizrachiy.github.io/www/guide/` — GitHub Pages, נבנה אוטומטית מ-`main` אל `deploy/guide-static`.
- Render אינו מפרסם ואינו מאמת את ה-Guide.
- Teacher Release: **NO**.

## שפה
- קוד / comments / commits → אנגלית.
- תשובות / README / תיעוד → עברית.
- תאריך ב-UI של Teacher Hub: `D/M/YY`.

## Git — חובה
- אין commit ישיר ל-`main`.
- branch: `feat/<name>` / `fix/<name>` / `chore/<name>`.
- חובה PR לפני merge.
- אין מחיקת קבצים בלי אישור.
- לפני כתיבה יש לקרוא מחדש את HEAD העדכני כדי לא לדרוס שינוי מקביל.

## אבטחה ואמת
- אין secrets בקוד לעולם; secrets רק דרך GitHub Secrets / Render Environment.
- אין דמו, נתונים מזויפים, כפתורים מזויפים או PASS מזויף.
- בצילומי Guide משתמשים רק בצילום Moodle אמיתי; חוסר צילום נשאר `needs-capture`.
- Teacher Release נשאר NO עד מעבר כל השערים.

## לא לגעת בלי הוראה מפורשת
- LTI launch flow.
- Participants / Gradebook / Logs import.
- Supabase migrations.
- Teacher Release gate.
- deploy / `render.yaml`.

## הפעלת Claude אוטומטית
כתוב `@claude` בכל Issue או PR comment.
