# Automation Control Center V1 — STATUS

## מה בוצע

- מרכז אוטומציה חדש נוסף ל-UI.
- דף `/automation` מציג סטטוס LTI, מזהה קורס, שם מורה, שם קורס, ייבוא קיים ורמות אוטומציה.
- שני API חדשים נבנו: `/api/automation/capabilities` ו`/api/automation/export-links`.
- מערכת אינה משתמשת בסיסמה או בטוקן Moodle כדי להחזיר סטטוס.
- סנכרון API מלא עדיין לא הופעל, והעניין מוצג במפורש.

## סטטוס נוכחי

- LTI context: תלוי בפתיחת הכלי בתוך Moodle
- יכולות דוחות ידניים אמיתיים: מבוסס על ייבוא קיים
- קישורי דוחות: זמינים כאשר Course ID זוהה
- Moodle Web Services: לא אומת בלי `MOODLE_WS_TOKEN` אמיתי
- Auto sync: לא מאומת
- Teacher Release: NO
