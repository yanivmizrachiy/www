# Repository Map — www / Moodle products

מסמך זה מגדיר את מבנה הריפו הרצוי ואת חלוקת האחריות בין מקורות האמת, כדי למנוע סתירות בין Guide ל-Teacher Hub.

## היררכיית אמת

```text
RULES.md                 גבול הריפו
PROJECT_RULES.md         אמת מוצר — Teacher Hub
PROJECT_MEMORY.md        אמת מוצר — Guide + חוזה ההפרדה
public/PROJECT_MEMORY.md mirror פריסתי בלבד
docs/                    תכנון, חוזים, manifests ו-runbooks
STATE/                   ראיות, snapshots והיסטוריה
README.md                תקציר ציבורי בלבד
src/                     קוד המוצרים
public/                  נכסים סטטיים ו-Guide deployment inputs
data/                    runtime/local only; לא מקור אמת
```

## שני מוצרים, שני runtimes

### Moodle Teacher Hub
- runtime: `https://www-tijc.onrender.com`
- קוד מוצר עיקרי: `src/`, `src/server.js`, LTI/Supabase/import flows.
- אמת מוצר: `PROJECT_RULES.md`.
- Teacher Release: **NO** עד מעבר השערים המחייבים.

### Guide
- runtime: `https://yanivmizrachiy.github.io/www/guide/`
- deployment branch: `deploy/guide-static`, נבנה אוטומטית מ-`main`.
- deck קנוני: `src/data/guideDeck.ts`.
- screenshots: `public/guide/screenshots/`.
- אמת מוצר: `PROJECT_MEMORY.md`.
- Render אינו מפרסם ואינו מאמת את Guide.

## מבנה קנוני

```text
www/
  CLAUDE.md
  RULES.md
  PROJECT_RULES.md
  PROJECT_MEMORY.md
  README.md
  package.json
  .gitignore
  .env.example

  .github/workflows/
    ci.yml
    guide-static-always-on.yml
    guide-live-smoke.yml
    render-deploy-recovery.yml
    ...

  docs/
    README.md
    GUIDE_*.md
    architecture/
    lti/
    imports/
    persistence/
    privacy/
    operations/
    ai-handoff/
    dev/
    archive-candidates/

  STATE/
    project-status.md
    evidence-log.md
    progress/
    readiness-audit/
    ...

  src/
    data/guideDeck.ts
    pages/Guide.tsx
    server.js
    ...

  public/
    PROJECT_MEMORY.md
    guide/
      screenshots/
    ...

  data/
    runtime/private local data only
```

## חלוקת אחריות

### `CLAUDE.md`
כניסה מהירה לעוזר AI: זהות הריפו, היררכיית truth, runtimes, Git rules ואיסורים.

### `RULES.md`
גבול הריפו. קובע מה שייך לכאן ומה אסור לערבב.

### `PROJECT_RULES.md`
אמת Teacher Hub: LTI, imports, persistence, privacy, release gates ויכולות מאומתות.

### `PROJECT_MEMORY.md`
אמת Guide וההפרדה בינו לבין Teacher Hub. כל שינוי דרישה של Guide נרשם כאן לפני שינוי קוד.

### `public/PROJECT_MEMORY.md`
עותק deployment בלבד. חייב להיות זהה ל-`PROJECT_MEMORY.md` ואסור להתייחס אליו כמקור אמת עצמאי.

### `README.md`
תקציר ציבורי: מה יש בריפו, runtimes, איך מריצים ואיפה לקרוא אמת. אסור להשאיר בו "current state" היסטורי שסותר את מקורות האמת.

### `docs/`
תכנון, contracts, manifests ו-runbooks. מסמך מתוארך יכול לתעד היסטוריה, אך חייב לסמן בבירור אם אינו current truth.

### `STATE/`
ראיות ו-snapshots. קובץ STATE ישן אינו גובר על truth עדכני. אין להשתמש ב-STATE dated snapshot כהוכחה שיכולת עדיין פעילה בלי אימות עדכני.

## חריג קיים — `luz-teddy/`
`luz-teddy/` אינו חלק ממוצרי Moodle. מקור האמת שלו כבר בריפו `yanivmizrachiy/luz-teddy`; העותק כאן נשמר כתאימות בלבד עד מעבר בטוח של הקישור הציבורי. אין להרחיבו כאן ואין למחוק בלי אישור ואימות חלופה.

## כלל אי-סתירה

במקרה של סתירה:

1. `RULES.md` קובע את גבול הריפו.
2. עבור Teacher Hub — `PROJECT_RULES.md` קובע.
3. עבור Guide — `PROJECT_MEMORY.md` קובע.
4. STATE מספק evidence בלבד ולא גובר על truth חדש יותר.
5. `README.md`, `docs/` ו-`CLAUDE.md` חייבים להסתנכרן עם המקורות הקנוניים.

## כלל ניקיון

אין להשאיר כ-current truth:
- branch ישן שמסומן כ"ענף פעיל".
- runtime ישן שמסומן כקנוני.
- מסמכי status ישנים ללא תאריך/סימון snapshot.
- קוד מת או implementation מקביל בלי owner ברור.
- מסמכי truth כפולים עם סמכות מתחרה.
- נתוני תלמידים אמיתיים, raw Moodle exports או secrets.
- לוגים זמניים ותיקיות backup שאינן evidence מכוון.

ענפים היסטוריים אינם מקור אמת. לפני מחיקת branch חייבים להוכיח שהוא merged/superseded ושאין עליו PR או עבודה פעילה.
