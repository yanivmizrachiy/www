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

## חקירת עומק — איך Web Services משתלב במוצר הקיים

### מסקנה מרכזית

אין לבנות אפליקציה חדשה ואין להחליף את מסכי Teacher Hub. המוצר הקיים כבר בנוי סביב אותם תחומי מידע שה־API יכול לספק: תלמידים, משימות/פרקים, ציונים, השלמות, פעילות, דוחות וייצוא. החיבור החדש צריך להיות שכבת מקור נתונים אוטומטית מאחורי המסכים הקיימים.

### מה כבר עובד ואסור לקלקל

- LTI משמש לזיהוי מורה/קורס/הקשר.
- NRPS כבר יכול לספק roster של תלמידים/מורים כאשר Moodle שולח את השירות והפרטיות מאפשרת את השדות.
- Participants/Gradebook/Logs/Completion real-data import קיים, כולל Smart Import, וצריך להישאר fallback גם אחרי API.
- Supabase persistence והדוחות הקיימים הם שכבת היעד של הנתונים; אין ליצור מודל נתונים מקביל ללא צורך.
- ציונים חסרים אינם 0; אין לשנות כלל אמת זה.
- Logs הם אירועים ולא זמן תרגול רשמי; Web Services לא הופך timestamps אוטומטית ל-duration בלי מקור רשמי.

### השיפור הרצוי לפי תחום

1. תלמידים/מורים: NRPS קודם כאשר הוא זמין; Web Services יכול להיות fallback/אימות דרך `core_enrol_get_enrolled_users` ולא מקור כפול מתחרה.
2. פרקים ומשימות: `core_course_get_contents` צריך להזין את מבנה הקורס למסלול הקיים של `course_sections`/`course_tasks`.
3. השלמות: `core_completion_get_activities_completion_status` צריך להזין את מודל completion הקיים ולא ליצור מסך חדש.
4. ציונים: `gradereport_user_get_grade_items` / `core_grades_get_grades` צריכים להזין את `grade_items`/`grade_results` הקיימים; Gradebook import נשאר fallback.
5. פעילות: Web Services/log source מאומת יכול להזין `log_events`; אין להמציא זמן תרגול אם אין duration רשמי.
6. דוחות/ייצוא: אין צורך לבנות מחדש — ברגע שהנתונים מסתנכרנים אוטומטית, הדוחות הקיימים נהיים עדכניים בלי פעולת ייבוא של המורה.

### שיפור UX לאחר API

- ברירת המחדל תהיה `רענן נתונים מ-Moodle` / סנכרון אוטומטי מאומת.
- `Smart Import` נשאר רק כגיבוי כאשר API/הרשאה מסוימים אינם זמינים.
- `מה חסר` יציג חסר אמיתי לפי capability: API זמין / NRPS זמין / צריך ייבוא ידני.
- יש להציג `עודכן לאחרונה` ומקור לכל תחום: NRPS / Web Services / AGS / Import.

### חסמים ארכיטקטוניים שצריך לפתור לפני סנכרון מלא

- session LTI פעיל נשמר כיום גם ב-memory (`sessions`/`tokenSessions`), ולכן restart/cold-start של Render עלול לאבד session. לפני background sync יציב צריך session/context עמיד ומאומת ב־persistence או מנגנון חתום/עמיד אחר.
- `useMoodleData.ts` מפנה ל־Supabase function בשם `moodle-proxy`, אך function זה אינו קיים ב־`main` הנוכחי. אין להשתמש בו כראיה לחיבור חי; יש להסיר/להחליף/להשלים רק כחלק מארכיטקטורה קנונית אחת.
- `/api/sync/run` כיום הוא capability-detection-only ולא מסנכרן נתוני Moodle. לאחר API מאומת אפשר להפוך אותו בהדרגה ל־real sync, תחום אחד בכל פעם.
- RLS מופעל על טבלאות רגישות אך אין עדיין teacher-scoped policies מוכחות; current service-role access עוקף RLS. לפני הפצה לריבוי מורים צריך policies/בידוד חי או שכבת server-scoped חזקה ומאומתת.

