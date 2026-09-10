# Moodle Teacher Hub — מדריך חיבור LTI בטוח

עודכן: 2026-09-10

> זהו מדריך setup ל-Teacher Hub בלבד. מקור האמת המפורט של המוצר הוא `PROJECT_RULES.md`; חוזה הריפו והרuntimes נמצא ב-`PROJECT_MEMORY.md`.

Teacher Release: **NO** — אין להפיץ למורים על בסיס setup בלבד; readiness דורש את שערי האימות העדכניים.

## Runtime וכתובת LTI קנוניים

Runtime הקנוני של Teacher Hub:

```text
https://www-tijc.onrender.com
```

כתובת LTI 1.0/1.1 הקנונית להגדרה במודל:

```text
https://www-tijc.onrender.com/api/lti/launch
```

אין להשתמש ב-LocalTunnel, trycloudflare, Termux או URL זמני ככתובת production. מסלולים כאלה עשויים להופיע במסמכי STATE היסטוריים לצורכי פיתוח/ראיה בלבד.

ה-Guide הוא מוצר נפרד ב-GitHub Pages ואינו חלק מהגדרת LTI של Teacher Hub.

## הגדרות במודל

- שם הכלי: Moodle Teacher Hub.
- LTI version: LTI 1.0/1.1 עבור `/api/lti/launch` הקנוני.
- Consumer key: הערך המוגדר בסביבת השרת; אין להסיק אותו מקובץ היסטורי אם אינו תואם לסביבה החיה.
- Shared secret: סוד אמיתי שקיים רק בסביבת השרת; לעולם לא ב-GitHub או בצילום מסך.
- Tool URL: `https://www-tijc.onrender.com/api/lti/launch`.

ל-LTI 1.3 קיימים endpoints וקוד אבחוני/שירותים בריפו, אך אין להסיק readiness ל-LTI 1.3 רק מעצם קיומם; יש לפעול לפי `PROJECT_RULES.md` והראיות החיות העדכניות.

## כלל בטיחות

במסלול OAuth1/LTI 1.1 המערכת חייבת לדחות Launch שאינו עומד באימות הנדרש, לרבות מצבים כמו:
- חסר `LTI_SHARED_SECRET`.
- חסר `oauth_signature`.
- חסר `oauth_consumer_key`.
- Consumer key שאינו מתאים למדיניות השרת.
- חתימת OAuth1 HMAC-SHA1 לא תקינה.

אין לשנות את launch flow או להחליש אימות כדי "להעביר" setup.

## אימות לפני שימוש אמיתי

לפני טענה שהתקנה/קורס מסוים מוכן:
1. Secrets מוגדרים רק בסביבת השרת.
2. מבוצע Launch אמיתי מתוך Moodle בהקשר המורה/קורס הנכון.
3. אימות החתימה/ה-session מצליח לפי ה-flow הקנוני.
4. נבדק שהמורה רואה רק נתונים השייכים להקשר שלו.
5. אין demo/fake data ואין raw PII בראיות.
6. Teacher Release ושאר capability gates נבדקים לפי ה-HEAD וה-runtime הנוכחיים, לא לפי log היסטורי.

## ראיות

תוצאות בדיקה מתוארכות נרשמות ב-`STATE/evidence-log.md` או בקובץ STATE מתאים. PASS ישן אינו proof אוטומטי ל-commit או deployment חדש.
