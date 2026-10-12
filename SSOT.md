# SSOT — Moodle Teacher Hub

זהו **מקור האמת היחיד והמחייב של Moodle Teacher Hub**.

## תחום הריפו

`yanivmizrachiy/www` עוסק במערכת Moodle Teacher Hub בלבד: כלי המורה, LTI, נתוני Moodle אמיתיים, Render, Supabase, import, תלמידים, ציונים, לוגים ודוחות.

## גבול מוחלט: מצגת Moodle

המצגת/Guide למורים **אינה נערכת, מפותחת, נבדקת או מפורסמת מתוך הריפו הזה יותר**.

מקור האמת היחיד והבלעדי של המצגת הוא:

`yanivmizrachiy/moodle-guide-presentation`

כל שינוי עתידי במצגת — תוכן, סדר שקפים, screenshots, hotspots, עיצוב, קוד, בדיקות, CI ופרסום — מתבצע רק בריפו הזה.

נכון ל־2026-09-28 אין ב־`main` של `www` runtime, deck, assets או workflows פעילים של המצגת. הנתיב ההיסטורי `/www/guide/` נשמר רק כ־redirect תאימות למצגת הקנונית ואינו מקור אמת, יעד עריכה או runtime חלופי.

אין ליצור או לתחזק בתוך `www`:
- deck נוסף למצגת.
- עותק פעיל של תוכן המצגת.
- screenshots חדשים של המצגת.
- workflow קנוני של המצגת.
- runtime פעיל נוסף של המצגת.

## סדר קדימות

1. `SSOT.md` — גבול המוצר המחייב והעדכני ביותר.
2. `PROJECT_RULES.md` — כללי Teacher Hub.
3. `RULES.md` — כללי ריפו/פרטיות.
4. `PROJECT_MEMORY.md`, `STATE/**`, `docs/**` — ידע, ראיות והיסטוריה; אם הם מציגים את ה-Guide כמוצר פעיל בריפו הזה, החלק הזה מיושן וגובר עליו `SSOT.md`.

## Runtime קנוני

Teacher Hub: `https://www-tijc.onrender.com`

## כלל מוחלט

יש רק ריפו פעיל אחד למצגת Moodle: `yanivmizrachiy/moodle-guide-presentation`.

אין ליצור או לתחזק מקור שני למצגת בתוך `www`.


## איחוד הריפואים — 2026-09-28

- `yanivmizrachiy/www` הוא **מקור האמת היחיד והפעיל** של Moodle Teacher Hub.
- snapshot מלא של `www` לפני הניקוי נשמר ב-`backup/pre-moodle-unification-2026-09-28`.
- מסמך המיפוי: `docs/operations/MOODLE_REPOSITORY_UNIFICATION.md`.


## מצב סופי של ריפואי Moodle

- Teacher Hub פעיל וקנוני: `yanivmizrachiy/www`
- מצגת/Guide נפרדת: `yanivmizrachiy/moodle-guide-presentation`
- אין מוצר פעיל נוסף של Teacher Hub.
- `www` מכיל Moodle Teacher Hub בלבד; קוד ומסמכים של מוצרים אחרים אינם נשמרים כאן.

## Moodle Web Services API — הפעלה אמיתית

### דרישת המשתמש — 2026-10-12

יש לקדם חיבור רשמי ואמיתי ל־Moodle Web Services רק אם הוא מועיל בפועל, ללא דמו וללא טענה שחיבור חי עובד לפני אימות אמיתי.

המטרה: להפחית ככל האפשר הורדות ידניות של דוחות ולאפשר משיכה רשמית של נתוני קורס, תלמידים, השלמות, ציונים ופעילות, בכפוף להרשאות Moodle ובגבולות הפרטיות המאושרים.

### מה כבר קיים ומאומת בריפו

- קיים endpoint קריאה בטוח: `GET /api/automation/moodle-webservices/readiness`.
- קיימת בדיקת חיים רשמית דרך `core_webservice_get_site_info` כאשר `MOODLE_WS_TOKEN` קיים.
- הטוקן נקרא רק מ־environment ואסור לשמור אותו ב־GitHub.
- קיימת בדיקת audit ייעודית: `npm run audit:moodle-webservices-readiness`.
- קיימת רשימת בדיקה למנהל Moodle: `docs/moodle/MOODLE_AUTOMATION_ADMIN_ENABLEMENT_CHECKLIST_HE.md`.
- פונקציות הקריאה הרצויות בהמשך מתועדות: קורס, נרשמים, השלמות, ציונים ולוגים.

### החסם האמיתי

נכון למידע המאומת בריפו, אין `MOODLE_WS_TOKEN` חי ומאומת ואין הוכחת קריאה חיה ל־Moodle Web Services. לכן אסור לסמן את החיבור כפעיל.

כדי להשלים נדרש מנהל Moodle ש:
1. יפעיל Web Services.
2. יפעיל REST protocol.
3. יאשר External Service / service user בהרשאות קריאה מינימליות.
4. ינפיק token עם לפחות `core_webservice_get_site_info`.
5. ישים את הטוקן ב־Render כ־`MOODLE_WS_TOKEN` ולא ב־GitHub.
6. לאחר מכן יש להריץ את readiness probe ולתעד הצלחה אמיתית לפני הרחבת פונקציות.

### פונקציות קריאה רצויות לאחר אימות בסיסי

- `core_course_get_contents`
- `core_enrol_get_enrolled_users`
- `core_completion_get_activities_completion_status`
- `gradereport_user_get_grade_items`
- `core_grades_get_grades`
- `report_log_get_events`

אין לבקש הרשאות כתיבה בשלב זה.

### בדיקה חיצונית מול מקורות רשמיים — 2026-10-12

- Moodle עצמו תומך רשמית ב־Web Services וב־tokens למערכות חיצוניות.
- משרד החינוך מפרסם רשמית שסביבת בתי הספר היא Moodle פעיל ומאובטח, וערוץ התמיכה הטכנית הרשמי הוא `*6552`.
- לא נמצא בפרסום הציבורי הרשמי של משרד החינוך תהליך שמבטיח שמורה רגיל יכול לקבל `Moodle Web Services token` עבור `moodlemoe.lms.education.gov.il`.
- לכן אין להסיק שקבלת token מאושרת למורה רק משום שמנוע Moodle תומך ב־Web Services. יש לקבל אישור מפורש ממנהל המערכת/תמיכת המשרד.

### יומן התקדמות

- תאריך ושעה: `2026-10-12 14:18 +03:00` (Asia/Jerusalem)
- התקדמות כוללת להפעלת Moodle Web Services: **75%**
- הושלם: תשתית readiness, בדיקת site-info, כללי בטיחות, audit, תיעוד env, רשימת דרישות מנהל ופונקציות היעד, ואימות שהמנגנון קיים רשמית ב־Moodle.
- נשאר: אישור שמשרד החינוך מאפשר token חיצוני לחשבון/שירות הרלוונטי, הרשאת מנהל Moodle, token אמיתי, הגדרת Render, קריאה חיה מוצלחת ותיעוד ראיה; לאחר מכן בדיקות הדרגתיות לפונקציות הנתונים.
- סטטוס: **לא הסתיים**.
- כלל שחרור: Teacher Release נשאר **NO** עד אימות end-to-end אמיתי ומאובטח.
