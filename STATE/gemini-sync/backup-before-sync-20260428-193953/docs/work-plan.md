# Work Plan — www / Moodle Teacher Hub

תוכנית עבודה מעשית לריפו `yanivmizrachiy/www`.

מקור אמת: `PROJECT_RULES.md`.

הכלל המרכזי: מתקדמים רק לפי קוד אמיתי, בדיקות אמיתיות ותיעוד ב־STATE. אין דמו, אין נתונים מומצאים, ואין כפתורי סרק.

---

## מצב נוכחי

הריפו כבר כולל שכבת governance ותיעוד חזקה:

- `PROJECT_RULES.md`
- `docs/system-rules.md`
- `docs/requirements.md`
- `docs/repository-map.md`
- `docs/import-contract.md`
- `docs/lti-contract.md`
- `docs/moodle-api-contract.md`
- `docs/testing-plan.md`
- `docs/implementation-plan.md`
- `docs/typescript-config-notes.md`
- `STATE/project-status.md`
- `STATE/evidence-log.md`
- `STATE/lovable-intake.md`

בנוסף סונכרנו חלקי Lovable מרכזיים:

- `src/App.tsx`
- `src/main.tsx`
- `src/vite-env.d.ts`
- `src/index.css`
- `src/components/AppLayout.tsx`
- `src/components/AppSidebar.tsx`
- `src/components/StatusBadge.tsx`
- `src/hooks/useLtiSession.ts`
- `src/hooks/useMoodleConnection.ts`
- `src/hooks/useImports.tsx`
- `src/hooks/useChaptersIndex.ts`
- `src/hooks/use-mobile.tsx`
- `src/hooks/use-toast.ts`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`

---

## יעד על

להפוך את הריפו `www` לאתר Moodle Teacher Hub יציב, אמיתי, מסודר ומוכן להמשך פיתוח, כאשר כל מה שמוצג בממשק מבוסס על נתוני אמת בלבד:

- LTI מספק כניסה והקשר.
- Supabase RPC מספק נתונים שיובאו או אומתו.
- Moodle API חי יופעל רק אם יהיה token אמיתי ומאומת.
- מסכים ריקים מציגים הסבר אמת ולא דמו.

---

## שלב 1 — השלמת קבצים שחסרים ל־build

מטרה: להגיע למצב שהאפליקציה יכולה להיבנות ללא import חסר.

קבצים חסרים בעדיפות גבוהה:

- `src/hooks/useMoodleData.ts`
- `src/lib/utils.ts`
- `src/components/ui/*` הנדרשים ל־shadcn/sidebar/toast/button/cards
- `src/pages/Dashboard.tsx`
- `src/pages/Import.tsx`
- `src/pages/Students.tsx`
- `src/pages/StudentProfile.tsx`
- `src/pages/Tasks.tsx`
- `src/pages/Chapters.tsx`
- `src/pages/ChapterDetail.tsx`
- `src/pages/Grades.tsx`
- `src/pages/ActivityPage.tsx`
- `src/pages/Reports.tsx`
- `src/pages/reports/StudentReport.tsx`
- `src/pages/reports/TaskReport.tsx`
- `src/pages/reports/DayReport.tsx`
- `src/pages/reports/GapReport.tsx`
- `src/pages/Export.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/Setup.tsx`
- `src/pages/LtiBootstrap.tsx`
- `src/pages/NotFound.tsx`

כל קובץ שנוצר לבד חייב לעמוד בכללים:

- אין נתוני דמו.
- אין כפתור שלא עובד.
- אם אין נתונים — empty state ברור.
- כל נתונים מגיעים מ־hooks/RPC בלבד.

---

## שלב 2 — השלמת תשתית build

מטרה: לוודא שהריפו מכיל את כל קבצי התשתית הדרושים.

קבצים לבדיקה/השלמה:

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `components.json`
- `index.html`
- `.env.example`

בדיקות:

```bash
npm install
npm run build
npm run lint
npm run test
```

אם פקודה לא קיימת — לתעד ב־STATE ולא להמציא שעברה.

---

## שלב 3 — מסכי shell בטוחים

מטרה: כל route ב־`App.tsx` ייטען ולא יישבר.

דרישה לכל מסך:

- כותרת ברורה בעברית.
- הסבר מה המסך מציג.
- מצב טעינה.
- מצב שגיאה.
- מצב ריק שמסביר איזה דוח Moodle חסר.
- אין ערכי placeholder שמתחזים לנתונים אמיתיים.

מסכים לפי סדר עבודה:

1. Dashboard
2. Import
3. Students
4. Grades
5. Tasks
6. Chapters
7. Activity
8. Reports
9. Export
10. Settings
11. Setup
12. LtiBootstrap
13. NotFound

---

## שלב 4 — חיבור נתונים אמיתי למסכים

מטרה: להשתמש ב־hooks שכבר סונכרנו.

חיבורים עיקריים:

- Dashboard -> `useImportsOverview`, `useLtiSession`
- Students -> `useImportedStudents`
- Grades -> `useGradesMatrix`
- Tasks/Chapters -> `useCourseStructure`, `useChaptersIndex`
- Activity -> `useActivityOverview`, `useDailyActivity`, `usePracticeTime`
- Reports -> `useStudentReports`, `useTaskCompletionDetail`, `useDailyActivity`
- StudentProfile -> `useStudentProfile`
- Import -> `postImport`
- Settings -> `useLtiSession`, domain statuses

כל חיבור צריך להציג חוסרים בצורה שקופה.

---

## שלב 5 — ייבוא Moodle אמיתי

מטרה: לוודא שהייבוא לא ממציא נתונים.

נדרש:

- parser/mapper ל־Students.
- parser/mapper ל־Grades.
- parser/mapper ל־Activity Completion.
- parser/mapper ל־Logs.
- preview לפני כתיבה.
- warnings.
- provenance.
- שמירת batch.

הייבוא בפועל מתבצע דרך:

```text
/functions/v1/import-moodle-report
```

אין לשמור דוחות תלמידים אמיתיים בריפו.

---

## שלב 6 — LTI אמיתי

מטרה: לוודא ש־LTI אינו רק מסמך אלא עובד.

בדיקות:

- `lti-launch` קיים.
- OAuth1 HMAC-SHA1 מאומת.
- launch URL נקי.
- consumer key/secret בלי whitespace.
- session token נוצר.
- redirect ל־`/lti?t=<token>` או route תואם.
- `lti_get_context` מחזיר site/session/domains.

אין להסיק מ־LTI שיש API נתונים חי.

---

## שלב 7 — Supabase functions ומיגרציות

מטרה: לסגור backend אמיתי.

קבצים שצריך לסנכרן או ליצור:

- `supabase/functions/lti-launch/index.ts`
- `supabase/functions/lti-config/index.ts`
- `supabase/functions/import-moodle-report/index.ts`
- `supabase/functions/moodle-probe/index.ts`
- `supabase/functions/moodle-proxy/index.ts`
- `supabase/functions/site-admin/index.ts`
- `supabase/migrations/*.sql`

בדיקה חשובה:

- אין service role בפרונט.
- אין secrets בריפו.
- RLS/RPC/session מתועדים.

---

## שלב 8 — Moodle API עתידי

מטרה: להכין בלי לשקר.

סטטוס נוכחי:

```text
Moodle API live sync: blocked-no-token
Moodle write-back: blocked-no-token
```

פתיחה רק אחרי:

- token אמיתי.
- endpoint אמיתי.
- בדיקת קריאה.
- בדיקת הרשאות.
- תיעוד ב־`STATE/evidence-log.md`.

כתיבה ל־Moodle רק אחרי בדיקת הרשאות כתיבה ופעולה מבוקרת.

---

## שלב 9 — ייצוא ודוחות

מטרה: להציג רק יכולות קיימות.

סטטוסי יעד:

- CSV — אם קיים קוד יצוא.
- Excel/XLSX — רק אם נוצרת חוברת אמיתית.
- PDF — רק אם יש יצוא PDF אמיתי או הדפסת דפדפן מוצהרת.
- Print — רק אם נבדק.

אין להציג Excel/PDF כעובדים אם לא נבדקו.

---

## שלב 10 — בדיקות ושחרור

לפני סימון pilot-ready:

- build עובר.
- אין imports שבורים.
- כל route נטען.
- empty states קיימים.
- ייבוא אחד לפחות נבדק עם קובץ Moodle אמיתי לא פרטי / מסונן.
- אין secrets.
- STATE מעודכן.

לפני production-ready:

- LTI אמיתי מול Moodle אמיתי נבדק.
- Supabase functions נבדקו.
- ייבוא דוחות מרכזיים נבדק.
- הרשאות מורה/קורס נבדקו.
- כל כפתור בממשק עובד או מוסתר.

---

## סדר העבודה המיידי

1. להשלים `useMoodleData.ts`.
2. להשלים `src/lib/utils.ts`.
3. להשלים רכיבי UI שחסרים ל־shadcn.
4. ליצור/לסנכרן `Dashboard.tsx`.
5. ליצור/לסנכרן `Import.tsx`.
6. ליצור shells בטוחים לכל routes.
7. להריץ build.
8. לתקן שגיאות build אחת־אחת.
9. לעדכן `STATE/evidence-log.md` אחרי כל בדיקה.

---

## אחוזי התקדמות

```text
Governance/docs: 100%
Lovable intake: 98% לפי קבצים שנמסרו
Frontend shell: חלקי, מתקדם
Data hooks: מתקדם
Supabase types/client: מתקדם
Pages: חסר
UI components: חסר חלקית
Build verification: 0% עד שלא הורץ בפועל
Runtime verification: 0% עד שלא נבדק בפועל
Production readiness: 0% עד בדיקות אמיתיות
```
