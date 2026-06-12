# גבול ריפו ו־luz-teddy

עודכן: 2026-06-12
Teacher Release: **NO**

הריפו `yanivmizrachiy/www` הוא ריפו Moodle Teacher Hub.

## מה שייך לריפו

- LTI / Moodle / Render / Supabase עבור Moodle Teacher Hub.
- UI עברי RTL למורה.
- ייבוא דוחות Moodle אמיתיים.
- docs, STATE, CI ואימותים של Moodle Teacher Hub.

## מה לא שייך לריפו

- Google Calendar.
- SmartCalendar.
- Apps Script של Calendar/Drive שאינו חלק מאומת מהמוצר.
- דשבורד כללי של כל הריפואים.
- מערכות שאינן Moodle Teacher Hub.

## luz-teddy

`luz-teddy/` קיים כרגע בריפו כחריג זמני של לוז בית ספר / מבחנים / אירועים.

אמת מחייבת:

- לא למחוק את `luz-teddy/` בלי אישור מפורש.
- לא להרחיב אותו כחלק מ־Moodle Teacher Hub.
- כשל ב־CI של `luz-teddy` לא אומר שמוצר Moodle Teacher Hub נשבר.
- מעבר עתידי לריפו נפרד דורש העברה מאומתת, בדיקת קישור ציבורי וגיבוי.

## CI boundary

- workflows בשם `luz-teddy-*` שייכים לחריג הזה בלבד.
- gates של Moodle Teacher Hub הם `ci.yml`, `moodle-automation-safety.yml`, והפקודות המקומיות/סטטיות המתועדות ב־`docs/CI_TRUTH_MAP.md`.
