> **SUPERSEDED / ARCHIVED** — 2026-05-27. This document is kept for historical reference only. The canonical source of truth is `PROJECT_RULES.md` in `yanivmizrachiy/www`.

# Legacy Snapshot — yanivmizrachiy/moodle-teacher-hub

מסמך זה שומר את החומר החשוב מהריפו הישן `yanivmizrachiy/moodle-teacher-hub`, כדי שהידע לא ילך לאיבוד אחרי איחוד מקור האמת אל `yanivmizrachiy/www`.

הריפו הישן אינו מקור האמת המחייב. מקור האמת המחייב הוא:

```text
yanivmizrachiy/www
```

---

## חומר חשוב שנשמר מה־README הישן

- מוצר מורה בעברית RTL עבור נתוני Moodle אמיתיים.
- מצב אסטרטגי קודם: Manual Real-Data Mode Without API Token.
- אין Moodle Web Services API token / Security Key / API key מאומת.
- אין משיכת נתונים אוטומטית מ־Moodle בלי token.
- אין בקשת שם משתמש/סיסמה של Moodle.
- אין נתוני דמו.
- הנתונים שמוצגים חייבים להגיע מנתוני Moodle אמיתיים שהמורה סיפק ידנית.

---

## מקורות ייבוא שתועדו בריפו הישן

- Excel/XLSX שהורד מ־Moodle.
- CSV.
- ODS אם הדפדפן מצליח לקרוא אותו בפועל.
- TXT/TSV.
- טבלה שהועתקה מתוך דוח Moodle והודבקה לממשק.

---

## יכולות שתועדו בריפו הישן

- שרת Express בסיסי.
- מסלול LTI 1.1 לפתיחת הכלי מתוך Moodle.
- לכידת הקשר כניסה מ־LTI כאשר Moodle מספק אותו.
- דשבורד עברי RTL.
- אשף ייבוא בשם `ייבוא נתוני Moodle אמיתיים`.
- ייבוא מקומי בצד הדפדפן דרך `ManualImportAdapter`.
- שמירה מקומית בדפדפן ב־localStorage.
- תצוגה מקדימה לפני ייבוא.
- מיפוי עמודות ידני לאחר זיהוי ראשוני.
- מסכי תלמידים, משימות, פרקים, ציונים, פעילות/זמן, דוחות, ייצוא ומקורות נתונים.
- ייצוא CSV לציונים ולפעילות.
- הדפסה / שמירה כ־PDF דרך הדפדפן.

כל היכולות האלה מסומנות כאן כידע שנשמר מהריפו הישן. הן עדיין דורשות אימות בקוד הנוכחי של `www` לפני סימון Done.

---

## סוגי דוחות שתועדו בריפו הישן

- Gradebook / Grade export.
- Logs / יומנים.
- Activity Completion.
- Activity Report.
- Participation Report.
- Quiz attempts / grades.
- Assignment submissions / grades.
- Course page / activity list שהועתק מ־Moodle.

---

## כללי אמת שנשמרו מהריפו הישן

- אין נתוני דמו.
- אין תלמידים מזויפים.
- אין משימות מזויפות.
- אין ציונים מזויפים.
- אין פעילות או זמן מזויפים.
- חוסר ציון נשאר חוסר ציון, לא אפס.
- מספר שאלות מוצג רק אם קיים בדוח שיובא.
- משך עבודה מדויק מוצג רק אם קיים שדה משך רשמי.
- אם יש רק חותמות זמן, מוצג חלון פעילות מחושב ולא משך רשמי.

---

## דברים שתועדו כלא קיימים / לא מאומתים בריפו הישן

- אין סנכרון Moodle API חי.
- אין משיכת ציונים/יומנים אוטומטית מ־Moodle.
- אין MoodleWsAdapter פעיל כי אין token.
- אין מסד נתונים שרת קבוע לייבוא הידני; הייבוא תועד כשמור מקומית בדפדפן.
- אין אימות production מלא ל־LTI.
- אין בדיקות אוטומטיות מקיפות לקבצי Moodle גדולים.

---

## כיוון ארכיטקטורה שנשמר

הארכיטקטורה צריכה לתמוך בשני adapters:

1. `ManualImportAdapter` — מצב פעיל כאשר אין token.
2. `MoodleWsAdapter` — עתידי בלבד, אם יתקבל token אמיתי ומאומת.

שני ה־adapters צריכים להזין אותו מודל נתונים מנורמל ואותם מסכי UI.

---

## החלטת איחוד

הידע מהריפו `moodle-teacher-hub` נשמר בתוך `www` לצורך המשכיות.

אין לבצע עבודה חדשה בריפו הישן אלא אם המשתמש מבקש במפורש. כל פיתוח, תיעוד ובדיקות ממשיכים ב־`yanivmizrachiy/www` בלבד.
