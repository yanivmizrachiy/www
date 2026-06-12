# 2026-06-12 — Deep Truth Sync

**Branch:** codex/deep-truth-sync  
**Teacher Release:** NO

## מה השתנה

- עודכן `PROJECT_RULES.md` בבלוק אמת עדכני שמבהיר מה מאומת בפועל: `students=62`, `grade_items=243`, `grade_results=1693`, `log_events=89995`, ו־Teacher Release נשאר NO.
- נוספו מסמכי truth:
  - `docs/API_CANONICAL_MAP.md`
  - `docs/DATA_MODEL_TRUTH.md`
  - `docs/CI_TRUTH_MAP.md`
  - `docs/REPO_BOUNDARY_AND_LUZ_TEDDY.md`
  - `docs/PR_RISK_MAP.md`
- תועדו גבולות schema כפול, `course_id` לא אחיד, student identity לא אחיד, RPC legacy/fallback, ו־luz-teddy כחריג זמני.
- תוקנו ניסוחי UI/scripts כך ש־Logs לא מוצגים כזמן תרגול רשמי ללא duration מאומת.
- נוסף token ל־`status-pending`.
- נוסף import חסר ב־`GradebookImport.tsx` בלי שינוי לוגיקת Gradebook.
- נוספו scripts מאגדים: `validate:moodle:static`, `validate:moodle:live`, `validate:moodle:all`.

## גבולות

- לא שונו LTI launch flow, Participants import, Gradebook import logic, Logs import logic, Supabase migrations, Teacher Release gate, deploy או `render.yaml`.
- לא נמחק `luz-teddy/`.
- לא נוצר fake data.
- לא הורצו live validation scripts.
- RLS לא מסומן כעובד live; רק policy presence מתועד כראיה היסטורית.

## חסום

- Teacher Release נשאר NO.
- Moodle Web Services חסום עד token וסביבת live מאומתת.
- Multi-teacher / multi-course isolation live חסר.
- DB-layer RLS enforcement live חסר.
- Course Structure proven חסר עד evidence של completion/course-structure אמיתי.
- Practice Time רשמי חסר עד duration רשמי ממודל.
