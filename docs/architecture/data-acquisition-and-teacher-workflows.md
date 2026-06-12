# Data Acquisition and Teacher Workflows — www / Moodle Teacher Hub

מסמך זה מתכנן מראש איך Moodle Teacher Hub שואב/מקבל מידע אמיתי ממרחב Moodle של כל מורה, איך המורה רואה את המידע בצורה נוחה, ואיך נמנעות כפילויות בין קוד, דוחות, טבלאות ו־UI.

מקור אמת עליון: `PROJECT_RULES.md`.

---

## 1. עקרון בסיסי

המערכת נפתחת מתוך Moodle ומקבלת הקשר דרך LTI.

LTI מספק:

- מי המורה, אם Moodle שלח זאת.
- איזה מרחב/קורס נפתח.
- role / context.
- session token פנימי לאפליקציה.

LTI לא מספק לבדו את כל הנתונים הפדגוגיים.

הנתונים הפדגוגיים מגיעים באחד מהמסלולים הבאים:

1. ייבוא דוחות Moodle אמיתיים שהמורה יכול להוריד או להעתיק.
2. טבלאות Moodle אמיתיות שהמורה מדביק לתוך האפליקציה.
3. Moodle Web Services API עתידי בלבד, רק אם יהיה token מאומת.

אין נתוני דמו ואין השלמות מומצאות.

---

## 2. מסלולי שאיבת מידע מותרים

| מסלול | מצב | מה המורה עושה | מה האפליקציה עושה |
|---|---|---|---|
| LTI launch | חובה | פותח את הכלי מתוך מרחב Moodle | מזהה מרחב, מורה, role ו־session |
| Participants / Students export | פעיל/נדרש | מוריד או מדביק רשימת משתתפים | מנרמל תלמידים |
| Gradebook export | פעיל/נדרש | מוריד Excel/CSV של ציונים | בונה מטריצת ציונים ותאריכי עדכון אם קיימים |
| Activity completion report | פעיל/נדרש | מוריד או מדביק completion | בונה משימות, השלמות, שיוך לפרקים אם קיים |
| Logs / יומנים | פעיל/נדרש לזמנים | מוריד logs לפי טווח תאריכים | בונה פעילות יומית, first/last, חלונות תרגול |
| Activity report | מתוכנן | מוריד דוח פעילות אם קיים | מעשיר משימות/פרקים/פעילות |
| Participation report | מתוכנן | מוריד דוח השתתפות אם קיים | מעשיר פעילות לפי תלמיד/משימה |
| Quiz attempts | מתוכנן | מוריד attempts אם זמין | מעשיר ניסיונות ומשימות |
| Moodle API / WS | חסום כרגע | לא פעיל בלי token | Adapter עתידי בלבד |

---

## 3. מניעת כפילויות

אין לשמור את אותו מידע בכמה מודלים מקבילים.

כל המקורות נכנסים למודל מנורמל אחד:

- `Student`
- `ChapterTopic`
- `ActivityTask`
- `GradeItem`
- `GradeResult`
- `ActivityLogEvent`
- `AttemptRecord`
- `DailyStudentActivitySummary`
- `ImportBatch`
- `ImportSource`
- `DataQualityIssue`

כל מסך קורא דרך hooks/RPC/adapters בלבד, ולא ישירות מטבלאות raw.

המקור המותר לקוד frontend כרגע:

- `useLtiSession`
- `useImportsOverview`
- `useImportedStudents`
- `useGradesMatrix`
- `useCourseStructure`
- `useActivityOverview`
- `useDailyActivity`
- `usePracticeTime`
- `useStudentReports`
- `useTaskCompletionDetail`
- `useStudentProfile`

כל מקור מידע חדש חייב להיכנס ל־adapter/RPC קיים או להרחיב אותו בצורה מתועדת.

---

## 4. Workflow — משימות לפי פרקים

### מקור נתונים

מקורות אפשריים לפי עדיפות:

