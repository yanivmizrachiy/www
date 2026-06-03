# CURRENT AI SOURCE OF TRUTH — Moodle Teacher Hub / המודל החכם

Updated: 20260603-181927  
Repo: yanivmizrachiy/www  
Product: Moodle Teacher Hub / המודל החכם

## זהות המוצר

האתר הוא כלי מורה אמיתי בעברית RTL שנפתח מתוך Moodle דרך LTI 1.3, ומציג נתונים אמיתיים של המרחב הנוכחי בלבד.

הוא אינו דמו, אינו יומן, אינו SmartCalendar, ואינו פורטל כללי.

## עקרונות ברזל

1. אין דמו.
2. אין נתונים מומצאים.
3. אין ערבוב בין מורים, קורסים, מרחבים או תלמידים.
4. אין חשיפת secrets, tokens, JWT, private keys, .env, מיילים פרטיים או מידע תלמידים בריפו/לוגים.
5. Teacher Release נשאר NO עד אימות חי מלא.
6. PR #127 לא נוגע ולא ממוזג בלי החלטה מפורשת.
7. לא מריצים SQL production / RLS אמיתי בלי אישור מפורש.
8. fallback ידני נשמר.
9. כל PR צריך להיות קטן, ממוקד, בדוק, ולא להרוס עבודה קיימת של Claude/Profixy.

## מצב PR #253

PR #253 הוא Draft PR לא ממוזג.

הוא קידם רעיונית: איחוד PRים כפולים ושיפור UI.

אבל הוא מסוכן למיזוג כפי שהוא, כי נראה שהוא מחליף קבצים מרכזיים במקום לשלב תוספות בזהירות.

החלטה: לא למזג את #253 כמו שהוא.

## מה מותר להציל מ־#253

- StudentAvatar אם הוא רכיב עצמאי ולא שובר כלום.
- Skeleton אם הוא לא מוחק exports קיימים.
- שיפור UI נקודתי בלבד.

## מה אסור לעשות

- לא להחליף wholesale את useImports.tsx.
- לא למחוק hooks קיימים.
- לא להחליף wholesale את Students.tsx.
- לא להחליף wholesale את AppSidebar.tsx.
- לא להחליף wholesale את GradebookImport.tsx.
- לא ליצור hook מזויף רק כדי להשתיק build.
- לא להחזיר את שם המוצר ל־Moodle Teacher Hub במקום המודל החכם.

## סדר המשך מומלץ

1. Audit מלא ל־PR #253.
2. לפתוח PR חדש ונקי מ־main בשם feat/safe-ui-consolidation-v1.
3. להציל רק רכיבים בטוחים.
4. לתקן typecheck/build בלי למחוק לוגיקה קיימת.
5. לבדוק dashboard/students/teachers/profile/grades/import/export/missing/install-check/isolation-check.
6. רק אחר כך בדיקה חיה מתוך Moodle.
