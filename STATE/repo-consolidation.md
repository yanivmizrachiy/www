# Repo Consolidation — Moodle Teacher Hub

> Historical record. Superseded on 2026-09-28 by `SSOT.md` and `docs/operations/MOODLE_REPOSITORY_UNIFICATION.md`.

## מצב סופי מאומת

- מקור האמת היחיד של Moodle Teacher Hub הוא `yanivmizrachiy/www`.
- הריפו הישן `yanivmizrachiy/moodle-teacher-hub` רוקן, אומת ונמחק ב־2026-09-28.
- snapshot מלא של הריפו הישן נשמר בתוך `www` בענף:
  `archive/legacy-moodle-teacher-hub-pre-unification-20260928`.
- snapshot של `www` לפני האיחוד נשמר בענף:
  `backup/pre-moodle-unification-2026-09-28`.
- לא נמצאה יכולת production ייחודית בריפו הישן שחסרה ב־`www`.
- המצגת אינה חלק מ־`www`; מקור האמת היחיד שלה הוא:
  `yanivmizrachiy/moodle-guide-presentation`.
- הנתיב ההיסטורי `/www/guide/` אינו מקור אמת ואינו יעד פיתוח; ענף הפרסום הישן נשמר עם snapshot והכניסה הישנה מפנה למצגת הקנונית.

## מה בוצע

1. בוצעה השוואה מלאה בין שני ריפואי Teacher Hub.
2. נשמרו גיבויים לפני כל מחיקה.
3. הוסר runtime/package/UI/workflow מה־legacy.
4. ה־legacy רוקן ולאחר אימות נמחק.
5. `www` נוקה ממוצרי חוץ ומקורות אמת כפולים.
6. מסמכי SSOT/governance יושרו למבנה הסופי.
7. workflows ישנים ושבורים הוסרו.
8. CI כולל guard שמכשיל build אם check/build משנים tracked source.
9. PRים ישנים וקונפליקטואליים נסגרו כדי שלא יחזירו מצב מיושן.

## כלל עבודה נוכחי

- Teacher Hub חדש: רק `yanivmizrachiy/www`.
- מצגת Moodle: רק `yanivmizrachiy/moodle-guide-presentation`.
- אין להחיות ריפו Teacher Hub נוסף.
- אין להחזיר Guide פעיל לתוך `www`.
- מסמך זה הוא ראיה היסטורית בלבד; במקרה של סתירה `SSOT.md` גובר.

## סטטוס

```text
Canonical Teacher Hub repo: yanivmizrachiy/www
Legacy Teacher Hub repo: deleted
Presentation repo: yanivmizrachiy/moodle-guide-presentation
Teacher Hub duplicate active repo: none
Presentation duplicate active repo: none
Historical recovery: preserved
```
