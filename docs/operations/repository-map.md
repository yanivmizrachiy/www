# Repository Map — `yanivmizrachiy/www`

עודכן: 2026-09-10

מפת הריפו נועדה להסביר אחריות ומיקום. היא אינה מקור אמת עצמאי.

## היררכיית אמת

```text
PROJECT_MEMORY.md         מקור אמת קנוני ברמת הריפו + Guide + חוזה ההפרדה
PROJECT_RULES.md          אמת מפורטת — Moodle Teacher Hub
RULES.md                  גבולות ריפו, פרטיות וכללי עבודה
STATE/                    evidence, snapshots והיסטוריה
README.md                 תקציר ציבורי וניווט
CLAUDE.md                 entrypoint תפעולי לעוזר AI
```

`public/PROJECT_MEMORY.md` הוא mirror פריסתי בלבד של `PROJECT_MEMORY.md` ואינו מקור אמת עצמאי.

## שני מוצרים ושני runtimes

### Moodle Teacher Hub
- runtime קנוני: `https://www-tijc.onrender.com` — Render.
- קוד עיקרי: `src/`, `src/server.js`, LTI, imports ו-Supabase.
- אמת מפורטת: `PROJECT_RULES.md`, בכפוף לחוזה הריפו ב-`PROJECT_MEMORY.md`.
- Teacher Release: **NO** עד מעבר השערים המחייבים.

### Guide
- runtime קנוני: `https://yanivmizrachiy.github.io/www/guide/` — GitHub Pages.
- deployment branch נגזר: `deploy/guide-static`, נבנה אוטומטית מ-`main`.
- deck קנוני: `src/data/guideDeck.ts`.
- screenshots: `public/guide/screenshots/`.
- אמת Guide: `PROJECT_MEMORY.md`.
- Render אינו מפרסם ואינו מאמת את Guide.

## מבנה קנוני

```text
www/
  CLAUDE.md
  PROJECT_MEMORY.md
  PROJECT_RULES.md
  RULES.md
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
    README.md
    CURRENT.md
    project-status.md
    evidence-log.md
    progress/
    readiness-audit/
    ...

  scripts/
    checks/
    maintenance/
    ...

  supabase/
    ...

  data/
    runtime/private local data only

  luz-teddy/
    historical compatibility exception
```

## חלוקת אחריות

### `CLAUDE.md`
כניסה תפעולית קצרה לעוזר AI: מקורות אמת, runtimes, Git rules ואיסורים. אינו מקור אמת מקביל.

### `PROJECT_MEMORY.md`
מקור האמת הקנוני ברמת הריפו. כולל את Guide, הפרדת המוצרים, runtimes וכללי הסנכרון.

### `PROJECT_RULES.md`
אמת מפורטת של Teacher Hub: LTI, imports, persistence, privacy, release gates ויכולות מאומתות. כפוף לחוזה הריפו הקנוני.

### `RULES.md`
גבולות הריפו: מה שייך לכאן, מה אסור לערבב וכללי פרטיות/עבודה.

### `README.md`
תקציר ציבורי בלבד. אסור לו להציג snapshot היסטורי כ-current truth.

### `docs/`
חוזים, manifests, ארכיטקטורה ו-runbooks. מסמכים היסטוריים נשמרים אך אינם גוברים על המקורות הקנוניים.

### `STATE/`
ראיות, verification records ו-snapshots. PASS ישן מוכיח את ה-commit/runtime/date שבו נבדק בלבד.

### `src/` ו-`public/`
קוד ונכסים פעילים. ל-Guide יש deck יחיד וצילומי Moodle אמיתיים בלבד; ל-Teacher Hub יש runtime/API נפרד.

## חריג קיים — `luz-teddy/`

`luz-teddy/` אינו חלק מ-Teacher Hub או Guide. אין להרחיב אותו כאן ואין למחוק אותו בלי העברה מאומתת לריפו נפרד, בדיקת הקישור החלופי ואישור מפורש.

## כלל אי-סתירה

במקרה של סתירה:

1. `PROJECT_MEMORY.md` קובע את חוזה הריפו, הפרדת המוצרים ו-Guide.
2. בתוך Teacher Hub, `PROJECT_RULES.md` מוסיף אמת מפורטת כל עוד אינו סותר את `PROJECT_MEMORY.md`.
3. `RULES.md` מוסיף גבולות פרטיות/עבודה כל עוד אינו סותר את שני הקבצים לעיל.
4. STATE מספק evidence בלבד.
5. `README.md`, `CLAUDE.md` ו-`docs/` חייבים להסתנכרן בהתאם.

## כלל ניקיון

אסור להשאיר כ-current truth:
- branch היסטורי שמסומן כענף פעיל.
- runtime ישן שמסומן כקנוני.
- snapshot מתוארך שמוצג כאילו הוא proof ל-HEAD הנוכחי.
- source-of-truth נוסף עם סמכות מתחרה.
- implementation כפול בלי owner ברור.
- נתוני תלמידים אמיתיים, raw Moodle exports, secrets או private runtime data.

ענפים היסטוריים אינם מקור אמת. לפני מחיקת branch צריך להוכיח שהוא merged/superseded ושאין עליו PR או עבודה פעילה.