### כלל אבטחה קריטי ל-Web Services

גם אם token של service user מקבל גישה רחבה, כל קריאת נתונים מהמוצר חייבת להיות קשורה ל־LTI context הנוכחי. אין לאפשר ללקוח לבחור `course_id` שרירותי. השרת צריך לקחת את הקורס מה-session המאומת, לבצע רק פונקציות read-only שאושרו, ולשמור provenance של source/context/import-or-sync batch.

### סדר ביצוע מומלץ לאחר קבלת token

1. `core_webservice_get_site_info` — אימות חיבור בלבד.
2. `core_enrol_get_enrolled_users` — השוואה ל־NRPS ובדיקת בידוד הקורס; אין עדיין overwrite עיוור.
3. `core_course_get_contents` — אוטומציה של פרקים/משימות.
4. `core_completion_get_activities_completion_status` — אוטומציה של השלמות.
5. פונקציות ציונים — סנכרון ל־grade tables תוך שמירה על null/missing.
6. מקור logs רשמי, רק אם Moodle מאפשר ומחזיר שדות מספקים.
7. רק לאחר כל תחום מאומת: real `/api/sync/run`, scheduled/background sync, ורק אז בחינת Teacher Release.

### יומן חקירת העומק

- תאריך: `2026-10-12`.
- התקדמות חקירת הריפו לצורך תכנון API: **90%**.
- הושלם: SSOT/Rules/State, routes/screens/hooks, Smart Import, LTI/NRPS, sync status, persistence, Supabase isolation, API map, current Web Services adapters, reports, grades, tasks, activity, ומסמכי automation.
- נשאר: live token/API evidence מול Moodle של משרד החינוך; בלי token אי אפשר לאמת payloads, scopes, שדות ו-rate/permission behavior בפועל.
- סטטוס: **החקירה התכנונית כמעט הושלמה; החיבור החי לא הסתיים**.


## תכנון מחייב — כתובת מרחב Moodle ← תצוגה גרפית חדשה (17.11.2026)
<!-- MTH_COURSE_URL_VISUAL_VIEW_20261117 -->

### דרישת בעלים והגדרת המוצר
מורה נכנס לאתר Moodle Teacher Hub, מדביק כתובת מרחב הלמידה שלו, לוחץ על ״הצג מרחב בעיצוב חדש״ ורואה את אותו מרחב — פרקים, חומרי לימוד, משימות, קבצים, קישורים ופעילויות — בממשק עברי RTL חדש, בלי לשנות את מרחב Moodle המקורי. יש להציג גם נתוני ניהול למורה רק כשההרשאות ומקורות הנתונים מאפשרים זאת. זה אינו מדריך שקפים או אתר דוחות מחוזי.

היישום ייעשה **בתוך המוצר הקנוני הקיים yanivmizrachiy/www** ובאותם רכיבי Dashboard, Chapters, ChapterDetail, Tasks, Smart Import, LTI וסכמות נתונים. לא מקימים ריפו נוסף, מצגת, מערכת אימות או מקור אמת חדש. סעיף זה הוא הדרישה הפעילה למסלול הקישור, גם אם אפיונים היסטוריים ב-docs מתארים כניסה באמצעות LTI בלבד.

### ממצאי בדיקת קוד — 17.11.2026
- קיים: דשבורד, פרקים/משימות, סיווג פעילות לפי סוג, דוחות וייבוא, זיהוי הקשר מורה/קורס באמצעות LTI, קישורי דוחות Moodle אמיתיים.
- ב־main עדיין חסרה יכולת URL→מרחב; ב־PR #319 בענף הנוכחי **מומש שלב P1 בלבד**: טופס כתובת, parser דטרמיניסטי, בדיקת התאמה לסשן LTI מאומת וכניסה למסך Chapters הקיים. טרם מוזג/נפרס; לא נוספה שאיבת תוכן Moodle חדשה. הצגת מבנה מלא ושירותי Web Services נשארת בשלבים P2–P5.
- Moodle Web Services read-only עשויים לאפשר שאיבה אוטומטית של תוכן הקורס באמצעות core_course_get_contents, אבל אין טוקן/אישור גישה חי מאומת לשירותי משרד החינוך. LTI context לבדו **אינו** הרשאת קריאה לכל תוכן הקורס; NRPS/AGS אינם מחליפים API של מבנה קורס.
- נתונים מיובאים וקוד קיים אינם הוכחה שכל התוכן נטען. Teacher Release = NO. אין כיום הוכחה ל-Paste URL → Complete Visual View.

