# RULES.md — גבולות `yanivmizrachiy/www`

עודכן: 2026-09-14

## סדר קדימות

1. `SSOT.md` — מקור האמת העליון של גבולות הריפו.
2. `PROJECT_RULES.md` — אמת המוצר של Moodle Teacher Hub.
3. `RULES.md` — כללי גבול ועבודה.
4. `PROJECT_MEMORY.md`, `STATE/**`, `docs/**` — ידע והיסטוריה בלבד כאשר יש סתירה.

## מוצר פעיל בריפו הזה

רק **Moodle Teacher Hub**.

`yanivmizrachiy/www` מיועד לכלי המורה, LTI, import, Supabase, Render, תלמידים, ציונים, לוגים ודוחות של Teacher Hub.

## המצגת אינה שייכת לריפו הזה

מקור האמת היחיד והבלעדי של מצגת ההדרכה של Moodle הוא:

`yanivmizrachiy/moodle-guide-presentation`

אסור לפתח כאן את המצגת, לשנות שקפים, screenshots, עיצוב, hotspots, CI או deployment שלה.

כל חומר Guide/Presentation שנותר כאן הוא legacy/היסטורי בלבד עד ניקוי מאומת. הוא אינו מקור אמת ואינו יעד עריכה.

## כללים מחייבים

- אין דמו או נתונים מומצאים.
- אין secrets בריפו.
- אין ערבוב בין Teacher Hub לבין המצגת.
- אין ליצור מקור שני למצגת.
- אין להחזיר runtime פעיל של המצגת מתוך `www`.
- אין למחוק חומר legacy בלי לוודא שאין בו מידע ייחודי שלא הועבר לריפו הקנוני.
- מערכות שאינן Teacher Hub אינן מפותחות כאן.

## חריג היסטורי

`luz-teddy/` אינו חלק מ-Teacher Hub. אין להרחיב אותו כאן ואין למחוק אותו בלי העברה ואימות נפרדים.

## כלל סופי

Teacher Hub: `yanivmizrachiy/www`.

מצגת Moodle: `yanivmizrachiy/moodle-guide-presentation`.

אין מקור אמת נוסף למצגת.