1. Activity completion report.
2. Course/activity list שהועתק מ־Moodle.
3. Activity report.
4. Moodle API עתידי: `core_course_get_contents`, רק אם token מאומת.

### מה המורה עושה

- נכנס למרחב Moodle.
- מוריד דוח Activity completion או מעתיק טבלת משימות/פעילויות.
- מייבא דרך `/import`.

### מה האפליקציה עושה

- מזהה שמות משימות.
- מזהה פרק/section אם קיים.
- אם אין פרק, משייכת ל־`ללא פרק` ולא ממציאה פרק.
- בונה מבנה היררכי: פרק → משימות.
- מציגה תפריטים נפתחים נוחים בעברית.
- משתמשת בצבעי premium דרך design tokens בלבד.
- מציגה completion אם קיים.
- מציגה קישור משימה רק אם קיים URL/id אמיתי.
- כפתור העתקת קישור מופיע רק אם הקישור אמיתי.

### UI מחייב

- Accordion / תפריטים נפתחים לפי פרקים.
- צבע פרק בולט ומובחן.
- סטטוס משימה: הושלם / לא הושלם / לא ידוע.
- סינון לפי פרק, סטטוס, תלמיד אם קיים.
- אין ספירת שאלות אם אין מקור נתונים אמיתי לספירה.

---

## 5. Workflow — ציונים לפי תאריכים ומשימות

### מקור נתונים

מקורות אפשריים:

1. Gradebook export.
2. Quiz/assignment report אם נשלח.
3. Moodle API עתידי בלבד אם token מאומת.

### מה המורה עושה

- מוריד Gradebook Excel/CSV מ־Moodle.
- מייבא דרך `/import`.
- אם יש דוח עם תאריכי הגשה/ניסיונות, מייבא גם אותו.

### מה האפליקציה עושה

- בונה GradeItems.
- בונה GradeResults.
- שומרת ערך חסר כ־missing, לא 0.
- מאפשרת סינון לפי תלמיד/כיתה/קבוצה אם המידע קיים.
- מאפשרת סינון לפי משימות.
- מאפשרת סינון לפי תאריכים רק אם התאריך קיים בדוח ציונים/attempts/logs.
- מייצאת Excel/XLSX רק כאשר נוצר קובץ אמיתי עם `xlsx` או מנגנון export מאומת.
- CSV מותר כבסיס, אבל אין להציג Excel/PDF כעובדים לפני בדיקה.

### UI מחייב

- טבלה נוחה בעברית.
- בחירת משימות מרובה.
- בחירת טווח תאריכים אם קיים שדה תאריך אמיתי.
- סימון `חסר` במקום 0 כשאין ציון.
- אפשרות export לקובץ רק ממה שמוצג/מסונן בפועל.

---

## 6. Workflow — זמני תרגול בכל יממה

### כלל אמת

אין להמציא זמן תרגול.

יש שני מצבים:

1. אם Moodle מספק משך רשמי — מציגים משך רשמי.
2. אם קיימים רק logs — מחשבים חלונות פעילות מתוך timestamps ומסמנים שזה חישוב מתוך לוגים, לא משך רשמי מוחלט.

### מקור נתונים

מקורות אפשריים:

- Logs / יומנים.
- Participation report.
- Activity report.
- Moodle API עתידי רק אם token מאומת.

### מה המורה עושה

- מוריד Logs מ־Moodle לפי טווח תאריכים.
- מייבא דרך `/import`.

### מה האפליקציה עושה

- משייכת אירועי log לתלמידים מיובאים בלבד.
- בונה פעילות לפי יום.
- מחשבת first event / last event.
- מחשבת active days.
- מחשבת session windows לפי gap מוגדר, למשל 30 דקות, רק כאשר יש מספיק timestamps.
- מציגה `לא ניתן לחשב ללא לוגים` אם אין logs.
- מציגה `חלון פעילות מחושב מלוגים` כאשר אין משך רשמי.

