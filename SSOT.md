# SSOT — Moodle Teacher Hub

זהו **מקור האמת היחיד והמחייב של Moodle Teacher Hub**.

## תחום הריפו

`yanivmizrachiy/www` עוסק במערכת Moodle Teacher Hub בלבד: כלי המורה, LTI, נתוני Moodle אמיתיים, Render, Supabase, import, תלמידים, ציונים, לוגים ודוחות.

## גבול מוחלט: מצגת Moodle

המצגת/Guide למורים **אינה נערכת, מפותחת, נבדקת או מפורסמת מתוך הריפו הזה יותר**.

מקור האמת היחיד והבלעדי של המצגת הוא:

`yanivmizrachiy/moodle-guide-presentation`

כל שינוי עתידי במצגת — תוכן, סדר שקפים, screenshots, hotspots, עיצוב, קוד, בדיקות, CI ופרסום — מתבצע רק בריפו הזה.

כל קובץ Guide/Presentation שנותר בתוך `www` הוא חומר legacy/היסטורי בלבד עד ניקוי מאומת. הוא אינו מקור אמת, אינו יעד עריכה ואינו רשאי להפוך למקור פעיל מחדש.

אין ליצור או לתחזק בתוך `www`:
- deck נוסף למצגת.
- עותק פעיל של תוכן המצגת.
- screenshots חדשים של המצגת.
- workflow קנוני של המצגת.
- runtime פעיל נוסף של המצגת.

## סדר קדימות

1. `SSOT.md` — גבול המוצר המחייב והעדכני ביותר.
2. `PROJECT_RULES.md` — כללי Teacher Hub.
3. `RULES.md` — כללי ריפו/פרטיות.
4. `PROJECT_MEMORY.md`, `STATE/**`, `docs/**` — ידע, ראיות והיסטוריה; אם הם מציגים את ה-Guide כמוצר פעיל בריפו הזה, החלק הזה מיושן וגובר עליו `SSOT.md`.

## Runtime קנוני

Teacher Hub: `https://www-tijc.onrender.com`

## כלל מוחלט

יש רק ריפו פעיל אחד למצגת Moodle: `yanivmizrachiy/moodle-guide-presentation`.

אין ליצור או לתחזק מקור שני למצגת בתוך `www`.


## איחוד הריפואים — 2026-09-28

- `yanivmizrachiy/www` הוא **מקור האמת היחיד והפעיל** של Moodle Teacher Hub.
- snapshot מלא של `www` לפני הניקוי נשמר ב-`backup/pre-moodle-unification-2026-09-28`.
- מסמך המיפוי: `docs/operations/MOODLE_REPOSITORY_UNIFICATION.md`.


## מצב סופי של ריפואי Moodle

- Teacher Hub פעיל וקנוני: `yanivmizrachiy/www`
- מצגת/Guide נפרדת: `yanivmizrachiy/moodle-guide-presentation`
- אין מוצר פעיל נוסף של Teacher Hub.
- `www` מכיל Moodle Teacher Hub בלבד; קוד ומסמכים של מוצרים אחרים אינם נשמרים כאן.
