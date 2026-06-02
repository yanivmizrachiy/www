# 2026-06-01 - Grades Real Report Hardening V1

**Branch:** grades-real-report-hardening-v1
**Teacher Release:** NO (ללא שינוי)
**PR #127:** לא נגעתי

## מטרה
חיזוק אמת בעמוד הציונים. ציונים לפי תלמיד ולפי פעילות, ממוצע מציונים קיימים בלבד,
חסר ציון אינו אפס, היעדר נתון אינו "לא הגיש". סינון אמיתי וללא סינון תאריך מזויף.

## שינויים
- `src/pages/Grades.tsx` בלבד (תצוגה/חישוב צד-לקוח):
  - **ממוצע לפי תלמיד** — עמודה חדשה. מחושב רק מציונים קיימים
    (`is_missing === false` ועם `numeric_value`). ריק → `אין נתון`, לא אפס.
  - **ממוצע לפי פעילות** — שורת `tfoot` עם ממוצע לכל פריט ציון, מציונים קיימים בלבד.
  - **סינונים** — סינון טקסט לפי שם תלמיד וסינון לפי שם פריט ציון. הממוצעים
    מחושבים מחדש לפי הסינון הפעיל (ממוצע על הפריטים/התלמידים המוצגים).
  - **תוויות אמת מאוחדות** מ-`reportStatus.ts`:
    - אין שורת ציון מיובאת → `אין נתון` (`no_data`).
    - פריט ציון ללא ערך → `חסר ציון` (`missing_grade`, לא אפס).
    - ערך לא-מספרי לא חד-משמעי → `לא ידוע` (`unknown`).
    קודם הוצג `אין נתון` גנרי ו-`—` מעורפל ללא הבחנה.
  - **ללא סינון תאריך** — למקור מטריצת הציונים אין ממד תאריך
    (`/api/imports/grades-matrix` ו-`GradesMatrix` לא נושאים תאריך), לכן לא נוסף
    סינון טווח תאריכים; נוספה הערה אמיתית המסבירה זאת במקום פילטר מזויף.
  - **תג אמת דינמי** — `proven` רק כשמוצגות שורות, אחרת `missing` (קודם `proven` קבוע).

## התנהגות נתונים אמיתיים
- אין דמו, אין נתונים מזויפים, אין 216/222/6 קשיח.
- ממוצע אך ורק מציונים קיימים; חסר ציון אינו אפס; אין שורת ציון אינו "לא הגיש".
- כל הנתונים מגיעים מ-hook קיים `useGradesMatrix` (ייבוא Gradebook אמיתי בלבד).

## לא שונה
- backend / `src/server.js` ונקודות קצה לציונים — ללא שינוי. הלוגיקה הקיימת כבר
  מסמנת `is_missing` כאשר אין ערך מספרי; לא נדרש תיקון.
- ערכי ציון / persistence / סכמת Supabase / migrations — לא נגעתי.
- Export (`src/pages/Export.tsx`) — כבר מייצא ציונים עם סטטוס `חסר ציון`; לא נדרש שינוי.
- LTI launch / allowlist, Participants/Gradebook/Logs import, evidence logs,
  student sync, render/env/secrets, Teacher Release gate, PR #127, fallback ידני.

## בדיקה חיה ב-Moodle (לא אומת)
- יש לוודא חיה על קורס אמיתי עם ייבוא Gradebook חלקי שהממוצע לפי תלמיד ולפי פעילות
  מחושב רק מציונים קיימים, ושתאים חסרים מציגים `חסר ציון`/`אין נתון` נכון. לא אומת מול session חי.

## 216 לומדים מסונכרנים
השינוי הוא תצוגתי/חישובי בצד-לקוח בלבד בעמוד אחד; אין שינוי ב-hooks, ב-API,
בסכמה, בסנכרון או בערכי ציון. לכן אין סיכון ל-216 הלומדים המסונכרנים.

## בדיקות שהורצו
- `node --check src/server.js` — PASS
- `npm run check` — PASS
- `npm run build` — PASS
- `npm run doctor` — PASS
- `npm run typecheck` — 4 שגיאות קיימות מראש ב-`GradebookImport.tsx` בלבד (אומת מול main);
  אפס שגיאות חדשות מהקובץ ששונה.
- `npm run audit:moodle-automation` — PASS
- `npm run audit:automation-capabilities` — PASS
- `npm run audit:automation-capability-contract` — PASS
- `npm run audit:automation-evidence-log` — PASS
- `npm run audit:auto-extraction-source-router` — PASS
- `npm run audit:multi-teacher-isolation-evidence` — PASS
- `npm run audit:supabase-rls-isolation-readiness` — PASS (חוסם RLS מתועד ביושר; Teacher Release נשאר NO)

## Teacher Release
נשאר **NO**.

## התקדמות
PR 18 מתוך הסדרה — חיזוק אמת בציונים. הערכת התקדמות מצטברת: ~90%.