### UI מחייב

- טבלה לפי תלמיד ויום.
- סינון טווח תאריכים.
- סינון תלמיד.
- הצגת סך זמן יומי אם ניתן לחשב.
- הצגת first/last event.
- הצגת מספר אירועים.
- הסבר ברור על שיטת החישוב.

---

## 7. Workflow — דוחות וייצוא

### סוגי דוחות יעד

- דוח תלמידים.
- דוח משימות.
- דוח ימים/זמנים.
- דוח פערים.
- דוח ציונים.
- דוח מותאם אישית בהמשך.

### ייצוא

סדר מימוש:

1. CSV אמיתי.
2. XLSX אמיתי עם ספריית `xlsx`.
3. הדפסה מסודרת.
4. PDF רק אם קיימת הפקה אמיתית או Save as PDF מדפדפן שמוצהר כך.

כל export חייב לשמור רק נתונים אמיתיים שכבר נטענו/יובאו.

---

## 8. Empty states בעברית

כל מסך חייב להסביר מה חסר ומה המורה צריך לעשות.

דוגמאות:

- `עדיין לא יובאו תלמידים. יש לייבא דוח Participants או Gradebook מ־Moodle.`
- `לא ניתן להציג משימות לפי פרקים ללא Activity completion או דוח פעילות.`
- `לא ניתן להציג זמן תרגול רשמי ללא שדה duration מאומת; Logs רגילים מאפשרים רק ראיות פעילות או הערכת חלונות פעילות מסומנת.`
- `לא נמצא תאריך בדוח הזה. ייבא דוח ניסיונות/Logs כדי לסנן לפי תאריכים.`
- `קישור משימה לא זמין בקובץ הזה.`

---

## 9. מה כבר מתוכנן/קיים בריפו

קיים בתיעוד:

- כלל מקור אמת ב־`PROJECT_RULES.md`.
- דרישת LTI / Manual Import.
- איסור דמו ונתונים מומצאים.
- דרישות עמוד ראשי.
- דרישות תלמידים, משימות, פרקים, דוחות, ייצוא וזמנים.
- חוזה ייבוא ב־`docs/import-contract.md`.
- תוכנית עבודה ב־`docs/work-plan.md`.

קיים בקוד:

- routes לכל המסכים המרכזיים.
- hooks ל־overview, students, grades, course structure, activity, daily activity, practice time, reports, student profile.
- Supabase client/types.
- LTI session hook.

לא מאומת עדיין:

- build מלא.
- parser מלא לכל סוגי הדוחות.
- Supabase functions/migrations מלאים.
- ייבוא end-to-end עם קובץ אמיתי.
- LTI end-to-end מתוך Moodle אמיתי.
- XLSX/PDF export.

---

## 10. סדר פיתוח מומלץ

1. לתקן build.
2. לוודא שכל route נטען.
3. להשלים Import Wizard אמיתי.
4. לממש parser ל־Participants.
5. לממש parser ל־Gradebook.
6. לממש parser ל־Activity completion.
7. לממש parser ל־Logs.
8. לממש Tasks by Chapters UI.
9. לממש Grades filtering/export.
10. לממש Practice Time UI.
11. לממש Reports/Export.
12. לבדוק עם דוחות אנונימיים אמיתיים.
13. לבדוק LTI במרחב של יניב.
14. להכין קישור התקנה לכל מורה.

---

## 11. חסרים להמשך

דרוש מהמשתמש, בלי להכניס secrets לריפו:

- צילום/טקסט נקי של דוחות Moodle שמורים מקבלים בפועל.
- דוגמת Participants אנונימית.
- דוגמת Gradebook אנונימית.
- דוגמת Activity completion אנונימית.
- דוגמת Logs אנונימית.
- Tool URL מדויק.
- Consumer Key מדויק.
- Shared Secret רק בסביבת deploy, לא בצ׳אט ולא בריפו.
