# התקדמות — 2026-05-19

## Automation Control Center V1

הוספנו מרכז בקרה חדש עבור אוטומציה מתוך Moodle.

- דף חדש: `/automation`
- סטטוס חיבור LTI וסטטוס קורס מוצגים
- זיהוי ייבוא קיים ל־Participants, Gradebook, Logs ו־Course Structure / Activity Completion
- קישורי יעד לדוחות Moodle נבנים לפי Course ID כשזמין; הם אינם הוכחת סנכרון API מלא
- מערכת ממשיכה להדגיש כי סנכרון API מלא עדיין לא הופעל

## סטטוס

- full automation for every teacher: planning target only — requires audit/live validation
- teacher convenience: planning target only — requires real workflow validation
- national readiness: blocked until multi-teacher/course validation
- Teacher Release: NO

## מה בוצע

- הושלם דף Automation Control Center V1.
- נוסף API חדש: `/api/automation/capabilities` ו־`/api/automation/export-links`.
- נוסף קישור צדדי חדש ל"אוטומציה ממודל".
- כל השינויים נשמרים במצב בטוח: ללא סודות, ללא שורות תלמידים, ללא דמו.
