# CLAUDE.md
> קרא לפני כל פעולה בריפו זה.

## זהות הריפו
- ריפו: `yanivmizrachiy/www`
- מוצר פעיל יחיד: **Moodle Teacher Hub** — כלי מורה עברי RTL מתוך Moodle.
- המצגת/Guide אינה חלק מהריפו הזה.
- מקור האמת היחיד למצגת: `yanivmizrachiy/moodle-guide-presentation`.
- כתובת המצגת הפעילה: `https://yanivmizrachiy.github.io/moodle-guide-presentation/`.

## מקור אמת וסדר קדימות
1. `SSOT.md` — הגבול המחייב והעדכני ביותר של הריפו.
2. `PROJECT_RULES.md` — אמת מפורטת של Moodle Teacher Hub.
3. `RULES.md` — גבולות ריפו, פרטיות וכללי עבודה.
4. `PROJECT_MEMORY.md`, `STATE/**`, `docs/**` — ידע, ראיות והיסטוריה בלבד; הם אינם רשאים להפוך את המצגת שוב לחלק פעיל מ־`www`.

## גבול המצגת — חובה
- אין ליצור או לערוך כאן `guideDeck`, Guide UI, סדר שקפים, תוכן שקפים, hotspots, screenshots, assets, עיצוב, tests, CI או deployment של המצגת.
- כל בקשה לשינוי המצגת חייבת לעבור לריפו `yanivmizrachiy/moodle-guide-presentation`.
- אין ליצור מקור שני למצגת בתוך `www`.

## Runtime קנוני
- Teacher Hub: `https://www-tijc.onrender.com` — Render.
- Teacher Release: **NO** עד מעבר כל השערים.

## שפה
- קוד / comments / commits → אנגלית.
- תשובות / README / תיעוד → עברית.
- תאריך ב-UI של Teacher Hub: `D/M/YY`.

## Git
- לפני כתיבה יש לקרוא מחדש את HEAD העדכני כדי לא לדרוס שינוי מקביל.
- אין מחיקת קבצים בלי אישור מפורש.

## אבטחה ואמת
- אין secrets בקוד לעולם; secrets רק דרך GitHub Secrets / Render Environment.
- אין דמו, נתונים מזויפים, כפתורים מזויפים או PASS מזויף.
- נתוני Teacher Hub חייבים להגיע ממקורות Moodle אמיתיים ומאומתים.

## לא לגעת בלי הוראה מפורשת
- LTI launch flow.
- Participants / Gradebook / Logs import.
- Supabase migrations.
- Teacher Release gate.
- deploy / `render.yaml`.

## הפעלת Claude אוטומטית
כתוב `@claude` בכל Issue או PR comment.
