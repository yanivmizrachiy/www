# CLAUDE.md

> קרא לפני כל פעולה בריפו זה.

## זהות הריפו

ריפו: `yanivmizrachiy/www`

הריפו מכיל שני מוצרים נפרדים סביב Moodle:

1. **Moodle Teacher Hub** — כלי מורה עברי RTL.
2. **Guide** — מצגת/מדריך Moodle סטטי למורים.

אסור לערבב ביניהם בקוד, runtime, נתונים או הוכחות.

## מקורות אמת

- `PROJECT_MEMORY.md` — החלטות חוצות־מוצר ודרישות Guide.
- `PROJECT_RULES.md` — אמת מוצר מפורטת של Moodle Teacher Hub.
- `RULES.md` — גבולות הריפו והפרדה ממערכות אחרות.
- `STATE/*` — ראיות/היסטוריה/מצב; אינו גובר על מקורות האמת לעיל.

אין ליצור מקור אמת מקביל נוסף.

## Runtime

- Teacher Hub: `https://www-tijc.onrender.com`
- Guide: `https://yanivmizrachiy.github.io/www/guide/`

Render אינו מפרסם ואינו מאמת את Guide.

Guide נבנה ונבדק דרך:
- `Guide Static Always-On`
- `Guide Live Smoke`

Teacher Release: **NO**

## Git

- הענף הקנוני: `main`.
- אין commit ישיר ל־`main`.
- עובדים ב־`feat/*`, `fix/*`, `chore/*` או `docs/*`.
- חובה PR לפני merge.
- אין מחיקת קבצים בלי גיבוי/אימות מתאים.

## אמת מוצר

- אין דמו.
- אין נתונים מזויפים.
- אין Placeholder שמוצג כאמיתי.
- אין PASS מזויף.
- Guide משתמש בצילומי Moodle אמיתיים בלבד.
- צילום חסר נשאר `needs-capture`.

## אבטחה

- אין secrets בקוד.
- secrets רק ב־GitHub Secrets / Render Environment.
- אין raw student data, raw Moodle exports או PII מיותר בריפו.

## לא לגעת בלי בעיה מוכחת והוראה מתאימה

- LTI launch flow
- Participants / Gradebook / Logs import
- Supabase migrations
- Teacher Release gate
- `render.yaml`

## לפני שינוי

1. fetch את `main`.
2. קרא מחדש את מקור האמת הרלוונטי.
3. בדוק שאין עבודה מקבילה שתידרס.
4. שנה מינימום נדרש.
5. הרץ את השערים המתאימים.
6. פתח PR.