### חוויית המורה — מסלול אחד פשוט, ללא הבטחות שווא
1. מסך כניסה נקי עם שדה ״הדבק כתובת של מרחב Moodle״ וכפתור ״הצג מרחב בעיצוב חדש״. כתובת לדוגמה לצורך תיעוד מבנה בלבד: https://moodlemoe.lms.education.gov.il/course/view.php?id=259 (אין להסיק מכך הרשאת גישה).
2. בדיקת כתובת: HTTPS, דומיין Moodle מאושר בתצורת שרת, נתיב /course/view.php ומזהה קורס חיובי. כתובת אינה הוכחת בעלות או הרשאה.
3. אם כבר קיים סשן Moodle/LTI מאומת עבור אותו אתר ואותו קורס, ממשיכים. אחרת מציגים הדרכה קצרה לפתיחת הכלי מתוך Moodle (ללא סיסמה נוספת באתר). לא מבצעים שאיבה עד שהשרת אימת הקשר מורה-קורס.
4. השרת קובע את ה-course_id וה-site מתוך סשן מאומת ומשווה לבקשה. כדי לעבור לקורס אחר נדרש הקשר מורשה חדש. אין אפשרות לבחור course_id שרירותי בלקוח.
5. כשהתוכן זמין ממקור רשמי מאומת, מציגים לפי סדרו: שם המרחב, יחידות ופרקים, משימות ופעילויות, שמות קבצים וחומרי לימוד, קישורים אמיתיים ותקצירים רק אם הגיעו מהמקור. שומרים קישור חזרה לפעילות המקורית; פעילות אינטראקטיבית שלא ניתן להריץ בבטחה מחוץ ל-Moodle נפתחת שם.
6. תלמידים, ציונים, השלמות ונתוני פעילות מופיעים רק במסכי מורה מוגנים וכשקיים מקור מורשה. בהיעדר מידע: ״לא התקבל מידע מאומת״, לעולם לא 0 מומצא, משימות מזויפות, זמן תרגול מחושב ללא duration רשמי או כפתור לא עובד.
7. עיצוב: RTL מלא, כרטיסי פרקים מתקפלים, ניווט מהיר, מסך נייד ללא גלילה אופקית, מקלדת ונגישות, תאריך עדכון ומקור נתונים. התצוגה בלבד משתנה; הנתונים וההרשאות לא.

### גבולות אבטחה והנדסה
- URL הוא locator בלבד, לא token ולא מקור שאיבה. **אין fetch שרירותי אל URL המורה**, אין HTML scraping של עמודי Moodle מחוברים, אין עקיפת CORS/CSP ואין שימוש/שמירה בסיסמת מורה.
- השרת מקבל רק מזהה אתר מאושר ו-course id שנבדק והותאם לסשן. כל בקשת Web Services נבנית בצד שרת מול endpoint קבוע ומאושר בלבד. מסירים/דוחים userinfo, כתובות IP, localhost, פורטים לא מאושרים, redirect, fragment ופרמטרים חשודים. חוסמים SSRF, DNS rebinding, XSS, HTML וקישורי תוכן לא בטוחים.
- Web Services מחייבים מנהל Moodle, הרשאות read-only מתאימות, token שרת בסביבה ולא ב-GitHub, אימות live וחוזה נתונים. אין להניח שכל מורה זכאי לקבל token.
- אין להעתיק קבצי Moodle מוגנים לאחסון פומבי; כל קישור מחייב הרשאות Moodle. אין דליפת מידע בין משתמשים/קורסים. כל נתון נושא provenance, site, מזהה Moodle, timestamps וסטטוס חסר/מעודכן.
- הייבוא הידני המאומת נשמר כגיבוי, אך **לא מוצג כתנאי ידני קבוע** כאשר חיבור API מאומת מאפשר שאיבה. אין לשנות נתוני Moodle או ציונים בשלב זה.
- אין לערוך LTI, DB migrations, secrets, Render/deploy, Teacher Release או מסלול סנכרון קיים בשלב התכנון. מיזוג ופריסה רק לאחר אישור הבעלים והוכחות.

