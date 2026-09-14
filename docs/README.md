# Documentation Map — `yanivmizrachiy/www`

התיקייה `docs/` מכילה תיעוד משלים, חוזים, runbooks וראיות של **Moodle Teacher Hub בלבד**. היא אינה מקור אמת מקביל.

## סדר אמת קנוני

1. `../SSOT.md` — גבול המוצר המחייב והעדכני ביותר.
2. `../PROJECT_RULES.md` — אמת מפורטת של Moodle Teacher Hub.
3. `../RULES.md` — גבולות הריפו וכללי פרטיות/עבודה.
4. `../PROJECT_MEMORY.md`, `../STATE/**` ו-`docs/**` — ידע, ראיות והיסטוריה של Teacher Hub; במקרה סתירה יש ליישר אותם למקורות לעיל.

## מצגת Moodle

המצגת/Guide אינה מתועדת, מפותחת, נבדקת או מפורסמת מתוך הריפו הזה.
מקור האמת היחיד שלה הוא:

`yanivmizrachiy/moodle-guide-presentation`

https://github.com/yanivmizrachiy/moodle-guide-presentation

אין ליצור כאן מסמכי Guide חדשים או מקור תוכן מקביל.

## Teacher Hub — תיקיות תיעוד

- `architecture/` — ארכיטקטורה, data flow, Moodle/API contracts ותכנון מערכת.
- `lti/` — LTI 1.0/1.1, LTI 1.3, NRPS, AGS, launch ושירותים.
- `imports/` — Participants, Gradebook, Logs וחוזי import.
- `persistence/` — durable storage, Supabase, schema ו-runbooks.
- `privacy/` — בטיחות נתונים ופרטיות תלמידים.
- `operations/` — runbooks, בדיקות ומפות ריפו; מסמכים ישנים עשויים לתאר branches/runtimes היסטוריים.
- `ai-handoff/` — prompts/reports להעברת עבודה בין כלי AI.
- `dev/` — הערות פיתוח.
- `archive-candidates/` — snapshots ישנים שממתינים להחלטת archive/delete; אין למחוק בלי אישור.

## כלל פרטיות

אין להכניס ל-`docs/` נתוני תלמידים אמיתיים, exports גולמיים, secrets, tokens, cookies או raw Moodle responses עם PII.
