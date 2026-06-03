# PR #253 — Audit and next plan v1

תאריך: 2026-06-02
ריפו: `yanivmizrachiy/www`
מוצר: Moodle Teacher Hub / המודל החכם

מטרת המסמך: לשמור החלטת עבודה אחרי בדיקת PR #253, כדי שלא נשכח מה בריא, מה לא בריא, ומה עושים הלאה.

---

## החלטה קצרה

PR #253 קידם מבחינת סדר וחשיבה, אבל אינו מוכן למיזוג במצבו הנוכחי.

הוא לא הרס את `main`, כי הוא Draft PR פתוח ולא מוזג.

עם זאת, אם ימוזג כמו שהוא, הוא עלול להחזיר את המוצר אחורה ולשבור חלקים שנבנו כבר על ידי Claude/Profixy.

---

## מה בריא ב־PR #253

1. עצם הרעיון של consolidation נכון: לאחד PRים כפולים במקום להשאיר #209/#211/#218/#219 פתוחים לנצח.
2. הבחירה לא לגעת ב־RLS #215/#127 נכונה.
3. עבודה ב־Draft PR נכונה כי ה־build עדיין לא ירוק.
4. רכיבים כמו `StudentAvatar.tsx` יכולים להיות מועילים אם משולבים בעדינות.
5. Skeleton loading יכול להיות מועיל אם אינו מוחק exports קיימים.
6. שיפור חיפוש תלמידים ועיצוב רשימת תלמידים הוא יעד נכון, בתנאי שהוא נשען על מקור הנתונים הקיים ולא מחליף את לוגיקת NRPS.

---

## מה לא בריא / מסוכן ב־PR #253

1. `useImports.tsx` נראה מוחלף בגרסה קטנה מדי, במקום לשמר את כל ה־hooks הקיימים.
2. סכנה למחיקת hooks מרכזיים:
   - `useImportsOverview`
   - `useImportedStudents`
   - `useGradesMatrix`
   - `postImport`
   - `useCourseStructure`
   - `useActivityOverview`
   - `useStudentReports`
   - `useTaskCompletionDetail`
   - `useDailyActivity`
   - `deleteImportBatch`
   - `usePracticeTime`
   - `useStudentProfile`
   - `useNrpsRoster`
3. `AppSidebar.tsx` עלול למחוק יכולות קיימות: שם המוצר `המודל החכם`, מצב session, course title, חיבור Moodle, ייבוא חכם, ייצוא, מה חסר, הגדרות, logout, וניווט שכבר הותאם.
4. שימוש ב־`useLTIContext` מסוכן אם hook כזה אינו קיים או אינו בנתיב הנכון.
5. `Students.tsx` עלול להחליף לוגיקת תלמידים שמבוססת NRPS/participants breakdown בלוגיקה כללית מדי.
6. `GradebookImport.tsx` עלול למחוק preflight/זיהוי עמודות/הגנות ציון חסר ≠ 0.
7. יחס שינוי גדול מדי: מחיקות רבות מול הוספות מעטות — סימן ל־replacement במקום integration.

---

## החלטת עבודה מחייבת

לא למזג את PR #253 כמו שהוא.

צריך להפוך אותו מ־replacement PR ל־preservation PR:

- לשמר main כבסיס אמת.
- לקחת מ־#253 רק רכיבים בטוחים.
- לא להחליף קבצים מרכזיים שלמים.
- לא למחוק hooks קיימים.
- לא לשנות נתיבי session/LTI בלי בדיקה.
- לא לשנות GradebookImport מעבר לתיקון build/typecheck מדויק.

---

## תוכנית תיקון מומלצת

### שלב 1 — להציל רק קבצים בטוחים

מותר לשקול שמירה/שילוב של:

- `StudentAvatar.tsx`
- תוספת Skeleton בלבד אם אינה שוברת exports קיימים.

### שלב 2 — לא להחליף קבצים מרכזיים

לא להחליף wholesale את:

- `src/hooks/useImports.tsx`
- `src/components/AppSidebar.tsx`
- `src/pages/Students.tsx`
- `src/pages/GradebookImport.tsx`

במקום זאת לבצע שינויים ממוקדים בלבד.

### שלב 3 — לתקן build של PR #253 אם ממשיכים איתו

בעיה ידועה: `useLTIContext` לא קיים/לא בנתיב נכון.

לפני תיקון import יש לבדוק האם יש hook קיים מתאים, למשל:

- `useLtiSession`
- `useMoodleSession`
- hook אחר שמחזיר teacher/course/session מתוך LTI.

לא ליצור hook מזויף רק כדי להשתיק build.

### שלב 4 — עדיף לפתוח PR חדש ונקי במקום לשקם PR ענק

שם מוצע:

`feat/safe-ui-consolidation-v1`

עקרון:

- מתחיל מ־main נקי.
- מוסיף רק רכיבים בטוחים.
- לא מוחק hooks.
- לא נוגע RLS/SQL/env/secrets/PR #127.
- Teacher Release נשאר NO.

---

## בדיקות חובה לפני מיזוג של כל UI consolidation

1. `npm run check`
2. `npm run build`
3. `npm run doctor`
4. `npm run typecheck`
5. כל audit קיים בריפו
6. בדיקה ידנית של הדפים:
   - dashboard
   - students
   - teachers
   - student profile
   - grades
   - smart import
   - export
   - missing
   - install-check
   - isolation-check

---

## אחוז מצב לאחר audit זה

התקדמות אמיתית של המוצר נשארת בערך 91%–93%.

PR #253 עצמו אינו מעלה אחוזים עד שיהיה ירוק ובטוח.

אם PR #253 יתוקן כ־safe integration, אפשר להעלות הערכה בכ־1%–2%.
אם ימוזג כפי שהוא, יש סיכון לרדת אחורה.

---

## הוראה לעוזרי AI עתידיים

לפני עבודה על PR #253 או על UI consolidation:

1. קרא מסמך זה.
2. קרא `RULES.md`.
3. קרא `src/App.tsx`, `src/components/AppSidebar.tsx`, `src/hooks/useImports.tsx`, `src/pages/Students.tsx`, `src/pages/GradebookImport.tsx` מ־main.
4. אל תחליף קובץ שלם אם אפשר לבצע patch נקודתי.
5. שמור את הקו של Claude/Profixy: אמת, ללא דמו, ללא ערבוב, ללא secrets.
