# Moodle Repository Unification — 2026-09-28

## החלטה
`yanivmizrachiy/www` הוא מקור האמת היחיד והפעיל של Moodle Teacher Hub.

`yanivmizrachiy/moodle-teacher-hub` נשמר כהיסטוריה בלבד ואינו runtime, source tree או יעד פיתוח.

## נקודות שחזור
- www לפני ניקוי: `backup/pre-moodle-unification-2026-09-28`
- legacy לפני צמצום: `yanivmizrachiy/moodle-teacher-hub:backup/pre-unification-2026-09-28`
- legacy commit לפני האיחוד: `d56f583a99cba802b65f6b937d1714808bab1daa`
- www commit לפני האיחוד: `c23174a80bacd250797ee7ce6c1402345110c0d3`

## מיפוי הקוד הישן
| legacy | מצב ב-www |
|---|---|
| `src/server.js` | הוחלף ב-`www/src/server.js` המתקדם, עם LTI canonical, sessions, imports ויכולות נוספות |
| `src/views/dashboard.html` | הוחלף ב-React UI תחת `src/pages/` ו-`src/components/` |
| `src/views/landing.html` | הוחלף בזרימת LTI/React הקנונית |
| `/api/bootstrap` | קיים ב-`www/src/server.js`, עם session מאומת |
| students/tasks/grades/activity APIs | קיימים ומורחבים ב-`www` |
| Moodle captures/summary | קיימים ב-`www` |
| CSV export | קיים ב-`www` |
| manual real-data import concept | קיים ומורחב ב-`www` עם Gradebook/Logs/import flows |
| dev/demo identities | לא מועברים; מנוגדים לכללי המוצר הפעילים |

לא נמצאה יכולת production ייחודית בריפו הישן שחסרה ב-`www`. לכן לא בוצע copy-back של קוד ישן.

## מה הוסר כדי למנוע שני מקורות אמת
מה-main של `moodle-teacher-hub` הוסרו runtime/package/workflow וקוד UI ישן. הם לא אבדו — נשמרו בענף הגיבוי ובהיסטוריית Git.

ב-`www`:
- `public/PROJECT_MEMORY.md` הוסר כי היה mirror זהה ומיושן של מסמך פנימי.
- `PROJECT_MEMORY.md` הפך למצביע היסטורי בלבד.
- `docs/operations/work-plan.md` יושר למבנה הקנוני.
- workflow אוטונומי כללי שאינו Moodle הוסר כדי לא לאפשר שינויי source לא מבוקרים.

## חריגי תאימות שלא נמחקו
לא נמחקו אוטומטית:
- `luz-teddy/` ו-`downloads/hazaa-luz-teddy/` — קיימים URL-ים ציבוריים ישנים שנשלחו למורים.
- `yanivcar/update.json` — עשוי להיות endpoint שנצרך מחוץ לריפו.

אלה אינם חלק מ-Moodle. הם נשארים זמנית רק כדי לא לשבור משתמשים, עד אימות מעבר בטוח.

## כלל סופי
פיתוח Teacher Hub חדש מתבצע רק ב-`yanivmizrachiy/www`. אין לפתוח ריפו Moodle Teacher Hub פעיל נוסף.
