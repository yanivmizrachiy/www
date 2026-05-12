# Lovable/Gemini Critical Gap Audit — 2026-04-28

בדיקה זו בוצעה על הריפו הקנוני `yanivmizrachiy/www` מול רשימת הקבצים והיכולות שדווחו בדוח Lovable ובפלט Gemini AI Studio.

המטרה: לזהות מה כבר נמצא בפועל בריפו ומה עדיין חסר, בלי להסתמך על טענות AI Studio שלא נדחפו לגיטהאב.

---

## מקור אמת

- ריפו קנוני: `yanivmizrachiy/www`
- מקור דרישות: `PROJECT_RULES.md`
- מקור השוואה: `docs/lovable-handoff-report.md`
- מקור עדות Gemini: `STATE/gemini-ai-studio-run-2026-04-28.md`

---

## ממצאי בדיקה ישירה על main

| פריט קריטי | מצב ב־main | הערה |
|---|---:|---|
| `src/components/PracticeTimeSection.tsx` | חסר | דווח ב־Lovable/Gemini אך לא נמצא בריפו |
| `src/components/TruthBadge.tsx` | חסר | דווח ב־Lovable/Gemini אך לא נמצא בריפו |
| `src/lib/duration.ts` | חסר | נדרש לזמן תרגול/פורמט זמן עברי |
| `src/lib/csv.ts` | חסר | דווח כקיים ב־Lovable/Gemini |
| `src/lib/moodleImport.ts` | חסר | קריטי לייבוא דוחות Moodle חכם |
| `src/components/EmptyDomain.tsx` | חסר | דווח ב־Gemini כמשוחזר |
| `src/components/ImportEmptyState.tsx` | חסר | דווח ב־Gemini כמשוחזר |
| `src/components/LaunchDiagnostics.tsx` | חסר | דווח ב־Gemini כמשוחזר |
| `src/lib/dataAdapters/ManualImportAdapter.ts` | חסר | חסר adapter מלא לפי דוח Lovable |
| `src/pages/StudentProfile.tsx` | קיים חלקית | קיים דף קצר מאוד, תלוי `useStudentProfile` |
| `src/hooks/useImports.tsx` | קיים חלקית/מתקדם | כולל hooks רבים, כולל `usePracticeTime` ו־`useStudentProfile` |
| `supabase/functions/lti-launch/index.ts` | חסר | קריטי ל־LTI אמיתי |
| `supabase/migrations/20240428_initial_reconstruction.sql` | חסר | דווח ב־Gemini בלבד; לא נמצא בריפו |
| `src/components/SafePage.tsx` | קיים | מספק empty state אמת בלבד |

---

## מסקנות

1. הדוח של Gemini/AI Studio לא סונכרן בפועל ל־main.
2. חלק מה־hooks כבר קיימים בריפו, אבל חלק משמעותי מקבצי UI/parser/backend שהוזכרו ב־Lovable/Gemini חסר.
3. `StudentProfile.tsx` קיים אבל דל מאוד ביחס לדוח Lovable, ולכן יש לסמן אותו partial.
4. `useImports.tsx` מכיל חלק משמעותי מהלוגיקה המתקדמת, כולל `usePracticeTime`, `useStudentProfile`, `deleteImportBatch` ו־RPC hooks, ולכן אסור לדרוס אותו בלי השוואה.
5. חסרים רכיבים קריטיים שמאפשרים מימוש מלא של דרישת זמן תרגול יומי וייבוא חכם: `PracticeTimeSection.tsx`, `duration.ts`, `moodleImport.ts`, `csv.ts`.
6. חסרה שכבת Supabase Functions ב־main, ובעיקר `lti-launch`, ולכן LTI end-to-end אינו נחשב מוכן בריפו.

---

## סטטוס אמת מעודכן

```text
Lovable/Gemini information captured: yes
Gemini code synced to main: no
Critical frontend gaps remain: yes
Critical import parser gap: yes
Critical LTI function gap: yes
Build status after these gaps: not verified in this audit
Production-ready: no
```

---

## פעולה מומלצת הבאה

השלב הבטוח הבא:

1. להוריד ZIP מלא מ־Google AI Studio.
2. להעלות את ה־ZIP לצ׳אט.
3. להשוות קובץ־קובץ מול `main`.
4. להכניס שינויים ל־branch בטוח, לא ישירות ל־main.
5. לא להריץ SQL אוטומטית.
6. להריץ `npm install` ו־`npm run build` על branch.
7. רק אם build עובר — commit/PR מסודר.

---

## הערת בטיחות

אין להעתיק ידנית את `20240428_initial_reconstruction.sql` או להריץ אותו על Supabase קיים בלי בדיקה, כי הוא עלול להתנגש עם migrations קיימות או עם מצב DB אמיתי.

אין לערוך `src/integrations/supabase/client.ts` כדי להסתיר חוסר ENV אלא אם זו החלטה מתועדת ומבוקרת, כי לפי כללי הפרויקט קובצי Supabase auto-generated/infra רגישים צריכים טיפול שמרני.
