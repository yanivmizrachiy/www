# STATE — evidence and historical snapshots

`STATE/` הוא אזור ראיות, snapshots והיסטוריה. הוא **אינו מקור אמת מתחרה**.

## איך קוראים STATE

- קובץ עם תאריך בשם מתאר מה היה ידוע או נבדק באותו מועד בלבד.
- `STATE/project-status.md`, קבצי readiness/progress וקבצי audit ישנים עשויים להכיל משפטים שהיו "current" בזמן כתיבתם אך אינם current כיום.
- `STATE/CURRENT.md` הוא אינדקס מצב תמציתי ונוח, אך גם הוא כפוף למקור האמת הקנוני.
- ראיה היסטורית נשארת ראיה גם אם המסקנה התפעולית השתנתה; לא משכתבים אותה כדי שתיראה חדשה.

## היררכיית אמת

1. `../PROJECT_MEMORY.md` — מקור האמת הקנוני ברמת הריפו, כולל הפרדת Guide ו-Teacher Hub וה-runtimes שלהם.
2. `../PROJECT_RULES.md` — אמת מפורטת של Teacher Hub בלבד, בכפוף ל-`PROJECT_MEMORY.md`.
3. `../RULES.md` — גבולות הריפו וכללי פרטיות/עבודה, בכפוף לשני הקבצים לעיל.
4. `STATE/**` — evidence, verification records ו-snapshots.
5. `../README.md` ו-`../docs/**` — ניווט, הסבר, חוזים ו-runbooks; אינם גוברים על מקור האמת.

## Runtime split

- Teacher Hub: `https://www-tijc.onrender.com` — Render.
- Guide: `https://yanivmizrachiy.github.io/www/guide/` — GitHub Pages.
- Render אינו מפרסם ואינו מאמת את Guide.

## כללי ראיות

- אין להכניס raw student rows, raw grade rows, raw Moodle logs, Moodle exports, secrets, tokens, cookies או private runtime payloads.
- aggregate counts וראיות sanitized מותרות כאשר אינן חושפות PII.
- PASS הקשור ל-commit/runtime/date מסוים מוכיח רק את ההקשר הזה; אין למחזר אותו כ-proof ל-HEAD מאוחר יותר בלי אימות חדש.
- כאשר capability משתנה, מעדכנים את מקור האמת ומוסיפים evidence חדש; לא מוחקים את הראיה הישנה.

## קבצים היסטוריים

מסמכים היסטוריים נשמרים לצורך traceability. עצם הופעת branch, runtime או "next step" ישנים בתוכם אינה הופכת אותם שוב לפעילים. כל consumer חייב לבדוק את התאריך ואת `PROJECT_MEMORY.md` לפני פעולה.
