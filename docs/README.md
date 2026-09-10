# Documentation Map — `yanivmizrachiy/www`

התיקייה `docs/` מכילה תיעוד משלים, חוזים, runbooks וראיות לשני מוצרי Moodle הנפרדים בריפו: **Moodle Teacher Hub** ו-**Guide**. היא אינה מקור אמת מקביל.

## סדר אמת קנוני

1. `../PROJECT_MEMORY.md` — מקור האמת הקנוני ברמת הריפו: הפרדת המוצרים, Runtimes, Guide ודרישות עדכניות.
2. `../PROJECT_RULES.md` — אמת מפורטת של Moodle Teacher Hub בלבד.
3. `../RULES.md` — גבולות הריפו וכללי פרטיות/עבודה.
4. `../STATE/evidence-log.md` ושאר `STATE/**` — ראיות ו-snapshots היסטוריים; תאריך ישן אינו "מצב נוכחי".
5. `docs/**` — חוזים, ארכיטקטורה, runbooks והיסטוריה; במקרה סתירה יש ליישר אותם למקורות לעיל.

## Guide — מסמכים פעילים

- `GUIDE_MISSING_CAPTURES.md` — רשימת הצילומים האמיתיים החסרים לפרסום שקפים.
- `GUIDE_SCREENSHOTS_MANIFEST.md` — מניפסט נכסי הצילום.

מקור השקפים הקנוני עצמו נמצא ב-`../src/data/guideDeck.ts`. ה-Guide החי מוגש מ-GitHub Pages; Render אינו runtime של המצגת.

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
