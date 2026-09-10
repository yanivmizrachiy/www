# HISTORICAL SNAPSHOT — Automation Control Center V1 STATUS

> מסמך זה מתעד את מצב Automation Control Center V1 בזמן שנכתב. הוא נשמר כראיה היסטורית ואינו מקור אמת נוכחי.  
> למצב Teacher Hub הנוכחי: `PROJECT_MEMORY.md` → `PROJECT_RULES.md` → `STATE/CURRENT.md` + evidence עדכני.

## מה בוצע באותו snapshot

- מרכז אוטומציה חדש נוסף ל-UI.
- דף `/automation` מציג סטטוס LTI, מזהה קורס, שם מורה, שם קורס, ייבוא קיים ורמות אוטומציה.
- שני API חדשים נבנו: `/api/automation/capabilities` ו`/api/automation/export-links`.
- מערכת אינה משתמשת בסיסמה או בטוקן Moodle כדי להחזיר סטטוס.
- סנכרון API מלא עדיין לא הופעל באותו snapshot, והעניין הוצג במפורש.

## סטטוס שנרשם באותו snapshot

- LTI context: תלוי בפתיחת הכלי בתוך Moodle
- יכולות דוחות ידניים אמיתיים: מבוסס על ייבוא קיים
- קישורי יעד לדוחות: זמינים כאשר Course ID זוהה; אינם הוכחת סנכרון API מלא
- Moodle Web Services: לא אומת בלי `MOODLE_WS_TOKEN` אמיתי
- Auto sync: לא מאומת
- Teacher Release: NO

אין למחזר את הרשימה הזו כ-PASS או blocker ל-HEAD חדש בלי evidence עדכני.
