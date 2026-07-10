<!-- MTH_CURRENT_STATE_20260710_START -->
## Current state — 2026-07-10

Working branch: `rebuild/lti13-secure-teacher-hub` (verified, clean).
Live runtime: `https://www-tijc.onrender.com` (still serving the older
`gemini/recovery-sync-20260503-073319` branch until a deliberate cutover).
Teacher release: **NO** (blocked on one real Moodle launch test — by design).

What the rebuild delivers (all verified: typecheck + build + a self-contained
end-to-end LTI launch test, `npm run test:lti:e2e`, 14/14):
- Secure server-mediated data: the browser talks only to `/api/*`; the
  Supabase service-role key stays server-side. Real LTI 1.1 (OAuth1 HMAC-SHA1)
  and LTI 1.3 (RS256 JWT vs platform JWKS, nonce) launch verification.
- Every data endpoint matches the REAL live DB schema 1:1 (plain tables:
  students / courses / teachers / grade_items / grade_results / log_events /
  import_batches / course_sections / course_tasks / task_completions /
  teacher_sessions / moodle_sites — NOT the old imported_*/lti_get_* model).
- Two live-DB fixes applied: dropped the world-readable `teacher_sessions`
  SELECT policy; created the 3 missing course-structure tables (see
  `supabase/manual_sql/`).
- Full Hebrew/RTL teacher UI, three fully-separated products (teacher tool /
  `/guide` presentation / `/admin-hub` control center), repo cleaned, and the
  branch list reduced from 141 to 3.

Cutover to go live: Render -> service `www` -> Settings -> Branch ->
`rebuild/lti13-secure-teacher-hub`. Env (service-role key, all LTI13_*) is
already set. Real Moodle E2E and multi-teacher isolation are still not verified.
<!-- MTH_CURRENT_STATE_20260710_END -->

# Moodle Teacher Hub — www

<!-- MTH_README_CURRENT_STATUS_20260510_START -->
## סטטוס אמת עדכני — 2026-05-10

המערכת עברה שלב מוצרי חשוב:

- Render runtime פעיל ב־`https://www-tijc.onrender.com`.
- LTI 1.3 עובד מול Moodle.
- NRPS עובד ומחזיר 62 משתתפים אמיתיים: 59 תלמידים ו־3 מורים.
- NRPS אינו מחזיר שמות/מיילים כרגע.
- ייבוא Participants אמיתי הצליח.
- נקלטו 62 שורות Participants.
- עמוד תלמידים מציג שמות ומיילים אמיתיים מתוך הייבוא.
- ציונים, לוגים, זמן תרגול ודוחות עדיין לא מסומנים כעובדים עד שייכנסו ממקור נתונים אמיתי.

השלב הבא אינו פיצ׳ר חדש. השלב הבא הוא סידור ריפו, גיבוי מקומי, ו־persistence קבוע לפני הרחבת יכולות.

Updated: 2026-05-10T05:10:58Z
<!-- MTH_README_CURRENT_STATUS_20260510_END -->

הריפו הרשמי והמחייב של הפרויקט הוא:

```text
yanivmizrachiy/www
```

הריפו הזה הוא מקור האמת היחיד להמשך העבודה על Moodle Teacher Hub.

## מטרת המערכת

Moodle Teacher Hub הוא כלי מורה בעברית מלאה וב־RTL שנפתח מתוך Moodle באמצעות LTI 1.0/1.1, מזהה מורה ומרחב לימודי, ובהמשך מציג נתוני Moodle אמיתיים בלבד: תלמידים, ציונים, פעילות, דוחות וייצוא.

המערכת אינה מציגה דמו ואינה ממציאה נתונים. כל נתון חייב להגיע מאחד המקורות האמיתיים הבאים:

1. LTI launch מאומת — לכניסה, מורה, תפקיד והקשר מרחב.
2. ייבוא דוחות Moodle אמיתיים — Participants, Gradebook, Logs, Activity Completion.
3. Moodle Web Services API רק בעתיד, אם יתקבל token אמיתי ומאומת.

## ארכיטקטורה פעילה נכון לעכשיו

המסלול הפעיל והקבוע הוא:

```text
Moodle External Tool
  -> Render permanent runtime
  -> /api/lti/launch
  -> React Moodle Teacher Hub
```

כתובת Render קבועה:

```text
https://www-tijc.onrender.com
```

כתובת LTI קנונית לשימוש ב־Moodle:

```text
https://www-tijc.onrender.com/api/lti/launch
```

## מה לא פעיל יותר כנתיב LTI

המסלולים הבאים אינם נתיב העבודה הפעיל:

