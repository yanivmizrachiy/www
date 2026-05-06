# Moodle Teacher Hub — www

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
