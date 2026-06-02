# 2026-06-01 - Logs Practice Time Truth V1

**Branch:** logs-practice-time-truth-v1
**Teacher Release:** NO (ללא שינוי)
**PR #127:** לא נגעתי

## מטרה
זמן פעילות/תרגול לפי אמת בלבד. לא מציגים זמן sessionization כאילו הוא משך רשמי.
אם אין שדה משך זמן רשמי במקור הלוגים — מסמנים בבירור כ"הערכה" ומציגים את ההודעה:
`אין שדה משך זמן רשמי — לא ניתן לחשב זמן אמיתי.`
אם אין מספיק לוגים — לא מחשבים זמן כלל.

## שינויים

### Backend — `src/server.js`
- `buildPracticeTimeFromLogEvents` (אנדפוינט `/api/imports/time-range`):
  - **זיהוי מקור משך רשמי** — `rowOfficialDurationSeconds()` בודק
    `duration_seconds`/`duration`/`timeDiff`. לוגי Moodle רגילים אינם נושאים שדה
    כזה, לכן בפועל `has_official_duration = false`. השדה לא מומצא לעולם.
  - **`meta` חדש (אמת)**: `has_official_duration`, `time_basis` (`official`/`estimate`),
    `rows_with_official_duration`, `log_event_count`, `min_log_events`, `enough_logs`,
    `no_official_duration_message_he`, `events_last_24h`, `events_last_week`.
  - **24 שעות / שבוע** — נספרים כ**אירועים** (עובדה מתוך timestamps), לא כמשך זמן.
  - fallback מה-store מעביר שדה משך רק אם קיים באמת; לא מומצא.
  - ה-select מ-Supabase לא שונה (אין עמודת משך בסכמה — הוספתה הייתה גורמת לשגיאה).
- ייבוא `MIN_LOG_EVENTS_FOR_PRACTICE_TIME` מ-`practiceTime.js` (סף קיים = 2).

### Frontend
- `src/hooks/useImports.tsx` — טיפוס `PracticeMeta` חדש עם דגלי האמת (אופציונליים,
  payload ישן נחשב הערכה).
- `src/pages/TimeRangeReport.tsx`:
  - באנר אמת מותנה: ירוק "משך זמן רשמי" כשיש מקור; צהוב עם ההודעה
    `אין שדה משך זמן רשמי — לא ניתן לחשב זמן אמיתי.` כשאין.
  - מצב **אין מספיק לוגים** — הודעה ייעודית, לא מציגים טבלת זמן.
  - כותרת/עמודה: "זמן (הערכה)" + ערך בצבע אזהרה כשאין מקור רשמי.
  - `TruthBadge` → `proven`("משך רשמי") או `blocked`("הערכה — לא מאומת"),
    במקום `calculated` הקבוע שהשתמע כעובדה.
  - **סיכום אירועים 24 שעות / שבוע אחרון** (עובדה: ספירת אירועים בלבד).
- `src/components/PracticeTimeSection.tsx`:
  - אותם דגלי אמת: מצב "אין מספיק לוגים", תג `proven`/`blocked`,
    כותרת "זמן כולל (הערכה)" כשאין מקור רשמי.

## התנהגות נתונים / אמת מול הערכה
- אין דמו, אין נתונים מזויפים, אין 216/222/6 קשיח.
- זמן sessionization מסומן במפורש כ**הערכה** ולא כמשך רשמי.
- ללא שדה משך רשמי → הודעת אמת מדויקת, לא ערך מוצג כעובדה.
- פחות מ-`min_log_events` (2) → אין חישוב זמן.
- ספירות אירועים / פעילות אחרונה / 24 שעות / שבוע — עובדה מתוך log_events אמיתיים.

## לא שונה
- heuristic ה-sessionization (חלון 30 דק') — נשמר אך ממוסגר ביושר כהערכה.
- env / secrets / Render / render.yaml / production SQL.
- Teacher Release gate, PR #127, manual import fallback, evidence logs,
  Supabase schema/migrations, student sync, LTI launch/allowlist.
- ה-select מ-Supabase ל-`log_events` (ללא עמודת משך).

## בדיקה חיה ב-Moodle (לא אומת)
- יש לוודא חיה על קורס אמיתי עם ייבוא Logs ש-`has_official_duration=false`,
  שהבאנר והעמודה מוצגים כ"הערכה", ושסיכום 24 שעות/שבוע תואם את ספירת האירועים.
- אם מקור עתידי יישא שדה משך רשמי — לוודא שהדגל מתהפך ל-`official`. לא אומת מול session חי.

## 216 לומדים מסונכרנים
שינוי תצוגתי + הוספת metadata קריאה בלבד ל-endpoint קיים; אין שינוי בכתיבה,
בסכמה, בסנכרון, ב-LTI או בערכי נתונים. לכן אין סיכון ל-216 הלומדים המסונכרנים.

## בדיקות שהורצו
- `node --check src/server.js` — PASS
- `npm run check` — PASS
- `npm run build` — PASS
- `npm run doctor` — PASS (REPO_DOCTOR_OK)
- `npm run typecheck` — 4 שגיאות קיימות מראש ב-`GradebookImport.tsx` בלבד (אומת מול main);
  אפס שגיאות חדשות מהקבצים ששונו.
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
PR 19 מתוך הסדרה — אמת בזמן תרגול/פעילות. הערכת התקדמות מצטברת: ~91%.
