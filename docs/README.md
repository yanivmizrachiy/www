# Documentation Map — Moodle Teacher Hub

תיעוד-ייחוס בלבד. **מקור האמת היחיד לכל הדרישות והכללים הוא [`../PROJECT_RULES.md`](../PROJECT_RULES.md).**
כאן שוכנים חוזים, מדריכים ו-runbooks — לא כללים ולא היסטוריה.

## תיקיות
- `architecture/` — ארכיטקטורת המוצר, זרימת נתונים, וחוזי Moodle/API.
- `lti/` — חוזה LTI 1.0/1.1 ו-1.3.
- `imports/` — חוזה ייבוא דוחות Moodle.
- `automation/` — מוכנות אוטומציה (NRPS/AGS/Web Services) ובדיקות מנהל.
- `moodle/` — צ'ק-ליסט הפעלה למנהל ה-Moodle.
- `deployment/` — הגדרת Render, משתני סביבה, והתקנת כלי LTI.
- `persistence/` — runbook פריסת Supabase.
- `operations/` — runbooks לייבוא משתתפים/ציונים/לוגים והתקנה.
- `dev/` — הערות פיתוח.
- `adr/` — החלטות ארכיטקטורה (ADR).
- `examples/` — `store.example.json` (הדגימה הסינתטית היחידה המותרת).

## מסמכי-על
- [`REBUILD_STATUS.md`](REBUILD_STATUS.md) — רשומת כל השיפורים (מהחדש לישן).
- [`DATA_MODEL_TRUTH.md`](DATA_MODEL_TRUTH.md) · [`API_CANONICAL_MAP.md`](API_CANONICAL_MAP.md) — סכימת המסד וה-API.
- [`CUTOVER_RUNBOOK.md`](CUTOVER_RUNBOOK.md) · [`CI_TRUTH_MAP.md`](CI_TRUTH_MAP.md) · [`PR_RISK_MAP.md`](PR_RISK_MAP.md).

## סטטוס והיסטוריה
`../STATE/` — סטטוס חי בלבד (`CURRENT.md`, `project-status.md`, `evidence-log.md`).

**אין לשמור נתוני תלמידים אמיתיים בתיקייה זו.**