```text
Termux / Cloudflare temporary URLs
Localtunnel temporary URLs
Supabase Gateway forwarding route
legacy /lti/launch-1p1
legacy /dev/login
```

Supabase Gateway קיים ותועד, אך אינו מומלץ כרגע כנתיב LTI פעיל בגלל בעיית forwarding שהובילה ל־`MISSING_OAUTH_SIGNATURE`.

Supabase עדיין רלוונטי למסד נתונים, ייבוא, RPC עתידי ושמירת נתונים — לא כנתיב LTI פעיל כרגע.

## Render

הפריסה הקבועה מוגדרת דרך `render.yaml`.

Build command שעבד בפועל:

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

משתני סביבה נדרשים ב־Render:

```text
NODE_ENV=production
PORT=10000
COOKIE_SECURE=true
APP_BASE_URL=https://www-tijc.onrender.com
LTI_CONSUMER_KEY=yaniv-lti-tool
LTI_SHARED_SECRET=<same value as Moodle, never commit>
VITE_SUPABASE_URL=https://ncoqanascubqkxfvucfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable/anon key>
```

אופציונלי ורק בצד שרת:

```text
SUPABASE_SERVICE_ROLE_KEY=<server-only key, never expose to browser>
```

## מצב נתונים אמיתי

LTI 1.0/1.1 אינו מספק אוטומטית רשימת תלמידים, ציונים, לוגים או זמן פעילות.

כל עוד אין Moodle Web Services token מאומת, מצב העבודה האמיתי הוא:

```text
Manual Real Data Import
```

סדר הנתונים הנכון:

1. Participants / Students — ראשון, כדי להציג שמות תלמידים.
2. Gradebook / Grades — אחרי שתלמידים עובדים.
3. Logs — אחרי תלמידים/ציונים, לצורך פעילות וזמן תרגול מחושב.
4. Activity Completion — לפי דוח אמיתי.

## סטטוס אמת נוכחי

עובד/תועד:

- ריפו מקור אמת: `yanivmizrachiy/www`.
- ענף עבודה פעיל: `gemini/ai-studio-sync-20260428-193953`.
- Render runtime קבוע: `https://www-tijc.onrender.com`.
- LTI endpoint קנוני: `/api/lti/launch`.
- Build ב־Render עבר אחרי תיקון `vite: not found`.
- Termux/Cloudflare אינם נדרשים למסלול ההפעלה הקבוע.

לא מאומת עדיין:

- ייבוא Participants אמיתי מקצה לקצה.
- הצגת תלמידים אחרי ייבוא.
- ייבוא ציונים.
- ייבוא לוגים/זמני פעילות.
- ייבוא Activity Completion.
- Moodle Web Services API.
- מוכנות רחבה לכל המורים.

## מסמכי מקור אמת

- `PROJECT_RULES.md` — דף הכללים העליון.
- `STATE/project-status.md` — סטטוס אמת עדכני.
- `STATE/evidence-log.md` — לוג הוכחות.
- `docs/import-contract.md` — חוזה ייבוא נתוני Moodle.
- `docs/lti-contract.md` — חוזה LTI.
- `docs/moodle-api-contract.md` — חוזה Moodle API עתידי.
- `STATE/readiness-audit/render-production-launch-20260506.md`.
- `STATE/readiness-audit/error-audit-and-smarter-fixes-20260506.md`.
- `STATE/readiness-audit/deep-repo-audit-and-next-optimization-20260506.md`.

## הפעלה מקומית לפיתוח בלבד

```bash
npm install
npm run check
npm run build
npm run start
```

בדיקת health מקומית:

```text
http://127.0.0.1:3000/health
```

אין להשתמש ב־local dev כראיה לייצור. ראיות ייצור חייבות להירשם ב־`STATE/evidence-log.md`.

## השלב הבא היחיד לפני פיתוח רחב

לפני כל פיצ׳ר נוסף, צריך לסגור נתיב נתונים אמיתי ראשון:

```text
Participants report אמיתי ממודל
  -> Import page
  -> POST /api/import או נתיב שמירה מאומת
  -> Students page
  -> שמות תלמידים אמיתיים מופיעים
  -> תיעוד ב־STATE/evidence-log.md
```

אין להמשיך ל־Gradebook, Logs, Practice Time או דוחות מתקדמים לפני שזה עובד.

## כללי איסור קבועים

- אין דמו.
- אין תלמידים מזויפים.
- אין ציונים מזויפים.
- אין זמן פעילות מומצא.
- אין כפתורי סרק.
- אין secrets בריפו.
- אין קבצי תלמידים פרטיים בריפו.
- אין סימון production-ready בלי בדיקות אמיתיות.
