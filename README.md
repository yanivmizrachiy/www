# `yanivmizrachiy/www` — Moodle Teacher Hub + Guide

עודכן: 10/9/26

הריפו מרכז שני מוצרים נפרדים בתחום Moodle של משרד החינוך. הם נשמרים יחד, אך אסור לערבב ביניהם ב-runtime, בנתונים, בפריסה או ב-evidence.

## המוצרים החיים

### Moodle Teacher Hub

כלי מורה עברי RTL שנפתח מתוך Moodle ומציג נתונים אמיתיים בלבד לפי context והרשאות אמיתיים.

- Runtime קנוני: `https://www-tijc.onrender.com`
- LTI launch קנוני: `https://www-tijc.onrender.com/api/lti/launch`
- Teacher Release: **NO**
- Render שייך ל-Teacher Hub בלבד.

### Guide

מצגת/מדריך Moodle אינטרנטי למורים, המבוסס על צילומי Moodle אמיתיים בלבד.

- Runtime קנוני: `https://yanivmizrachiy.github.io/www/guide/`
- נבנה מ-`main` ומתפרסם אוטומטית לענף `deploy/guide-static`.
- Workflows קנוניים: `Guide Static Always-On` ו-`Guide Live Smoke`.
- Render אינו מפרסם ואינו מאמת את Guide.
- שקף שחסר לו צילום/evidence נדרש אינו מתפרסם עד השלמתו.

## ענף קנוני

`main` הוא הענף הקנוני. אין "ענף עבודה פעיל" קבוע. כל שינוי נעשה בענף `feat/`, `fix/` או `chore/`, דרך PR, ורק לאחר בדיקות נכנס ל-`main`.

## מקורות אמת

יש היררכיה ברורה כדי למנוע סתירות:

1. `RULES.md` — גבול הריפו ומה מותר/אסור להכניס אליו.
2. `PROJECT_RULES.md` — אמת המוצר של Moodle Teacher Hub.
3. `PROJECT_MEMORY.md` — אמת המוצר של Guide והחוזה המחייב להפרדה בין Guide ל-Teacher Hub.
4. `public/PROJECT_MEMORY.md` — עותק פריסתי בלבד; חייב להיות זהה ל-`PROJECT_MEMORY.md`.
5. `STATE/` ו-`docs/` — ראיות, היסטוריה, חוזים ותיעוד משלים; אינם גוברים על מקורות האמת שלמעלה.

## כללי אמת ובטיחות

- אין דמו, fake data, fake sync, fake PASS, placeholder שמוצג כאמיתי או צילום Moodle מומצא.
- אין secrets בריפו.
- אין raw student rows, ציונים גולמיים, raw logs או קבצי Moodle פרטיים ב-Git.
- אין שינוי ב-LTI launch, imports, Supabase migrations, Teacher Release gate או `render.yaml` בלי בעיה מוכחת והוראה מתאימה.
- אין מחיקת קבצים/מערכות היסטוריות בלי זיהוי, גיבוי ואימות חלופה.

## Teacher Hub — מצב אמת בסיסי

המערכת כבר כוללת תשתית LTI, ייבואי Moodle אמיתיים, Supabase, מסכי תלמידים/ציונים/פעילות/דוחות ואוטומציה. פרטי היכולת והחסמים המחייבים נמצאים ב-`PROJECT_RULES.md` וב-`STATE/evidence-log.md`.

Teacher Release נשאר **NO** עד שהשערים המחייבים עוברים. אין להסיק readiness מפעולת build, endpoint קיים או בדיקה סטטית בלבד.

## Guide — מצב אמת בסיסי

המצגת החיה מתפרסמת מ-GitHub Pages בלבד. מקור הדק הקנוני הוא `src/data/guideDeck.ts`, ושערי Guide בודקים את הדק האמיתי, נכסי הצילום ו-publication gates.

רשימת הצילומים החסרים נמצאת ב-`docs/GUIDE_MISSING_CAPTURES.md`. אין לצלם מחדש נכס שכבר קיים ומתאים; אין לפרסם שקף שדורש צילום עד שקובץ אמיתי ומאומת נמצא בריפו.

## בדיקות מקומיות עיקריות

```bash
npm install
npm run check
npm run typecheck
npm run build
npm run doctor
```

לשינויים ב-Guide יש להריץ גם את audits של Guide כפי שמוגדר ב-`package.json` וב-workflows. בדיקה מקומית אינה הוכחת production; הוכחת live חייבת להתאים ל-runtime ול-commit הנבדק.

## חריג היסטורי: `luz-teddy/`

`luz-teddy/` אינו חלק מ-Teacher Hub ואינו חלק מ-Guide. הוא נשאר זמנית בריפו לפי `RULES.md` עד העברה מאומתת לריפו נפרד. אסור למחוק אותו ללא תהליך ההעברה והאימות המוגדר שם.

## מה לא שייך לריפו

Google Calendar, SmartCalendar, Apps Script של Calendar, דשבורד כללי של ריפואים ומערכות שאינן Moodle אינם שייכים ל-`yanivmizrachiy/www`.
