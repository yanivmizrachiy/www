# 2026-06-16 — Luxury Homepage / Dashboard (real code) V1

מסמך התקדמות עבור ה-PR `feat/luxury-homepage-dashboard-real-code-20260616`.

## מה השתנה
שדרוג חזותי (premium) של עמוד הבית `src/pages/Dashboard.tsx` — refactor אמיתי, לא החלפת regex.
נוספו רכיבים מקומיים בתוך הקובץ, כולם presentation בלבד:

- `LuxuryHero` — hero מעודן. מקבל את כל הנתונים מ-props שמגיעים מ-hooks אמיתיים בלבד
  (`useLtiSession`, `useDashboardTeachers`). מציג pills של אמת.
- `LuxuryActionTile` — אריח פעולה פרימיום. ה-`value` מוצג verbatim מה-caller
  (`useImportsOverview`) — אינו ממציא מספרים.
- `LiveTruthPill` — pill סטטוס יחיד; tone = `live` רק כשמקור חי אישר, אחרת
  `pending` / `manual` / `muted`.
- `HomeSectionHeader` — כותרת סקשן עם kicker + subtitle אמת.

מרקרים שנוספו בקוד האמיתי:
- `MTH_LUXURY_HOME_V1`
- `MTH_LUXURY_HOME_REAL_DATA_ONLY_V1`
- `MTH_LUXURY_HOME_NO_DEMO_V1`

שפת אמת גלויה בעמוד: "ללא נתוני דמו", "נתוני NRPS חיים" / "ממתין לרשימת משתתפים",
"Teacher Release: NO", וכן subtitles שמסבירים ש-"—" = אין נתון ולא מספר מומצא.

## מה לא השתנה
- כל ה-hooks וזרימות הנתונים האמיתיים נשמרו ללא שינוי לוגי:
  `useImportsOverview`, `useSyncStatus`, `useLtiSession`, `useDashboardTeachers`,
  `useSourceStatus`, `useAutoSyncStatus`, `computeNextAction`.
- `AutoSyncBanner`, `NextBestActionPanel`, `SourceRow`, `StatCard`, ולוגיקת
  `handleSyncSpace` / safe-name helpers — ללא שינוי התנהגות.
- לא נגענו ב-`server.js`, LTI launch flow, Participants/Gradebook/Logs import,
  Supabase migrations, render.yaml או שער Teacher Release.
- לא נמחקו קבצים. לא נוספו secrets/PII.

## בטיחות / אמת
- **Teacher Release נשאר NO** — שום דבר כאן לא משנה שער שחרור ולא טוען ראיה חיה.
- אין נתוני דמו, אין מספרים מומצאים. כל count/status מגיע מ-hook אמיתי או ממצב
  ריק/לא-ידוע מפורש (`—` / `...` / "מסנכרן…" / "ממתין למודל").
- אין חשיפת שורות תלמיד גולמיות, לוגים גולמיים, אימיילים, ת"ז או תשובות Moodle
  גולמיות. ה-hero מציג אגרגטים בלבד (NRPS) ושמות מורים בלבד דרך ה-safe-name guard
  הקיים.
- צבעים: שימוש בטוקני העיצוב הקיימים (`status-*`, `primary`, `muted`, `border`,
  `shadow-elegant`) ובמחלקת הכרטיס הכהה הקיימת `MTH_DASHBOARD_DARK_BLUE_CARD_V1`.
  לא נוספו טוקני HEX גולמיים חדשים — ה-HEX היחיד שבשימוש הוא זה שכבר היה בקובץ.
- RTL/עברית נשמרו; ל-pills יש `title` נגיש, לסקשנים `aria-label`.

## בדיקות שהורצו
- `npm ci` — הצליח.
- `npm run typecheck` (`tsc -b`) — עבר, 0 שגיאות.
- `npm run build` (maintenance cjs + `node --check src/server.js` + `vite build`) —
  עבר, build הצליח (2174 modules).
- לא הורצו סקריפטי validation חיים (`validate:*:live`) — אין סביבה חיה מוגדרת,
  ולא נדרש לשינוי front-end זה.

## מה לא נכלל ב-PR
- אין שינוי ל-`STATE/CURRENT.md` או `evidence-log.md` — לא השתנתה אמת מקור-עליון;
  זהו ליטוש חזותי בלבד.
- אין קבצי prompt בקומיט.
