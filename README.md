# `yanivmizrachiy/www` — Moodle Teacher Hub + Guide

עודכן: 2026-09-10

הריפו מכיל **שני מוצרי Moodle נפרדים** ומוגדרים היטב:

| מוצר | Runtime קנוני | תפקיד |
|---|---|---|
| Moodle Teacher Hub | `https://www-tijc.onrender.com` | כלי מורה RTL מתוך Moodle |
| Guide | `https://yanivmizrachiy.github.io/www/guide/` | מצגת/מדריך Moodle סטטי למורים |

ה-Guide נבנה מ-`main` ומפורסם אוטומטית לענף `deploy/guide-static`. Render אינו מפרסם ואינו מאמת את ה-Guide.

## מקור אמת

סדר הקדימות המחייב:

1. `PROJECT_MEMORY.md` — מקור האמת הקנוני ברמת הריפו, כולל חלוקת המוצרים וה-Runtimes.
2. `PROJECT_RULES.md` — אמת מפורטת של Moodle Teacher Hub בלבד.
3. `RULES.md` — גבולות ריפו, פרטיות וכללי עבודה.
4. `STATE/**` — ראיות ו-snapshots מתוארכים; קובץ ישן אינו הופך לענף/Runtime פעיל.
5. `docs/**` — חוזים, runbooks, ארכיטקטורה והיסטוריה.

## Moodle Teacher Hub

המסלול הקנוני הוא:

```text
Moodle External Tool
  -> Render
  -> /api/lti/launch
  -> React Moodle Teacher Hub
```

כתובות מרכזיות:

```text
Runtime: https://www-tijc.onrender.com
LTI:     https://www-tijc.onrender.com/api/lti/launch
Health:  https://www-tijc.onrender.com/health
```

Teacher Release נשאר **NO** עד שכל שערי האימות הרלוונטיים עוברים.

Termux/Cloudflare, Localtunnel ונתיבי recovery ישנים אינם runtime קנוני. workflow של Termux, אם נשמר, הוא fallback ידני בלבד ואסור לדווח עליו כ-production.

## Guide

- מקור השקפים היחיד: `src/data/guideDeck.ts`.
- צילומי מסך אמיתיים בלבד מתוך Moodle.
- שקף ללא צילום אמיתי נשאר `needs-capture` ואינו מתפרסם.
- רשימת החוסרים: `docs/GUIDE_MISSING_CAPTURES.md`.
- מניפסט נכסים: `docs/GUIDE_SCREENSHOTS_MANIFEST.md`.
- פרסום: `Guide Static Always-On`.
- אימות חי: `Guide Live Smoke`.

## אמת ופרטיות

- אין דמו, תלמידים מזויפים, ציונים מזויפים, זמן פעילות מומצא או כפתורי סרק.
- אין secrets בריפו.
- אין קבצי תלמידים פרטיים, raw student rows, raw logs או exports פרטיים בריפו.
- אין סימון production-ready או PASS בלי בדיקה מתאימה.
- Guide ו-Teacher Hub אינם חולקים runtime/proof ואסור להסיק מצב של אחד מהשני.

## פיתוח מקומי

```bash
npm install
npm run check
npm run typecheck
npm run audit:guide
npm run build
npm run doctor
```

בדיקת Teacher Hub מקומית:

```text
http://127.0.0.1:3000/health
```

Local dev אינו ראיית production. ראיות Teacher Hub חיות נרשמות ב-`STATE/evidence-log.md`; ראיות Guide חיות נבדקות מול GitHub Pages.

## חריג ריפו זמני

`luz-teddy/` הוא מוצר בית-ספרי היסטורי שאינו חלק מ-Teacher Hub או Guide. אין להרחיב אותו כאן ואין למחוק אותו עד העברה מאומתת לריפו נפרד ובדיקת הקישור החדש.

---

<details>
<summary>היסטוריית README ממאי 2026 — נשמרת כראיה בלבד, לא כמצב נוכחי</summary>

