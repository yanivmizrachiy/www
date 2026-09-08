# yanivmizrachiy/www — Moodle Workspace

עודכן: 2026-09-08

זהו הריפו המרכזי לכל העבודה שקשורה ישירות ל־Moodle של משרד החינוך.

## מקור אמת יחיד

הקובץ הזה הוא **אינדקס מקור האמת היחיד של הריפו**.

הוא קובע:

- אילו מוצרים שייכים לריפו;
- מה הגבולות ביניהם;
- איזה מסמך קנוני מותר לעדכן לכל מוצר;
- מה נחשב היסטוריה/תיעוד תפעולי ולא מקור אמת.

אם מסמך אחר סותר את המפה כאן — הקובץ הזה קובע.

## שלושת המוצרים

### 1. Moodle Teacher Hub

כלי מורה נפרד שנפתח מתוך Moodle דרך LTI ומציג/מעבד נתוני Moodle אמיתיים.

מקור האמת הטכני והמוצרי:

`PROJECT_RULES.md`

מצב release נוכחי: **Teacher Release = NO** עד שכל שערי האימות של Teacher Hub יעברו.

Runtime קנוני הידוע:

`https://www-tijc.onrender.com`

### 2. Guide Presentation

מצגת/מדריך אינטראקטיבי למורים על Moodle, המבוסס על צילומי מסך אמיתיים מהמערכת.

מקור הזיכרון הקנוני:

`PROJECT_MEMORY.md`

נכסי המצגת והתיעוד שלה נמצאים תחת `public/guide/`, `src/data/guideDeckSource.ts` ו־`docs/` הרלוונטיים.

### 3. August Experience / המודל של אוגוסט

שכבת חוויית־מורה מעל מרחב Moodle הקיים: אותו קורס, אותם נתונים, אותה הרשאה ואותה מערכת מקור — אבל UI וזרימת עבודה חדשים למורה.

מקור האמת היחיד של August:

`august-experience/README.md`

ענף העבודה הפעיל:

`feat/august-experience-v1`

גרסה נוכחית של ההרחבה בענף זה: `0.5.0`.

Teacher Release: **NO** עד אימות מול Moodle אמיתי, מורה/תלמיד, תאימות דפדפנים, נגישות ו־pilot.

## הפרדה מחייבת

אסור לערבב בין שלושת המוצרים:

- Guide Presentation אינה Teacher Hub.
- Teacher Hub אינו August Experience.
- August Experience אינו המצגת ואינו LTI Hub.

שיתוף ידע/תשתית אפשרי רק כאשר הוא מפורש, מודולרי ואינו יוצר תלות סמויה בין המוצרים.

## מבנה קנוני

```text
www/
├── README.md                    # אינדקס מקור האמת היחיד של הריפו
├── RULES.md                     # מדיניות ריפו בלבד
├── PROJECT_RULES.md             # מקור אמת של Teacher Hub
├── PROJECT_MEMORY.md            # מקור אמת של Guide Presentation
├── august-experience/
│   ├── README.md                # מקור אמת יחיד של August
│   ├── docs/                    # הוראות ביצוע בלבד
│   ├── extension/               # קוד ההרחבה הפעיל
│   └── tests/                   # חוזי/fixtures בדיקה בלבד
├── src/                         # Teacher Hub / Guide code לפי המבנה הקיים
├── public/                      # נכסים פעילים בלבד
├── docs/                        # חוזים ותיעוד טכני שימושי
└── STATE/                       # evidence/audits של Teacher Hub בלבד, לא מקור מוצר מקביל
```

## מדיניות ניקיון

נשאר בריפו רק מה שמועיל לפיתוח, הפעלה, בדיקה, evidence או תחזוקה של אחד משלושת מוצרי Moodle.

יש להסיר כאשר מוכח שהם מיותרים:

- generated/build artifacts שניתן לשחזר;
- backup/temp/copy files;
- מסמכי vision/status/architecture כפולים;
- קבצים שהוחלפו במקור קנוני חדש;
- archives שאין להם שימוש פעיל;
- raw exports או PII;
- קוד מת שאין אליו reference ואין לו ערך תשתיתי.

אין למחוק יכולת פעילה או ידע ייחודי רק כדי להקטין את מספר הקבצים.

## חריג ידוע

`luz-teddy/` אינה מוצר Moodle. היא נשארת זמנית בלבד עד העברה מאומתת לריפו נפרד. אין להרחיב אותה כאן ואין למחוק אותה לפני שהחלופה עובדת בפועל.

## כללי אמת ובטיחות

- אין fake/demo data כתחליף למקור אמיתי.
- אין secrets בריפו.
- אין raw student PII בריפו.
- אין איסוף סיסמאות משרד החינוך.
- אין הכרזת production/Teacher Release בלי evidence אמיתי.
- שינויי Moodle משמעותיים נעשים ב־branch/PR ולא ישירות ב־`main`.

## איפה לעדכן

שינוי גבול ריפו או מפת מוצרים → `README.md` הזה.

שינוי Teacher Hub → `PROJECT_RULES.md`.

שינוי Guide Presentation → `PROJECT_MEMORY.md`.

שינוי August Experience → `august-experience/README.md`.

אין ליצור מסמך מקור אמת נוסף.
