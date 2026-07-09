# מצב השחרור — ענף `rebuild/lti13-secure-teacher-hub`

עודכן: 2026-07-09. הענף הזה הוא **הבסיס הנכון** לכלי המורה, במקום `gemini/recovery-sync-20260503-073319` הפרוס.

## למה נבנה מחדש
הענף הפרוס (`gemini/recovery-sync`) הוא שחזור-AI שסטה מהמציאות: ה-SPA שלו שואל טבלאות `imported_*` ופונקציות `lti_*` ש**אינן קיימות** במסד הנתונים החי (`ncoqanascubqkxfvucfz`). לכן כלי הנתונים הפרוס **לא יכול להביא נתונים אמיתיים**. המסד החי בנוי עם סכימה אחרת לגמרי (`students`, `courses`, `teachers`, `grade_items`, `grade_results`, `log_events`, `course_sections`, `course_tasks`, `task_completions`, `mth_*`) עם בידוד מבוסס `service_role` בצד-שרת.

בסיס הענף: `origin/codex/deep-truth-sync` — היחיד שתואם למסד האמיתי, עם LTI 1.1+1.3 אמיתי (אימות RS256 מול JWKS), משיכת NRPS, וארכיטקטורת שרת מאובטחת (המפתח הסודי לעולם לא בדפדפן).

## מה בוצע בענף הזה (הכל typecheck+build נקי, לא פרוס)
1. **הועברו מ-gemini:** מצגת `/guide` (31 צילומים אמיתיים מאושרים) + `/admin-hub` (מוגן Supabase Auth) — הפרדת מוצרים נשמרה.
2. **3 באגי אמינות-נתונים בשרת תוקנו:**
   - `/api/imports/overview` הפנה למשתנה `supabase` לא-מוגדר → כל בקשה נכשלה בשקט ונפלה לזיכרון נדיף → ספירות הדשבורד אף פעם לא אמיתיות. תוקן.
   - `/api/imports/student-profile` + `grades-matrix` קראו רק מזיכרון נדיף (מתאפס בכל restart) → ציונים "נעלמים". הועברו לקריאה מ-Supabase.
   - אי-התאמת זיהוי תלמיד בין ייבוא משתתפים לייבוא ציונים → ציונים לא מתחברים לתלמיד. יושר.
3. **חשיפת מידע חוצה-בתי-ספר הוסרה:** `LaunchDiagnostics` שאב את `launch_attempts` של כולם בדף `/lti` ציבורי. נמחק.
4. **5 endpoints חדשים בשרת** (`course-structure`, `activity-overview`, `daily-activity`, `student-reports`, `task-completion`) — 8 מסכים שהיו ריקים לצמיתות (פרקים, משימות, פעילות, דוחות) עכשיו מחוברים לנתונים אמיתיים. כל קריאות ה-RPC המתות (`lti_get_*`) הוסרו.
5. **ניקוי:** 14 קבצי קוד מת (5 עמודים יתומים, 8 רכיבים לא-בשימוש, רכיב הדליפה).
6. **עברית מלאה:** SettingsPage, Automation, MissingData, Setup, LtiBootstrap, והסרת ז'רגון "Teacher Release" מכל התצוגות למורה.

## מה עדיין נדרש (רק יניב יכול) לפני שחרור לאלפי מורים
1. **צילום מבנה המסד החי** (שאילתות ה-cowork READ-ONLY) — לאמת שכל עמודה תואמת ל-100%.
2. **הרצת תיקון RLS דחוף:** `supabase/manual_sql/20260709_URGENT_lock_teacher_sessions_select.sql` — `teacher_sessions` כרגע קריא לכולם עם המפתח הציבורי (חשיפת session tokens).
3. **אימות משתני LTI 1.3 ב-Render** — ראה `docs/deployment/REBUILD_RENDER_ENV_CHECKLIST.md`. קיימים ברירות-מחדל קשיחות המצביעות על רישום אמיתי מול Moodle משרד החינוך; צריך לוודא ש-`SUPABASE_SERVICE_ROLE_KEY` ו-`LTI13_PRIVATE_KEY_PEM` מוגדרים.
4. **בדיקה חיה אחת מ-Moodle אמיתי** לפני deploy.
5. **החלטת deploy:** להצביע את Render לענף הזה (או למזג) רק אחרי 1-4.

## מה לא נבדק
שום endpoint לא נבדק מול נתונים אמיתיים (אין Supabase מקומי). נבדק: typecheck, build, ו-smoke test מקומי שכל endpoint רשום ומחזיר 401 בלי סשן (לא 404/500), בלי שגיאות בלוג.
