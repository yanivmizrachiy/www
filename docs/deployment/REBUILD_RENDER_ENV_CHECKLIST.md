# רשימת בדיקה — משתני סביבה ב-Render לענף השחזור

נכתב 2026-07-09. רלוונטי כשעוברים לפרוס את `rebuild/lti13-secure-teacher-hub` (המבוסס על `codex/deep-truth-sync`).

## חובה (בלי זה השרת לא עולה נכון / הכלי לא יעבוד)

| משתנה | מה זה | מקור |
|---|---|---|
| `APP_BASE_URL` | הכתובת הציבורית של האתר (למשל `https://www-tijc.onrender.com`) | קבוע, כבר ידוע |
| `VITE_SUPABASE_URL` | כתובת פרויקט Supabase | `https://ncoqanascubqkxfvucfz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | המפתח הסודי לצד-שרת בלבד | **חובה לוודא שמוגדר ב-Render — אף פעם לא בקוד** |
| `LTI_CONSUMER_KEY` / `LTI_SHARED_SECRET` | LTI 1.1 (לתאימות אחורה) | קיים כבר בשימוש הנוכחי |

## LTI 1.3 — קריטי, ויש כבר רישום אמיתי מוכח בקוד

בקוד (`src/server.js`) יש ערכי ברירת מחדל **קשיחים** שמוכיחים רישום אמיתי שכבר בוצע מול Moodle הארצי של משרד החינוך:

```
LTI13_PLATFORM_ISSUER   ברירת מחדל: https://moodlemoe.lms.education.gov.il
LTI13_CLIENT_ID         ברירת מחדל: WgIZjAqxrP2zFbz
LTI13_DEPLOYMENT_ID     ברירת מחדל: 3
```

**צריך לוודא ב-Render** (אם לא מוגדרים — הברירת מחדל הזו תיכנס לתוקף, מה שעלול להיות נכון אבל צריך אימות מפורש, לא הנחה):

| משתנה | הערה |
|---|---|
| `LTI13_PLATFORM_ISSUER` | לאמת שזה עדיין הערך הנכון |
| `LTI13_CLIENT_ID` | לאמת מול פרטי הרישום האמיתיים ב-Moodle |
| `LTI13_DEPLOYMENT_ID` | לאמת מול פרטי הרישום האמיתיים ב-Moodle |
| `LTI13_PLATFORM_JWKS_URL` | כתובת המפתחות הציבוריים של Moodle לאימות חתימה |
| `LTI13_PLATFORM_AUTH_URL` | כתובת ה-OIDC login-init של Moodle |
| `LTI13_PRIVATE_KEY_PEM` | **הסוד הפרטי של הכלי עצמו** — בלי זה NRPS/token-exchange לא יעבדו. **אין ברירת מחדל בקוד (נכון) — חובה שיהיה מוגדר.** |
| `LTI13_KEY_ID` | ה-`kid` שתואם למפתח הפרטי |
| `LTI13_TOKEN_URL` | כתובת שרת ה-token של Moodle (ל-client_credentials/NRPS) |
| `LTI13_ALLOWED_REGISTRATIONS` | רשימת רישומים מותרים (אם רלוונטי למספר בתי ספר/מופעים) |

## אופציונלי

| משתנה | מה זה |
|---|---|
| `MOODLE_WS_TOKEN` / `MOODLE_WS_BASE_URL` | Moodle Web Services (ברירת מחדל: `moodlemoe.lms.education.gov.il`) |
| `COOKIE_SECURE` | ברירת מחדל: `true` כש-`NODE_ENV=production`, אחרת `false` |
| `NODE_ENV` | `production` בפריסה האמיתית |

## הפעולה הנדרשת ממך

1. גש להגדרות Environment של שירות Render הקיים.
2. **צלם מסך של רשימת המשתנים הקיימים** (בלי לחשוף ערכים סודיים — רק שמות המשתנים, אפשר לטשטש/לא ללחוץ "reveal").
3. שלח לי — כך אדע בדיוק אילו משתנים כבר מוגדרים מהרישום הקודם ואילו חסרים, בלי לנחש.

**חשוב:** אם `LTI13_PRIVATE_KEY_PEM` כבר מוגדר ב-Render מעבודה קודמת — ייתכן שכל הרישום מול Moodle הארצי כבר מוכן ופעיל, וזה חוסך שלב שלם. אם הוא לא מוגדר, נצטרך ליצור זוג מפתחות חדש ולרשום את המפתח הציבורי (JWK) מול הרישום הקיים ב-Moodle (`client_id: WgIZjAqxrP2zFbz`), או לפתוח רישום LTI 1.3 חדש אם הקודם פג/אבד.
