# המודל של אוגוסט — August Experience

> **מקור האמת היחיד של הפרויקט.** אם יש סתירה בין קובץ אחר לבין מסמך זה — `README.md` קובע.

## הגדרת המוצר

August Experience היא שכבת חוויית־מורה חדשה מעל מרחב Moodle הקיים של משרד החינוך.

המורה נשאר באותו Moodle, עם אותה כתובת, אותו חשבון, אותם נתונים, אותן הרשאות ואותן פעולות מקור — אבל רואה סביבת עבודה חדשה שאנו מגדירים.

**Moodle הוא המנוע ומקור האמת. August Experience היא סביבת העבודה שהמורה רואה.**

הפרויקט אינו מצגת ההדרכה ל‑Moodle, אינו Moodle Teacher Hub / כלי LTI נפרד, אינו מערכת שמעתיקה קורסים, ואינו מערכת שמבקשת או שומרת סיסמת משרד החינוך. שלושת המוצרים נשארים מופרדים.

## ענף ומצב

- ענף עבודה: `feat/august-experience-v1`
- בסיס חזון: `august-moodle-model-20260823`
- גרסת הרחבה נוכחית: `0.5.0`
- `main`: לא שונה על ידי העבודה הזאת
- Teacher Release: **עדיין לא**
- הערכת מוכנות קוד/ריפו בלבד: כ־72%; תאימות אמיתית ל‑Moodle עדיין מחייבת בדיקות שטח.

## מה קיים ועובד ברמת הקוד

- Manifest V3 מוגבל ל־`https://moodlemoe.lms.education.gov.il/*`.
- זיהוי שמרני של דף קורס וסימני הרשאת מורה.
- Adapter Registry ו־Moodle Course Adapter קריאה בלבד.
- Compatibility scoring לפני mount; ציון לא מספיק בטוח משאיר Moodle רגיל.
- Fail-open בכל חוסר ודאות או חריגה.
- Premium August Shell ב־RTL עם hero, gradients, controlled glow, glass/blur, hierarchy חזקה וכרטיסי תוכן עשירים.
- חיפוש וסינון מקומיים בלבד.
- Command Palette מקומית עם `Ctrl/Cmd+K`.
- Feature flags מרכזיים.
- Motion engine עם Web Animations API ו־Reduced Motion.
- Dynamic refresh מבוקר באמצעות MutationObserver יחיד ומוגבל.
- Diagnostics מקומיים בלבד, ללא שליחת תוכן עמוד או מידע על תלמידים.
- כפתור חזרה מיידי ל־Moodle המקורי.
- אין כתיבה ל־Moodle ב־V1.
- אין איסוף credentials, cookies, tokens או telemetry של תוכן.

## ארכיטקטורה וכללי בטיחות

1. **Presentation-first V1** — התצוגה הראשונה קריאה בלבד מבחינת נתוני Moodle.
2. **Fail-open** — כל חוסר ודאות מחזיר/משאיר את Moodle המקורי.
3. **Teacher-only activation** — אין הפעלה על סמך טקסט תפקיד בלבד; נדרשים אותות capability/editing אמינים.
4. **DOM contract + confidence** — adapter מחלץ מודל סמנטי ומדווח התאמה; confidence נמוך = אין transformation.
5. **Mutation resilience** — שינויי AJAX/DOM עוברים דרך מנגנון refresh מרכזי ואידמפוטנטי.
6. **Native escape hatch** — תמיד קיימת דרך מיידית לחזור ל־Moodle הרגיל.
7. **Accessibility parity** — מקלדת, focus, landmarks, contrast, reduced motion, zoom ו־RTL הם תנאי שחרור.
8. **Privacy by construction** — מידע Moodle לא יוצא מהדפדפן ב־V1.
9. **Versioned adapters** — כל selectors של Moodle מרוכזים ב־adapters; UI לא פונה ישירות ל־DOM של Moodle.
10. **Portable design system** — שכבת העיצוב נשארת ניתנת להעברה עתידית ל־Theme/Plugin רשמי.
11. **Disable/rollback** — חייבת להיות יכולת ביטול מיידית לפני הפצה רחבה.
12. **Verified compatibility only** — אין לטעון “עובד על Moodle” בלי אימות של surface/browser בפועל.

