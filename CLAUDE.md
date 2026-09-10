# CLAUDE.md
> קרא לפני כל פעולה בריפו זה.

## זהות הריפו
- ריפו: `yanivmizrachiy/www`
- תחום: Moodle של משרד החינוך.
- שני מוצרים נפרדים חיים באותו ריפו:
  1. **Moodle Teacher Hub** — כלי מורה עברי RTL.
  2. **Guide** — מצגת/מדריך Moodle סטטי למורים.
- אסור לערבב ביניהם בקוד, runtime, נתונים, פריסה או הוכחות.

## היררכיית אמת מחייבת
- `RULES.md` — גבול הריפו ומה מותר/אסור להכניס אליו.
- `PROJECT_RULES.md` — אמת המוצר של **Teacher Hub**.
- `PROJECT_MEMORY.md` — אמת המוצר של **Guide** והחוזה המחייב להפרדה בין Guide ל-Teacher Hub.
- `public/PROJECT_MEMORY.md` — עותק פריסתי בלבד; חייב להיות זהה ל-`PROJECT_MEMORY.md` ואינו מקור אמת עצמאי.
- `README.md`, `docs/` ו-`STATE/` הם תיעוד/ראיות/היסטוריה. הם אינם רשאים לגבור על מקורות האמת שלמעלה.
- לפני שינוי יש לקרוא מחדש את הקבצים הרלוונטיים מה-HEAD הנוכחי ולא להסתמך על זיכרון שיחה.

## Runtime קנוני
- Teacher Hub: `https://www-tijc.onrender.com` — Render.
- Guide: `https://yanivmizrachiy.github.io/www/guide/` — GitHub Pages דרך `deploy/guide-static`, שנבנה אוטומטית מ-`main`.
- Render אינו מפרסם ואינו מאמת את Guide.
- Teacher Release: **NO**.

## שפה
- קוד / comments / commits → אנגלית.
- תשובות / README / תיעוד → עברית.
- תאריך ב-UI של Teacher Hub: `D/M/YY`.

## Git — חובה
- אין commit ישיר ל-`main`.
- branch: `feat/<name>` / `fix/<name>` / `chore/<name>`.
- חובה PR לפני merge.
- אין מחיקת קבצים או branches בלי זיהוי מדויק ואישור מתאים.
- לפני כל כתיבה: re-fetch של `main`/HEAD כדי לא לדרוס שינוי מקביל.

## אבטחה ואמת
- אין secrets בקוד לעולם; secrets רק דרך GitHub Secrets / Render Environment.
- אין דמו, נתונים מזויפים, כפתורים מזויפים, fake PASS או צילום מומצא.
- Guide מפרסם רק שקפים שעברו שערי evidence/capture.
- Teacher Release נשאר NO עד מעבר כל שערי Teacher Hub.

## לא לגעת בלי הוראה מפורשת
- LTI launch flow.
- Participants / Gradebook / Logs import.
- Supabase migrations.
- Teacher Release gate.
- `render.yaml` / deploy של Teacher Hub.
- צילומי Guide קיימים או publication gates בלי evidence אמיתי.

## הפעלת Claude אוטומטית
כתוב `@claude` בכל Issue או PR comment.