### מפת ביצוע ומבחני קבלה
| שלב | פעולה ממוקדת | תנאי סיום שניתן לבדוק |
|---|---|---|
| P0 — מיפוי | מפה מקורות→שדות→רכיבים, סמנטיקת site/course/session, API והרשאות; תחקור כפילויות | רשימת רכיבים קיימים, חסמים ומבחני מקור; אין תכנון ריפו מקביל |
| P1 — URL ו-session | טופס קישור בתוך Teacher Hub, parser בטוח, השוואת course/site לסשן LTI מורשה, מסך blocked נגיש | כתובות זדוניות נדחות; קורס אחר לא נפתח; אין הצגת חיבור פיקטיבי |
| P2 — נתוני מבנה אמיתיים | לאחר API מאומת, להזין core_course_get_contents למודל המבנה הקיים; לשמור fallback של ייבוא אמיתי, בלי מנוע נתונים נוסף | השוואת סדר פרקים, שמות וסוגי פעילויות בין Moodle לממשק; provenance לכל פריט |
| P3 — תצוגת המרחב | תצוגת תוכן מבוססת Chapters/Tasks/ChapterDetail הקיימים, פרקים מתקפלים ומשאבים; מסכי ניהול מופרדים | ניווט ותוכן מאומת, נייד ומחשב RTL, אין גלילה אופקית ואין רכיב מזויף |
| P4 — בידוד ואבטחה | בדיקות שתי זהויות × שני קורסים, שלילת גישה ל-course אחר, SSRF/XSS, session שפג, קורס חסום, משאב מוגן | כל הבדיקות עוברות על מידע אמיתי בלי חשיפת PII |
| P5 — שחרור | PR, סקירה, CI, בדיקת דפדפן והוכחת מקור מול מסך; מיזוג/Production רק באישור מפורש | קישור ייצור פעיל וגרסה מאומתים; Teacher Release נשאר NO עד שאר שעריו |

### Definition of Done
- מורה מורשה יכול להדביק כתובת מרחב, להתחבר דרך Moodle אם נדרש, ולראות בתצוגה החדשה **את מלוא הפרקים והפעילויות שבמקור המורשה באמת מחזיר**; תוכן שלא נגיש דרך הרשאות/API מוצג כחסר ולא מומצא.
- פרקים, סדרם, כותרות, סוגי פעילויות וקישורי משאבים מושווים אחד-לאחד למרחב המקורי.
- המשתמש אינו יכול לקרוא קורס אחר רק על ידי שינוי מזהה בכתובת. הבידוד נבדק בשתי זהויות ושני קורסים.
- בדיקות unit, integration, E2E, RTL/נייד, אבטחה ופריסת Production מאומתת לאחר אישור.
- **מצב אמת ב־17.11.2026:** P1 נכתב ב־PR #319 עם קישור מהבית למסך URL, בדיקת domain/course/session, ניווט לתצוגת Chapters הקיימת ובדיקות URL עוינות; ריצת CI האחרונה על הקומיט `3916b262` עברה `check-build-doctor` ו־`safety`. **טרם מוזג או נפרס**, אין עדיין קליטת תוכן מלאה מה־API, ואין אישור לשחרור מורים. בדיקת דפדפן חיה ואימות מול Moodle אמיתי נותרו פתוחים.

מקורות טכניים: https://docs.moodle.org/dev/Web_service_API_functions ; https://docs.moodle.org/405/en/External_tool ; https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html .
<!-- END MTH_COURSE_URL_VISUAL_VIEW_20261117 -->
