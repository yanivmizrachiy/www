# Moodle Teacher Hub — מדריך חיבור LTI בטוח

עודכן: 2026-09-11

המסמך הזה שייך ל-**Moodle Teacher Hub בלבד**. ה-Guide הוא מוצר סטטי נפרד שמוגש מ-GitHub Pages ואינו משתמש ב-Render או בנתיב LTI של Teacher Hub.

Teacher Release נשאר **NO** עד מעבר כל שערי האימות הנדרשים.

## כתובת LTI קנונית

הכתובת היחידה להגדרה במודל עבור Teacher Hub היא:

`https://www-tijc.onrender.com/api/lti/launch`

ה-Runtime הקנוני הוא:

`https://www-tijc.onrender.com`

אין להשתמש ב-LocalTunnel, Cloudflare URL זמני, Termux או כתובת בדיקה אחרת ככתובת הפצה למורים. הם אינם Runtime קנוני.

## הגדרות במודל

- שם הכלי: Moodle Teacher Hub
- LTI version: LTI 1.0/1.1 עבור נתיב `/api/lti/launch` הקיים
- Consumer key: הערך האמיתי שמוגדר בסביבת השרת
- Shared secret: סוד אמיתי; אסור לשמור אותו ב-GitHub, בתיעוד, בלוג או בצילום מסך
- Tool URL: `https://www-tijc.onrender.com/api/lti/launch`

## כלל בטיחות

המערכת חייבת לחסום Launch כאשר אחד מהתנאים הבאים מתקיים:

- חסר `LTI_SHARED_SECRET`
- חסר `oauth_signature`
- חסר `oauth_consumer_key`
- ה-Consumer key אינו מתאים
- חתימת OAuth1 HMAC-SHA1 אינה תקינה

אין להשתמש ב-direct browser access כהוכחת Launch תקין מתוך Moodle.

## מה נחשב הוכחה אמיתית

לפני Teacher Release YES נדרש, בין השאר:

1. Secrets מוגדרים רק בסביבת השרת.
2. Launch אמיתי מתוך Moodle עובר אימות.
3. ה-context של המורה והקורס מזוהה נכון.
4. בידוד מורה/קורס נבדק בסביבה חיה ולא רק סטטית.
5. המורה רואה רק נתונים ששייכים למרחב שלו.
6. אין Demo, fake data, fake sync או PASS שמבוסס רק על קיום קוד.

מצב אמת מפורט נמצא ב-`PROJECT_RULES.md`; מקור האמת הקנוני ברמת הריפו הוא `PROJECT_MEMORY.md`, ומצב תמציתי נמצא ב-`STATE/CURRENT.md`.