## תחום V1

מותר: header/navigation של August, ארגון יחידות לכרטיסים, hierarchy/spacing/typography/RTL, חיפוש מקומי, קישורים ופעולות Moodle מקוריות, וחזרה מיידית ל־native view.

אסור: submit אוטומטי של forms, שינוי ציונים/תלמידים/פעילויות/תוכן, interception של login, שימוש ב־privileged endpoints לא מתועדים, הסתרת controls לא מזוהים, או הפעלה לתלמידים.

## מבנה ריפו נקי

```text
august-experience/
├── README.md                  # מקור האמת היחיד: מוצר, סטטוס, ארכיטקטורה וכללים
├── docs/
│   ├── TEACHER_USE.md         # הוראות תפעול בלבד למורה
│   └── RELEASE_GATES.md       # checklist ביצוע בלבד לפני שחרור
├── tests/
│   └── README.md              # חוזה fixtures ובדיקות; אין נתוני תלמידים
└── extension/
    ├── manifest.json
    └── src/
        ├── config.js
        ├── diagnostics.js
        ├── detector.js
        ├── compatibility.js
        ├── adapter-registry.js
        ├── adapters/moodle-course.js
        ├── command-palette.js
        ├── command-palette.css
        ├── motion.js
        ├── shell.js
        ├── styles.css
        ├── dynamic-refresh.js
        └── bootstrap.js
```

אין ליצור מסמכי vision/status/architecture מקבילים. שינוי מוצרי או החלטה קבועה מתעדכנים כאן בלבד. מסמכי `docs/` הם מסמכי פעולה ואינם מקור אמת חלופי.

## מה נשאר עד Teacher Release

- לאמת על מרחב Moodle אמיתי של מורה את selectors, capability signals וה־semantic extraction.
- לוודא שמורה מפעיל August ותלמיד נשאר 100% native.
- לבדוק unsupported pages ו־fail-open.
- לבדוק AJAX, refresh, back/forward וסוגי course format שבשימוש.
- לבדוק Chrome ו־Edge, גדלי מסך, 200% zoom, keyboard, focus, RTL, reduced motion ו־contrast.
- לכוון את הגרפיקה הסופית מול צילום/DOM אמיתי של מרחב מורשה.
- להוסיף fixtures מסוננים בלבד מתוך Moodle אמיתי ולבצע regression אוטומטי.
- לארוז build להפצה, להגדיר update/rollback, ולבדוק התקנה נקייה על מחשב מורה.
- לבצע pilot מורשה, לתקן blocker/high severity ולבצע regression סופי.
- רק לאחר שכל הסעיפים עברו — לתייג Teacher Release candidate.

## זרימת שימוש למורה

במסלול ההרחבה: המורה מתקין פעם אחת את August Experience, נכנס ל־Moodle של משרד החינוך בדרך הרגילה ומקליד את הסיסמה רק ב־Moodle. כאשר הוא פותח מרחב קורס מורשה, ההרחבה מזהה את ה־context ומציגה את August אם כל תנאי התאימות וההרשאה עוברים. בכל רגע ניתן לחזור ל־Moodle המקורי.

בעתיד, אם תהיה הרשאת Moodle Admin להתקנת Theme/Plugin רשמי, ניתן יהיה לספק את אותה חוויית UI בלי התקנה מקומית אצל כל מורה.

## מדיניות ניקיון

- שומרים רק קוד פעיל, tests שימושיים ומסמכי פעולה נחוצים.
- אין snapshots, screenshots או fixtures עם PII.
- אין מסמכי progress ארוכים; Git history הוא ההיסטוריה.
- אין קבצי archive/backup/generated בריפו הפעיל אלא אם הם נדרשים לבנייה או לבדיקה.
- אין כפילות בין README למסמכים אחרים.
- קוד ניסיוני שלא מחובר למסלול הפעיל צריך להימחק או להישאר בענף ניסוי נפרד, לא כאן.