<!-- MTH_CURRENT_STATE_20260512_START -->
## Historical state — 2026-05-12

Canonical branch at that snapshot: `main`
Live runtime: `https://www-tijc.onrender.com`
Teacher release: **NO**

Verified live at that snapshot:
- `/health`
- `/api/release/readiness`
- `/api/persistence/validate`

Supabase production persistence was verified.
Real Moodle E2E and multi-teacher isolation were still not verified at that snapshot.
<!-- MTH_CURRENT_STATE_20260512_END -->

<!-- MTH_README_CURRENT_STATUS_20260510_START -->
## Historical status snapshot — 2026-05-10

המערכת עברה שלב מוצרי חשוב:

- Render runtime פעיל ב־`https://www-tijc.onrender.com`.
- LTI 1.3 עובד מול Moodle.
- NRPS עובד ומחזיר 62 משתתפים אמיתיים: 59 תלמידים ו־3 מורים.
- NRPS אינו מחזיר שמות/מיילים כרגע.
- ייבוא Participants אמיתי הצליח.
- נקלטו 62 שורות Participants.
- עמוד תלמידים מציג שמות ומיילים אמיתיים מתוך הייבוא.
- ציונים, לוגים, זמן תרגול ודוחות עדיין לא סומנו כעובדים באותו snapshot עד מקור נתונים אמיתי.

Updated: 2026-05-10T05:10:58Z
<!-- MTH_README_CURRENT_STATUS_20260510_END -->

הריפו הרשמי והמחייב של הפרויקט היה ונשאר:

```text
yanivmizrachiy/www
```

### מטרת Teacher Hub ההיסטורית שנשמרת

Moodle Teacher Hub הוא כלי מורה בעברית מלאה וב־RTL שנפתח מתוך Moodle באמצעות LTI, מזהה מורה ומרחב לימודי, ומציג נתוני Moodle אמיתיים בלבד: תלמידים, ציונים, פעילות, דוחות וייצוא.

המערכת אינה מציגה דמו ואינה ממציאה נתונים. כל נתון חייב להגיע ממקור אמיתי: LTI launch מאומת, ייבוא דוחות Moodle אמיתיים או Moodle Web Services API אם קיים token אמיתי ומאומת.

### נתיבי runtime היסטוריים

Termux / Cloudflare temporary URLs, Localtunnel, Supabase Gateway forwarding route, `legacy /lti/launch-1p1` ו-`legacy /dev/login` תועדו כנתיבים שאינם המסלול הפעיל.

Supabase נשאר רלוונטי למסד נתונים, ייבוא ו-RPC; לא כנתיב LTI קנוני.

### Render snapshot

Build command שתועד:

```bash
npm ci --include=dev && npm run build
```

Start command:

```bash
npm run start
```

Health check:

```text
/health
```

משתני סביבה שתועדו:

```text
NODE_ENV=production
PORT=10000
COOKIE_SECURE=true
APP_BASE_URL=https://www-tijc.onrender.com
LTI_CONSUMER_KEY=yaniv-lti-tool
LTI_SHARED_SECRET=<same value as Moodle, never commit>
VITE_SUPABASE_URL=https://ncoqanascubqkxfvucfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon key>
SUPABASE_SERVICE_ROLE_KEY=<server-only key, optional, never expose to browser>
```

### Historical data workflow

באותו שלב תועד סדר עבודה של Participants → Gradebook → Logs → Activity Completion, תוך איסור על המצאת נתונים או זמן פעילות.

באותו README הופיע הענף `gemini/ai-studio-sync-20260428-193953` כענף עבודה פעיל. הוא **אינו ענף פעיל כיום**; האזכור נשמר כאן כהיסטוריה בלבד ואסור להשתמש בו ל-deployment או כ-source of truth.

הסטטוסים הישנים של import/readiness נשמרים במלואם בקבצי `STATE/` וב-Git history. אין להסיק מהם readiness נוכחי בלי בדיקה חיה עדכנית.

</details>
