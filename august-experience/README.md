# המודל של אוגוסט — August Experience

## מה זה

שכבת חוויית־מורה חדשה מעל מרחב Moodle הקיים של משרד החינוך.

המורה נשאר באותו מרחב Moodle, עם אותה כתובת, אותו חשבון, אותם נתונים, אותן הרשאות ואותן פעולות מקור — אבל רואה סביבת עבודה חדשה שאנו מגדירים.

**Moodle הוא המנוע והמקור. August Experience היא סביבת העבודה שהמורה רואה.**

## מה זה לא

הפרויקט הזה אינו:

- מצגת ההדרכה ל-Moodle;
- Moodle Teacher Hub / כלי LTI נפרד;
- מערכת שמעתיקה קורסים;
- מערכת שמבקשת או שומרת סיסמת משרד החינוך.

שלושת המוצרים חייבים להישאר מופרדים.

## ענף העבודה

`feat/august-experience-v1`

בסיס החזון המקורי:

`august-moodle-model-20260823`

אין שינוי ב-`main` ואין Teacher Release בשלב זה.

## מצב נוכחי

גרסת ההרחבה: `0.4.0`

קיים כבר:

- Manifest V3;
- זיהוי שמרני של דף קורס והרשאת מורה;
- Adapter Registry;
- Moodle Course Adapter קריאה בלבד;
- Premium August Shell RTL;
- Hero, שכבות עומק, glass/blur וגרפיקה עשירה;
- חיפוש וסינון מקומי;
- command palette;
- feature flags;
- motion engine מתקדם עם Reduced Motion;
- dynamic refresh מבוקר;
- diagnostics מקומיים בלבד;
- Fail-open;
- כפתור חזרה מיידי ל-Moodle המקורי;
- אין כתיבה ל-Moodle ב-V1;
- אין איסוף סיסמאות או telemetry של תוכן/תלמידים.

## מבנה הפרויקט

```text
august-experience/
├── README.md                  # מקור כניסה לפרויקט
├── ARCHITECTURE_V1.md         # ארכיטקטורה וכללי בטיחות
├── docs/
│   ├── TEACHER_USE.md         # איך מורה ישתמש במוצר
│   └── RELEASE_GATES.md       # מה חייב לקרות עד 100%
├── STATE/
│   └── PROGRESS.md            # יומן התקדמות ומצב אמיתי
└── extension/
    ├── manifest.json
    └── src/
        ├── config.js
        ├── diagnostics.js
        ├── detector.js
        ├── adapter-registry.js
        ├── adapters/
        │   └── moodle-course.js
        ├── command-palette.js
        ├── command-palette.css
        ├── motion.js
        ├── shell.js
        ├── styles.css
        ├── dynamic-refresh.js
        └── bootstrap.js
```

## חוקי ברזל

1. Moodle נשאר מקור האמת.
2. אין איסוף סיסמאות.
3. V1 קריאה בלבד מבחינת נתוני Moodle.
4. אין שינוי ציונים, תלמידים, פעילויות או תוכן ללא פעולה מפורשת והרשאה אמיתית בגרסה עתידית.
5. זיהוי לא בטוח = Moodle רגיל.
6. תלמיד לא אמור לקבל את תצוגת August.
7. תמיד קיימת דרך מיידית לחזור ל-Moodle המקורי.
8. ידע Moodle DOM נשמר ב-adapters ולא מפוזר בקוד UI.
9. אין למחוק או למזג עם Teacher Hub/Presentation.
10. אין להכריז Teacher Release לפני שכל Release Gates עברו על Moodle אמיתי.

## מקור מצב

למצב העדכני ביותר:

`STATE/PROGRESS.md`

לדרישות הסיום:

`docs/RELEASE_GATES.md`

להסבר למורה:

`docs/TEACHER_USE.md`
