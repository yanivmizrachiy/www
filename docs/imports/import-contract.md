# Import Contract — www / Moodle Teacher Hub

מסמך זה מגדיר איך מותר למערכת לקבל נתוני Moodle אמיתיים, איך לזהות אותם, ואיך להציג אותם בלי דמו ובלי המצאות.

---

## עיקרון בסיסי

ייבוא אינו דמו. ייבוא הוא הדרך הבטוחה לעבוד עם נתוני Moodle אמיתיים כאשר אין Moodle API token מאומת.

כל שורת נתונים שמוצגת במערכת חייבת להיות קשורה ל:

- קובץ Moodle אמיתי.
- טבלה שהועתקה מ־Moodle.
- API Moodle מאומת בעתיד.

---

## מקורות ייבוא מותרים

| מקור | סטטוס |
|---|---|
| Participants / Students export | מותר |
| Gradebook / Grades export | מותר |
| Activity completion report | מותר |
| Logs / יומנים | מותר |
| Activity report | מתוכנן / דורש parser אמיתי |
| Participation report | מתוכנן / דורש parser אמיתי |
| Quiz attempts | מתוכנן / דורש parser אמיתי |
| Assignment submissions | מתוכנן / דורש parser אמיתי |
| Course activity list | מותר רק אם ניתן לחלץ ממנו מבנה אמיתי |

---

## פורמטים מותרים

- XLSX
- CSV
- TSV/TXT
- הדבקת טבלה
- ODS רק אחרי אימות בפועל

---

## Provenance חובה

כל ייבוא חייב לשמור:

- source type
- file name אם קיים
- row count
- column mapping
- warnings
- imported at
- imported by / teacher context אם ידוע
- course context אם ידוע

---

## Missing data

אם נתון לא נמצא בקובץ, לא משלימים אותו לבד.

דוגמאות:

- אין מספר שאלות → מציגים `לא זמין בקובץ הזה`.
- אין זמן עבודה → מציגים `לא ניתן לחשב ללא לוגים`.
- אין קישור משימה → לא מציגים כפתור העתקת קישור.
- אין שם קבוצה → לא מאפשרים סינון קבוצה כאילו קיים.

---

## Normalized entities

יעדי נרמול:

- Student
- ActivityTask
- ChapterTopic
- GradeItem
- GradeResult
- ActivityLogEvent
- AttemptRecord
- DailyStudentActivitySummary
- ImportBatch
- ImportSource
- DataQualityIssue

אם entity לא קיימת בקוד, היא planned בלבד.

---

## בדיקות חובה לייבוא

לפני סימון parser כעובד:

1. טעינת קובץ אמיתי.
2. preview לפני כתיבה.
3. mapping ברור.
4. ספירת שורות.
5. טיפול בערכים חסרים.
6. empty state אם אין נתונים.
7. export שמכיל רק נתונים שיובאו.
8. תיעוד ב־STATE/evidence-log.md.

---

## איסורים

- אין להכניס קבצי Moodle עם תלמידים אמיתיים לריפו.
- אין לשמור exports פרטיים ב־GitHub.
- אין להציג parser כעובד בלי בדיקה.
- אין לשנות נתונים מיובאים בלי provenance.
