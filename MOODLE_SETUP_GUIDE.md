# Moodle Teacher Hub — מדריך חיבור LTI בטוח

סטטוס נוכחי: לא מפיצים למורים לפני בדיקת Launch אמיתי.

## כתובת LTI קנונית

הכתובת היחידה להגדרה במודל היא:

`APP_BASE_URL/api/lti/launch`

כאשר `APP_BASE_URL` הוא הכתובת הציבורית של השרת.

לדוגמה זמנית לבדיקה בלבד דרך LocalTunnel:

`https://YOUR-TUNNEL.loca.lt/api/lti/launch`

כתובת LocalTunnel היא זמנית ואינה קישור קבוע להפצה למורים.

## הגדרות במודל

- שם הכלי: Moodle Teacher Hub
- LTI version: LTI 1.0/1.1
- Consumer key: הערך שנקבע בשרת, למשל `yaniv-lti-tool`
- Shared secret: סוד אמיתי, לא לשמור בגיטהאב ולא בצילום מסך
- Tool URL: הכתובת הקנונית `/api/lti/launch`

## כלל בטיחות

המערכת תחסום Launch אם:
- חסר `LTI_SHARED_SECRET`
- חסר `oauth_signature`
- חסר `oauth_consumer_key`
- ה־Consumer key לא מתאים
- חתימת OAuth1 HMAC-SHA1 לא תקינה

## מה עדיין צריך לאמת

לפני שימוש אמיתי:
1. להגדיר Secrets רק בסביבת השרת.
2. להריץ Launch אמיתי מתוך Moodle.
3. לוודא שמתקבל `OAUTH_VERIFIED`.
4. לוודא שהמורה רואה רק את נתוני המרחב שלו.
5. לוודא שאין נתוני דמו.
