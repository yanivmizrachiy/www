# התקדמות — המודל של אוגוסט

תאריך: 2026-08-23

## החלטת מוצר

נוצר כיוון מוצר חדש ונפרד בשם **המודל של אוגוסט**.

היעד: מורה נכנס למרחב Moodle הרגיל של משרד החינוך, עם ההזדהות הרגילה ובאותו מקור מידע, אך שכבת התצוגה למורה יכולה להשתנות לפי design system, navigation, buttons, tables ו־UX שיוגדרו בפרויקט.

## כלל שימור

לא בוצעה מחיקה ולא בוצע reset של Moodle Teacher Hub.

כל הידע והיכולות הקיימים נשמרים לשימוש חוזר, ובמיוחד:

- LTI 1.0/1.1 ו־LTI 1.3.
- NRPS/AGS work.
- Participants / Gradebook / Logs / Course Structure imports.
- Smart Import.
- Supabase persistence.
- teacher/course/session scoping.
- reports.
- capability detection.
- evidence/truth gates.
- UI components ומיפויי Moodle.

## ארכיטקטורה ראשונית

שלוש שכבות:

1. Moodle — מערכת מקור, הרשאות, נתונים ופעולות.
2. Existing WWW Engine — מנוע context/data/imports/reports/persistence.
3. August Experience Layer — שכבת UI חדשה שמופעלת מעל Moodle באמצעות Browser Extension/Content Layer, או בעתיד באמצעות Moodle Theme/Plugin אם תתקבל הרשאה רשמית.

## מה בוצע היום

- נוצר ענף: `august-moodle-model-20260823`.
- נוצר `PROJECT_MEMORY_AUGUST_2026.md` עם הגדרת המוצר והארכיטקטורה.
- `RULES.md` עודכן כדי להכיר במודל של אוגוסט כמוצר Moodle נפרד ולהגן במפורש על כל העבודה הקיימת.
- לא בוצע שינוי בקוד הפעיל, ב־LTI, ב־Supabase, ב־imports או ב־deployment.
- Teacher Release לא שונה.

## הצעד הטכני הבא

Proof of Same Space בסביבה מורשית:

- להישאר ב־course URL אמיתי של Moodle.
- לזהות את דף הקורס.
- להפעיל שכבת UI ניתנת לכיבוי.
- להציג navigation חדש.
- לחבר לפחות פעולה אמיתית אחת.
- להציג לפחות נתון אמיתי אחד.
- לא לשנות נתונים ולא לשבור את ה־Teacher Hub הקיים.

## סטטוס

```text
Product definition: RECORDED
Existing work preservation: REQUIRED
Active production code changed: NO
Teacher Release changed: NO
Same-space prototype verified: NOT YET
```
