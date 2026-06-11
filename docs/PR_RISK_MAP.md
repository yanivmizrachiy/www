# מפת סיכוני PR — Moodle Teacher Hub

עודכן: 2026-06-12
Teacher Release: **NO**

## סיכון גבוה — לא לגעת בלי הוראה מפורשת

- LTI launch flow: `/api/lti/launch`, `/api/lti13/*`.
- Participants import.
- Gradebook import.
- Logs import.
- Supabase migrations / production SQL / RLS policies.
- Teacher Release gate.
- deploy / `render.yaml`.
- secrets/env handling.
- מחיקה או העברה של `luz-teddy/`.

## סיכון בינוני

- Data model mappings בין `students`/`grade_results`/`log_events` לבין `imported_*`.
- Course Structure / Activity Completion.
- `/api/students`, `/api/tasks`, `/api/grades`, `/api/activity`.
- RPC fallbacks ב־`useImports.tsx`.
- התאמת תלמידים בין Participants, Gradebook, Completion, Logs ו־NRPS.

## סיכון נמוך יחסית

- docs truth maps.
- ניסוחי UI שמונעים overclaim.
- tokens קיימים ב־Design System.
- imports חסרים ב־TypeScript בלי שינוי לוגיקה.
- package scripts שמאגדים פקודות קיימות בלי לשנות behavior.

## כללי review

- כל PR חייב לציין האם Teacher Release נשאר NO.
- כל claim על RLS דורש הבחנה בין policy presence לבין live enforcement.
- כל claim על Course Structure דורש completion/course-structure evidence.
- כל claim על Practice Time דורש duration official או סימון estimate/blocker.
- כל שינוי בנתוני תלמידים חייב להיות aggregate/documented בלבד, ללא rows.
