# מפת API קנונית — Moodle Teacher Hub

עודכן: 2026-06-12
Teacher Release: **NO**

מסמך זה ממפה endpoints קיימים לפי אמת בקוד. הוא לא מוכיח שהם עברו live validation, אלא מציין מה קיים, מה מטרתו, ומה גבול האמת.

## Runtime ובריאות

| Endpoint | תפקיד | אמת/גבול |
|---|---|---|
| `GET /health` | בדיקת runtime בסיסית | לא מוכיח LTI או נתוני Moodle |
| `GET /ping` | בדיקת זמינות קצרה | טכני בלבד |

## LTI ו־session

| Endpoint | תפקיד | אמת/גבול |
|---|---|---|
| `POST /api/lti/launch` | LTI 1.0/1.1 קנוני, OAuth1 HMAC-SHA1 | לא לשנות בלי הוראה מפורשת |
| `GET /api/lti/launch` | הודעת שגיאה בטוחה כשנפתח בדפדפן | לא login |
| `GET /api/bootstrap` | מחזיר session/context לפי token/cookie | ללא raw launch |
| `GET /api/session/status` | סטטוס session בטוח | aggregate בלבד |
| `GET /api/lti/diagnostics` | diagnostics בטוחים | ללא סודות/שורות תלמידים |

## LTI 1.3 / Advantage

| Endpoint | תפקיד | אמת/גבול |
|---|---|---|
| `/api/lti13/status`, `/api/lti13/config`, `/api/lti13/jwks` | diagnostics/config/JWKS | לא מוכיח launch מלא |
| `/api/lti13/login`, `/api/lti13/launch` | OIDC/JWT flow | קיים בקוד; release עדיין חסום |
| `/api/lti13/nrps-preview` | preview בטוח ל־NRPS | אין raw PII |
| `/api/lti13/participants-breakdown` | ספירת תפקידים/משתתפים | aggregate בלבד |
| `/api/lti13/services-status` | האם launch נשא NRPS/AGS claims | לא מוכיח sync מלא |
| `/api/lti13/token-matrix` | בדיקת token/session matrix | diagnostics בלבד |

## ייבוא ונתונים

| Endpoint | תפקיד | אמת/גבול |
|---|---|---|
| `POST /api/import` | Participants, Gradebook, Logs, Completion לפי `report_type` | לא מחזיר raw rows; לא משנה Teacher Release |
| `POST /api/import/course-structure` | Activity Completion / Course Structure | קיים, אך Course Structure proven דורש evidence חי |
| `GET /api/imports/students` | רשימת תלמידים מיובאת scoped ל־space | רשימה פשוטה לא אמורה לחשוף מזהים רגישים |
| `GET /api/imports/overview` | counts לפי session | aggregate בלבד |
| `GET /api/imports/grades-matrix` | מטריצת ציונים מהייבוא | ציון חסר אינו 0 |
| `GET /api/imports/student-profile` | פרופיל תלמיד יחיד | נדרש scope לפי session |
| `GET /api/imports/time-range` | חלונות פעילות לפי logs | הערכה בלבד ללא duration רשמי |
| `POST /api/imports/nrps-sync` | server-owned NRPS roster sync/fallback | לא authoritative אם server לא הצליח להביא NRPS |

## API חדש יותר למסכים

| Endpoint | מקור מועדף | fallback | הערת אמת |
|---|---|---|---|
| `GET /api/students` | `students` לפי `space_id` | `store.students` | דורש session scope |
| `GET /api/tasks` | `course_tasks` לפי `course_id` | `store.tasks` | schema מול server צריך אימות |
| `GET /api/grades` | `grade_results` לפי `course_id` | `store.grades` | grade missing נשאר null/חסר |
| `GET /api/activity` | `log_events` לפי `course_id` | `store.activitySessions` | פעילות היא אירועים, לא זמן רשמי |

## אוטומציה ויכולות

| Endpoint | תפקיד | אמת/גבול |
|---|---|---|
| `/api/sync/status`, `/api/sync/run` | זיהוי capabilities וחוסרים | לא יוצר נתונים |
| `/api/capabilities/status` | סיכום LTI/WS/import capabilities | לא live proof לכל capability |
| `/api/automation/capabilities` | מרכז אוטומציה | Teacher Release false |
| `/api/automation/export-links` | קישורי דוחות Moodle לפי course id | קישורים בלבד; לא scraping |
| `/api/automation/lti-capability-probes` | probes בטוחים ל־LTI context/services | raw launch מוסתר |
| `/api/automation/auto-extraction/sources` | source router בטוח | אין secrets/raw rows |
| `/api/automation/moodle-webservices/readiness` | probe בטוח ל־`core_webservice_get_site_info` | חסום עד token אמיתי בסביבה |

## Persistence / Release

| Endpoint | תפקיד | גבול |
|---|---|---|
| `/api/persistence/status` | מצב persistence | לא מוכיח בידוד |
| `/api/persistence/validate` | בדיקת טבלאות/counts | aggregate בלבד |
| `/api/import/schema-diagnostics` | התאמת schema בטוחה | לא migration |
| `/api/practice-time/status` | שער duration רשמי | practice time רשמי חסום בלי duration |
| `/api/release/readiness` | שער Teacher Release | תמיד false עד מעבר כל השערים |
