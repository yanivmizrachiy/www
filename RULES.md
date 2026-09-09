# RULES.md — www / Moodle products boundary

עודכן: 2026-09-10

## תפקיד הקובץ
`RULES.md` מגדיר את **גבול הריפו**. הוא אינו מחליף את מסמכי אמת המוצר.

היררכיה מחייבת:

- `RULES.md` — מה שייך לריפו ומה אסור לערבב.
- `PROJECT_RULES.md` — אמת המוצר של **Moodle Teacher Hub**.
- `PROJECT_MEMORY.md` — אמת המוצר של **Guide** וחוזה ההפרדה בינו לבין Teacher Hub.
- `STATE/` — ראיות, snapshots והיסטוריה; STATE ישן אינו גובר על מקור אמת עדכני.
- `README.md` — תקציר ציבורי בלבד.

## מה שייך לריפו
הריפו `yanivmizrachiy/www` מרכז שני מוצרי Moodle נפרדים:

1. **Moodle Teacher Hub** — כלי מורה עברי RTL, runtime קנוני ב-Render.
2. **Guide** — מצגת/מדריך Moodle סטטי למורים, runtime קנוני ב-GitHub Pages.

שיתוף ריפו אינו אומר שיתוף runtime, deployment, UI, proof או נתונים. אסור לערבב בין שני המוצרים.

### Runtimes קנוניים

- Teacher Hub: `https://www-tijc.onrender.com`
- Guide: `https://yanivmizrachiy.github.io/www/guide/`

Render אינו מפרסם ואינו מאמת את ה-Guide.

## מותר בריפו זה
- קוד ותיעוד של Moodle Teacher Hub.
- LTI / Moodle / Render / Supabase הקשורים ל-Teacher Hub.
- קוד, תיעוד ונכסים אמיתיים של Guide.
- GitHub Pages / workflows / audits הקשורים ל-Guide.
- STATE וראיות הקשורים ישירות למוצרי Moodle האלה.

## אסור בריפו זה
- אפליקציית יומן Google.
- SmartCalendar.
- קוד Apps Script של Google Calendar.
- סנכרון או ניהול אירועי Google Calendar.
- קבצי Drive/Calendar שאינם חלק ישיר ומאומת מעבודת Moodle.
- דשבורד כללי של כל הריפואים.
- הרחבה של מערכות שאינן Teacher Hub או Guide.

## חריג תאימות ידוע — `luz-teddy/`
`luz-teddy/` הוא עותק/מערכת היסטורית שאינה חלק משני מוצרי Moodle. מקור האמת שלו נמצא בריפו נפרד `yanivmizrachiy/luz-teddy`.

מותר להשאיר את העותק כאן רק לצורך תאימות/קישור ציבורי קיים. אסור להרחיב אותו כאן. אין למחוק אותו בלי אימות שהריפו הנפרד והקישור הציבורי החלופי עובדים, ובלי אישור מפורש.

## ריפו יומן Google
אפליקציית יומן Google חייבת להישאר בריפו נפרד. הריפו הפעיל הידוע הוא:

```text
yanivmizrachiy/smartcalendar-titan
```

## כלל אמת
- אין דמו.
- אין נתונים מומצאים.
- אין הודעות הצלחה מזויפות.
- אין screenshots מומצאים או placeholders שמוצגים כאמת.
- אין ערבוב בין Guide, Teacher Hub, יומן Google ולוז בית ספר.
- כל יכולת חייבת להיות משויכת למוצר ול-runtime הנכונים.
- כל מחיקה חייבת להגיע אחרי זיהוי מדויק, גיבוי/היסטוריית Git ואימות שהחלופה עובדת באמת.

## Moodle Teacher Hub — כללים מחייבים
Moodle Teacher Hub הוא Action Hub למורה שנפתח מתוך מרחב לימוד אמיתי ב-Moodle. כל נתון חייב להיות שייך למרחב/מורה/קורס הנוכחיים בלבד.

Teacher Release נשאר **NO** עד שמסמך האמת והשערים המתאימים מאשרים אחרת.

### תצוגת תאריכים
כל תאריך שמורה רואה ב-UI מוצג בפורמט `D/M/YY`, למשל `5/3/26`.

- אין חובה לאפס מוביל.
- השנה בשתי ספרות.
- הפורמט חל על presentation/UI בלבד.
- אין לשנות DB, API, timestamps, STATE או logs רק בגלל פורמט התצוגה.
- יש להעדיף helper מרכזי ולא פורמטים מפוזרים.

### עמוד הכניסה
עמוד הכניסה חייב להציג, ממקור אמת בלבד:
- שם מרחב הלימוד / הקורס.
- שם המורה.
- מספר תלמידים.
- כפתורי פעולה ראשיים בעברית.
- מה חסר במערכת.

אם נתון חסר — מציגים מצב חסר ברור ולא ממציאים.

### פרטיות
ברשימת תלמידים פשוטה מציגים רק שם פרטי + שם משפחה / שם תצוגה.

אסור לחשוף ברשימה פשוטה או endpoint ציבורי שלא דורש זאת:
- תעודת זהות.
- מייל.
- username.
- external id.
- מזהים פנימיים מיותרים.
- סיסמאות, tokens, cookies או raw headers.
- raw student rows / raw Moodle responses.

### ניווט
במסכי Teacher Hub יהיו כפתורי ניווט עבריים וברורים בהתאם למפת המסכים הקנונית ב-`PROJECT_RULES.md`.

## Guide — כללים מחייבים
כללי Guide המלאים נמצאים ב-`PROJECT_MEMORY.md`. ברמת הגבול:

- צילומי Moodle אמיתיים בלבד.
- אין Demo / Placeholder / fake capture.
- שקף שחסר לו צילום אמיתי נשאר מוסתר לפי publication gate.
- runtime של Guide הוא GitHub Pages בלבד.
- Render workflows אינם רשאים לפרסם או לאמת Guide.
