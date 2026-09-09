# Moodle Teacher Hub + Guide — `yanivmizrachiy/www`

עודכן: 2026-09-10

הריפו מרכז שני מוצרי Moodle נפרדים שחולקים קוד/תשתית ריפו אך **לא runtime ולא truth model**:

1. **Moodle Teacher Hub** — כלי מורה עברי RTL שנפתח מתוך Moodle.
2. **Guide** — מצגת/מדריך Moodle סטטי למורים עם צילומי מסך אמיתיים בלבד.

## Runtimes קנוניים

| מוצר | Runtime | פריסה |
|---|---|---|
| Teacher Hub | `https://www-tijc.onrender.com` | Render |
| Guide | `https://yanivmizrachiy.github.io/www/guide/` | GitHub Pages מתוך `deploy/guide-static`, נבנה אוטומטית מ-`main` |

Render אינו מפרסם ואינו מאמת את Guide.

## היררכיית אמת

- `RULES.md` — גבול הריפו ומה מותר/אסור לערבב.
- `PROJECT_RULES.md` — אמת מוצר קנונית של Teacher Hub.
- `PROJECT_MEMORY.md` — אמת מוצר קנונית של Guide וחוזה ההפרדה בין המוצרים.
- `public/PROJECT_MEMORY.md` — mirror פריסתי בלבד; אינו מקור אמת עצמאי.
- `STATE/` — evidence, snapshots והיסטוריה. מסמך STATE ישן אינו גובר על truth חדש יותר.
- `README.md` — תקציר ציבורי בלבד.

## Moodle Teacher Hub

מטרת המוצר: להציג למורה מידע אמיתי בלבד מתוך Moodle לפי context, הרשאות וקורס אמיתיים.

### Runtime ו-LTI

```text
Moodle External Tool
  -> https://www-tijc.onrender.com
  -> /api/lti/launch
  -> React Moodle Teacher Hub
```

LTI endpoint קנוני:

```text
https://www-tijc.onrender.com/api/lti/launch
```

Health:

```text
https://www-tijc.onrender.com/health
```

### אמת נתונים מאומתת

המספרים הקנוניים והגבולות המלאים נמצאים ב-`PROJECT_RULES.md`. הראיות הקיימות כוללות aggregate אמיתי של:

```text
students = 62
grade_items = 243
grade_results = 1693
log_events = 89995
```

אין לפרש Logs כמשך זמן רשמי ללא שדה duration רשמי. Teacher Release נשאר **NO**.

### חסמים עיקריים

- Moodle Web Services auto-sync דורש token אמיתי ובדיקת API חיה.
- multi-teacher / multi-course isolation דורש evidence live עדכני לפי שערי המוצר.
- RLS enforcement דורש בדיקת חציית-מורה חיה מתועדת.
- אין להציג capability כ-proven בלי evidence מתאים.

## Guide

ה-Guide הוא מוצר סטטי נפרד, בנוי כמצגת אינטראקטיבית למורים.

עקרונות מחייבים:

- צילומי Moodle אמיתיים בלבד.
- אין Demo / Placeholder / fake capture.
- שקף שחסר לו צילום אמיתי נשאר מוסתר דרך publication gate.
- deck קנוני יחיד: `src/data/guideDeck.ts`.
- screenshot assets: `public/guide/screenshots/`.
- missing captures: `docs/GUIDE_MISSING_CAPTURES.md`.
- screenshot provenance/manifest: `docs/GUIDE_SCREENSHOTS_MANIFEST.md`.
- Guide נבנה ונבדק דרך `Guide Static Always-On` ו-`Guide Live Smoke`.

## מבנה ריפו

```text
CLAUDE.md                  AI entrypoint / governance summary
RULES.md                   repository boundary
PROJECT_RULES.md           Teacher Hub truth
PROJECT_MEMORY.md          Guide truth + split contract
README.md                  public overview

.github/workflows/         CI / Guide Pages / Render checks
src/                       product code
public/                    static assets + Guide deployment inputs
docs/                      contracts, manifests, architecture, runbooks
STATE/                     evidence and dated snapshots
scripts/                   checks, audits and maintenance
supabase/                  schema/migrations/plans
luz-teddy/                 compatibility exception; not a Moodle product
```

מפת ריפו מפורטת: `docs/operations/repository-map.md`.

## פיתוח מקומי

```bash
npm ci
npm run check
npm run typecheck
npm run audit:guide
npm run build
npm run doctor
```

להפעלת Teacher Hub מקומית, לפי הצורך:

```bash
npm run start
```

אין להשתמש ב-local build כראיית production.

## Git

- `main` הוא הענף הקנוני והמוגן.
- אין commit ישיר ל-`main`.
- כל שינוי עובר branch + PR + checks.
- `deploy/guide-static` הוא ענף פריסה נגזר ל-Guide, לא ענף authoring.
- ענפים היסטוריים אינם מקור אמת.

## פרטיות ואבטחה

אסור להכניס לריפו:

- secrets, tokens, cookies או private headers.
- raw student rows.
- raw Moodle exports.
- ציונים/לוגים גולמיים עם PII.
- תעודות זהות או מזהים פנימיים מיותרים.

## חריג `luz-teddy/`

`luz-teddy/` אינו חלק מ-Teacher Hub או Guide. מקור האמת שלו נמצא ב-`yanivmizrachiy/luz-teddy`; העותק כאן נשמר כתאימות בלבד עד מעבר בטוח של הקישור הציבורי. אין להרחיב או למחוק אותו ללא אימות ואישור מפורש.

## כלל עליון

אין דמו, אין נתונים מומצאים, אין הודעות הצלחה מזויפות, ואין ערבוב בין Teacher Hub, Guide, יומן Google או לוז בית ספר.
