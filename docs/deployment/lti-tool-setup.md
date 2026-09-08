# Moodle Teacher Hub — LTI 1.1 Setup

עודכן: 2026-09-08

מסמך תפעולי בלבד. מקור האמת של Teacher Hub הוא `PROJECT_RULES.md`; חוזה LTI נמצא ב־`docs/lti/lti-contract.md`.

## Runtime ו־Launch URL

Runtime קנוני:

`https://www-tijc.onrender.com`

Launch URL קנוני:

`https://www-tijc.onrender.com/api/lti/launch`

אין להשתמש ב־localhost, LocalTunnel, Cloudflare temporary URLs או נתיבי launch ישנים כהגדרה קבועה של Moodle.

## הגדרה ב־Moodle

- Tool name: `Moodle Teacher Hub`
- LTI version שנצפתה במערכת: `LTI 1.0/1.1`
- Consumer key: הערך המוגדר בסביבת השרת; הערך הידוע הוא `yaniv-lti-tool`
- Shared secret: נשמר רק בסביבת deploy / secrets ואסור להכניסו ל־GitHub
- Tool URL: ה־Launch URL הקנוני לעיל

## תנאי Launch תקין

השרת חייב לאמת OAuth1 HMAC-SHA1 ולדחות launch כאשר חסרים או שגויים consumer key, signature או shared secret.

Launch תקין צריך ליצור session מוגבל בזמן עם context של המורה והקורס ככל שה־claims זמינים.

LTI הוא שער כניסה/context בלבד; הוא אינו הוכחה לכך שקיימים תלמידים, ציונים, לוגים או Moodle Web Services API.

## בדיקת אמת

לפני שינוי סטטוס release:

1. לפתוח את הכלי מתוך קורס Moodle אמיתי כמורה מורשה.
2. לוודא שה־launch עובר אימות אמיתי ולא fallback/demo.
3. לוודא שה־course/teacher context שייך למרחב הנכון.
4. לוודא שאין cross-course/cross-teacher leakage.
5. לתעד evidence בלי raw PII ב־`STATE/evidence-log.md`.
6. להשאיר `Teacher Release = NO` עד שכל שערי ה־release ב־`PROJECT_RULES.md` עוברים.

## LTI 1.3

קיימת תשתית/אבחון LTI 1.3 בקוד, אך אין להציג אותה כנתיב production מוכח בלי בדיקות live מתועדות של login/launch, claims והרשאות.

## Secrets

אסור לשמור בריפו:

- `LTI_SHARED_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MOODLE_WS_TOKEN`
- `.env` אמיתי
- cookies/tokens
- Moodle exports עם מידע תלמידים
