# CLAUDE.md
> קרא לפני כל פעולה בריפו זה.

## זהות הריפו
- ריפו: `yanivmizrachiy/www`
- הריפו מכיל שני מוצרי Moodle נפרדים שחולקים ריפו אך לא runtime או UI:
  1. **Moodle Teacher Hub** — כלי מורה עברי RTL.
  2. **Guide** — מצגת/מדריך Moodle סטטי למורים.
- חריג היסטורי/תאימות קיים: `luz-teddy/`; הוא אינו חלק משני המוצרים ואין להרחיב אותו כאן.

## היררכיית אמת מחייבת
- `RULES.md` — גבול הריפו ומה מותר/אסור לערבב.
- `PROJECT_RULES.md` — אמת המוצר של **Teacher Hub**.
- `PROJECT_MEMORY.md` — אמת המוצר של **Guide** וחוזה ההפרדה בין Guide ל-Teacher Hub.
- `public/PROJECT_MEMORY.md` — mirror פריסתי בלבד; לעולם אינו מקור אמת עצמאי.
- `STATE/` — ראיות, סטטוס והיסטוריה; מסמך STATE ישן אינו גובר על מקור אמת עדכני.
- `README.md` — תקציר ציבורי בלבד.

## Runtimes
- Teacher Hub: `https://www-tijc.onrender.com` — Render.
- Guide: `https://yanivmizrachiy.github.io/www/guide/` — GitHub Pages מתוך `deploy/guide-static`, שנבנה אוטומטית מ-`main`.
- Render לעולם אינו מפרסם או מאמת את ה-Guide.
- Teacher Release: **NO**.

## לפני כל שינוי
1. קרא מחדש את מקור האמת הרלוונטי מה-HEAD הנוכחי.
2. אם השינוי נוגע ל-Guide — קרא `PROJECT_MEMORY.md` ומסמכי Guide הרלוונטיים.
3. אם השינוי נוגע ל-Teacher Hub — קרא `PROJECT_RULES.md` וראיות STATE הרלוונטיות.
4. אל תדרוס שינוי מקביל; בדוק HEAD לפני כתיבה.
5. אין ליצור מקור אמת נוסף במקביל.

## שפה
- קוד / comments / commits → אנגלית.
- תשובות / README / תיעוד → עברית.
- תאריך ב-UI של Teacher Hub: `D/M/YY`.

## Git — חובה
- אין commit ישיר ל-`main`.
- branch: `feat/<name>` / `fix/<name>` / `chore/<name>`.
- חובה PR לפני merge.
- אין מחיקת קבצים בלי אישור מפורש.
- אין למחוק ענף או היסטוריה לפני הוכחה שהוא superseded ושאין עליו עבודה פעילה.

## אבטחה ואמת
- אין secrets בקוד לעולם; secrets רק דרך GitHub Secrets / Render Environment.
- אין דמו, נתונים מזויפים, screenshots מומצאים או כפתורים מזויפים.
- אין לערבב Guide עם Teacher Hub בתוכן, runtime, deployment או proof.
- Teacher Release נשאר **NO** עד מעבר כל השערים הנדרשים.

## לא לגעת בלי הוראה מפורשת ובעיה מוכחת
- LTI launch flow.
- Participants / Gradebook / Logs import.
- Supabase migrations.
- Teacher Release gate.
- deploy / `render.yaml`.

## הפעלת Claude אוטומטית
כתוב `@claude` בכל Issue או PR comment.
