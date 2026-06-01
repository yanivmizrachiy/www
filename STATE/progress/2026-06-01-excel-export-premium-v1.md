# 2026-06-01 - Excel Export Premium V1

**Branch:** excel-export-premium-v1
**Teacher Release:** NO (ללא שינוי)
**PR #127:** לא נגעתי

## מטרה
ייצוא Excel/CSV מקצועי בעברית RTL מכל הנתונים האמיתיים שבמערכת, עם תאריך ישראלי
(D/M/YY), יום בשבוע בעברית, כותרות ברורות, וללא חשיפת פרטים רגישים.

## ספריית ייצוא מאוחדת
נוצר `src/lib/exportSheet.ts` — מקור אמת יחיד לבניית קבצי Excel:
- כל גיליון נפתח מימין לשמאל (`!sheetView` RTL + `Workbook.Views` RTL).
- `sheetDate` — תאריך ישראלי D/M/YY (מבוסס `formatTeacherDateDmyShort`).
- `sheetWeekday` — יום בשבוע בעברית (ראשון…שבת).
- כותרות עברית מפורשות לכל עמודה; רוחב עמודות אוטומטי תחום.
- `exportSheetXlsx` (גיליון יחיד) ו-`exportWorkbookXlsx` (רב-גיליונות).
- אם אין שורות — לא מורידים קובץ (שמירה על "אין נתון" אמיתי), לא מייצרים שורות מזויפות.

## hook חדש
`useNrpsRoster` ב-`src/hooks/useImports.tsx` — קורא את NRPS preview הקיים והבטוח.
חושף **שם + role_kind בלבד**. לא חושף id-hash, נוכחות דוא״ל, מזהים גולמיים, טוקנים או סודות.
כשאין NRPS חי — `live:false` ולא ממציא רשימה.

## עמוד הייצוא (`src/pages/Export.tsx`)
הורחב מ-3 ייצואים לכלל הסט המבוקש, מנתונים אמיתיים בלבד:
- **תלמידים** — שם + שם משתמש Moodle בלבד (ללא דוא״ל / מזהה גולמי).
- **מורים** — מ-NRPS: שם + תפקיד עברי.
- **משתתפים** — מ-NRPS: שם + תפקיד עברי.
- **ציונים** — מטריצה לפי תלמיד/פריט + סטטוס `חסר ציון`/`לא ידוע` מ-PR #245.
- **משימות** — מבנה משימות לפי פרק + ספירת `בוצעו`/`לא עשה`.
- **לוגים** — פעילות יומית (כולל יום בשבוע) + פעילות לפי תלמיד.
- **דוח פערים** — אילו מקורות קיימים/חסרים (`אין נתון`).
- **דוח תלמיד אישי** — בורר תלמיד אמיתי → ציונים, השלמת משימות, סיכום פעילות (רב-גיליון).
- **דוח קורס מלא** — ריכוז רב-גיליונות: סיכום תלמידים, פערים, פעילות יומית.
- כל כרטיס מושבת עם סיבה אמיתית (`לא אומת` ל-NRPS לא פעיל) כשאין מקור.

## פרטיות
- לא מיוצאים: דוא״ל, מזהים גולמיים, טוקנים, client assertions, מפתחות, סודות, ת״ז, פרטים אישיים.
- המזהה היחיד המיוצא הוא `external_username` (שם משתמש Moodle שכבר מוצג בממשק) — בגיליון התלמידים בלבד.
- תוויות סטטוס דוחות מ-PR #245 משולבות בייצוא ציונים/משימות/פערים/אישי/קורס מלא.

## נתונים אמיתיים
- אין דמו, אין נתונים מזויפים, אין 216/222/6 קשיח.
- כל הנתונים מ-hooks קיימים (`useImportedStudents`, `useGradesMatrix`,
  `usePracticeTime`, `useImportsOverview`, `useStudentReports`,
  `useTaskCompletionDetail`, `useDailyActivity`, `useActivityOverview`,
  `useCourseStructure`, `useStudentProfile`) + NRPS preview הבטוח.

## לא שונה
- LTI launch / allowlist, Participants/Gradebook/Logs import, Supabase schema/migrations,
  student sync, evidence logs, render/env/secrets, Teacher Release gate, PR #127,
  fallback ידני לייבוא, server.js (אין שינוי runtime).
- `package.json` / lockfile — ללא תוספות תלות (xlsx כבר קיים).

## בדיקה חיה ב-Moodle (לא אומת)
- יש לוודא חיה שהקבצים נפתחים RTL ב-Excel/Sheets עם נתוני אמת מקורס חי.
- יש לוודא ש-NRPS חי מספק שמות מורים/משתתפים בקורס אמיתי. לא אומת מול session חי.

## 216 לומדים מסונכרנים
התוספת היא צד-לקוח בלבד (ייצוא קריאה מ-hooks קיימים). אין שינוי ב-API, בסכמה,
בסנכרון או ב-server.js. לכן אין סיכון ל-216 הלומדים המסונכרנים.

## בדיקות
- `node --check src/server.js` — OK
- `npm run check` — OK
- `npm run build` — OK
- `npm run doctor` — REPO_DOCTOR_OK
- `npm run typecheck` — ללא שגיאות חדשות מהקבצים ששונו (שגיאות `GradebookImport.tsx` קיימות מראש, עמוד לא מנותב).
- כל ה-`audit:*` — OK (הבלוקרים הקיימים נשארים כמתועד, Teacher Release NO).

## Teacher Release
נשאר **NO**.

## התקדמות
PR 16 מתוך הסדרה — ייצוא Excel מקצועי. הערכת התקדמות מצטברת: ~90%.
