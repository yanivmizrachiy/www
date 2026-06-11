# אמת מודל נתונים — Moodle Teacher Hub

עודכן: 2026-06-12
Teacher Release: **NO**

## ראיות aggregate מאומתות

```text
students = 62
grade_items = 243
grade_results = 1693
log_events = 89995
```

אין במסמך זה שורות תלמידים, ציונים גולמיים, לוגים גולמיים או identifiers פרטיים.

## שתי שכבות schema קיימות

`src/server.js` משתמש בפועל בטבלאות החדשות:

- `students`
- `import_batches`
- `grade_items`
- `grade_results`
- `log_events`
- `teachers`
- `courses`
- `teacher_sessions`
- `lti_launches`
- `course_tasks` בחלק מקריאות task API

`src/integrations/supabase/types.ts` עדיין מתאר גם מודל `imported_*` ישן:

- `imported_students`
- `imported_grade_items`
- `imported_grades`
- `imported_log_events`
- `imported_chapters`
- `imported_tasks`
- `imported_task_completion`

משמעות: לפני כל הרחבת data layer צריך להכריע אם endpoint עובד מול המודל החדש או מול legacy/RPC, ולא לערבב בלי תיעוד.

## Course identity

השם `course_id` אינו אחיד בקוד הקיים. חובה להשתמש במונחים הבאים בתיעוד ובקוד חדש:

- `moodle_course_id` — מזהה הקורס שמודל מוסר ב־LTI/report URL.
- `course_db_id` או `course_uuid` — UUID פנימי יציב בטבלת `courses`.
- `space_id` — מזהה context/space לשיוך תלמידים ורשימות.
- `resource_link_id` — מזהה קישור LTI, לא בהכרח course.

אסור להניח ש־`course_id` הוא תמיד אותו דבר בלי בדיקת מקור.

## Student identity

מקורות הזהות אינם אחידים:

- Participants יכול להביא שם, מייל, username, id number, external id.
- Gradebook יכול להביא שם/מזהה/עמודות רחבות ולא תמיד אותו מזהה.
- Activity Completion יכול להביא סטטוס לפי שם/עמודה.
- Logs מביאים actor/user/time/event, לא תמיד student id יציב.
- NRPS יכול להביא roles ו־identifiers בלי שמות/מיילים.

כל התאמת תלמידים חייבת לציין:

- מקור הנתון.
- שדה/שדות matching.
- מה קורה כשאין התאמה.
- האם נשמר רק aggregate או גם row.

## ציונים

- ציון חסר הוא `null`/חסר, לא `0`.
- ממוצע מחושב רק מציונים קיימים שאינם missing.
- Gradebook verified aggregate: `grade_items=243`, `grade_results=1693`.

## Logs ו־Practice Time

- Logs הם ראיות פעילות: אירועים, timestamps, רכיבים והקשרים.
- Logs אינם משך זמן רשמי.
- בלי duration רשמי ממודל, מותר להציג רק “הערכת חלונות פעילות” מסומנת בבירור.
- אין להציג “זמן תרגול אמיתי” או “משך רשמי” בלי שדה duration מאומת.

## RLS ובידוד

יש ראיית Dashboard/`pg_policies` שמדיניות RLS הוגדרה בחלק מהטבלאות, אבל אין live evidence שמוכיח enforcement חוצה־מורים.

לכן הסטטוס הנכון:

```text
RLS policy presence: documented
Live RLS enforcement: not verified
Teacher Release: NO
```
