# CLAUDE.md

קרא לפני כל פעולה בריפו `yanivmizrachiy/www`.

## מקור אמת

מקור האמת העליון של הריפו הוא `README.md` בשורש.

אין להמציא מקור אמת חדש ואין להסתמך על מסמך היסטורי אם הוא סותר את `README.md`.

מפת המוצרים:

- Moodle Teacher Hub → `PROJECT_RULES.md`
- Guide Presentation → `PROJECT_MEMORY.md`
- August Experience → `august-experience/README.md`

שלושת המוצרים נפרדים. אין לערבב קוד, routes או החלטות מוצר ביניהם בלי סיבה מפורשת ומתועדת.

## Git

- אין commit ישיר ל־`main`.
- עבודה נעשית ב־branch ייעודי ו־PR לפני merge.
- אין למחוק יכולת פעילה בלי הוכחה שהיא הועברה או שאינה בשימוש.
- generated/backup/archive/history כפולים יש להסיר מהריפו הפעיל לאחר אימות.

## אמת ואבטחה

- אין demo/fake data כתחליף למקור אמיתי.
- אין secrets, `.env`, tokens, cookies או raw student PII בריפו.
- אין הודעות success שאינן מגובות בבדיקה אמיתית.
- Teacher Release נשאר `NO` לכל מוצר עד ששערי ה־release שלו עברו בפועל.

## Teacher Hub

Runtime קנוני ידוע: `https://www-tijc.onrender.com`.

אין לשנות LTI launch flow, imports, Supabase migrations, release gate או `render.yaml` בלי בעיה מוכחת והוראה מפורשת.

## August Experience

עבודה פעילה בענף `feat/august-experience-v1`.

V1 היא שכבת תצוגה קריאה בלבד מעל Moodle; אין איסוף credentials ואין כתיבה ל־Moodle. חוסר ודאות חייב להישאר fail-open ל־Moodle המקורי.

## שפה ו־UI

- קוד / comments / commits → אנגלית.
- README / תיעוד למשתמש → עברית כשמתאים.
- תאריך שמורה רואה ב־UI → `D/M/YY`.

## כלל ניקיון

אל תיצור `SESSION_HISTORY`, `AI_MEMORY`, `WORK_ORDER`, `BACKUP`, `OLD`, `COPY`, `ARCHIVE` או מסמך progress מקביל אם המידע יכול להיכנס למקור הקנוני או ל־Git/PR history.
