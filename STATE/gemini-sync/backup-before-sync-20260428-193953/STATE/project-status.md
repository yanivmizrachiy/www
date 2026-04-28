# Project Status — www / Moodle Teacher Hub

סטטוס אמת עדכני לריפו `yanivmizrachiy/www`.

---

## שם הריפו המחייב

```text
yanivmizrachiy/www
```

זהו הריפו שאליו יש להתייחס כמקור העבודה הנוכחי והיחיד לפרויקט Moodle Teacher Hub המשודרג.

---

## מה בוצע בפועל

- אותר הריפו `yanivmizrachiy/www`.
- נמצא README קיים המתאר Moodle Teacher Hub עם Node.js + Express, LTI 1.1, Dashboard בעברית, API בסיסי ו־data/store.json.
- נמצא `.gitignore` שמחריג `.env`, לוגים, backups, dist, coverage וקבצי מערכת.
- נוצר `PROJECT_RULES.md` כרובד כללים מרכזי ומחייב לריפו `www`.
- נוצרו מסמכי governance ותכנון עומק:
  - `docs/system-rules.md`
  - `docs/requirements.md`
  - `docs/repository-map.md`
  - `docs/import-contract.md`
  - `docs/lti-contract.md`
  - `docs/testing-plan.md`
  - `docs/legacy-moodle-teacher-hub-snapshot.md`
- נוצר תיעוד איחוד ריפואים:
  - `STATE/repo-consolidation.md`
- הריפו `yanivmizrachiy/moodle-teacher-hub` סומן כ־legacy בלבד.
- תועד שהדרישה הסופית כוללת מערכת Moodle מחוברת באמת, ללא דמו, עם SSO/LTI/API, דוחות, ייצוא ועריכה דו־כיוונית רק אם קיימות הרשאות Moodle אמיתיות.

---

## דרישות מוצר מחייבות שנקלטו

- הריפו חייב להיות נקי, מסודר וללא כפילויות.
- חובה דף כללים מעודכן תמיד.
- המערכת חייבת לעבוד ממחשבי חדר מחשב, מחשב אישי וטלפון נייד בלי בלבול state.
- אין דמו ואין מידע מומצא.
- כל מידע חייב להגיע מנתוני Moodle אמיתיים.
- כל הניווט בעברית.
- עמוד ראשי עם שם מורה ושם מרחב כאשר זמינים.
- גישה מהירה לתלמידים, משימות, פרקים, דוחות, פעילות/זמנים, הגדרות וייצוא.
- כניסה דרך Moodle / משרד החינוך ללא סיסמה נוספת כאשר SSO/LTI מוגדרים בפועל.
- סינון תלמיד, קבוצה, כיתה וטווח תאריכים כאשר הנתונים קיימים.
- הצגת משימות, ציונים, ניסיונות, ממוצעים ופעילות רק מנתוני אמת.
- זמן תרגול מצטבר יומי רק אם ניתן להוכחה ממקור Moodle או מחישוב לוגים מסומן היטב.
- משימות עם פרק/נושא, כמות שאלות אם קיימת, קישור ישיר אם מאומת.
- דוחות: ציונים, משימות, זמנים, פעילות ושילובים.
- ייצוא יעד: Excel, PDF, הדפסה ו־CSV כאשר קיים.
- עריכה דו־כיוונית מול Moodle רק עם token והרשאות כתיבה אמיתיות.

---

## סטטוס יכולות לפי אמת נוכחית

| יכולת | סטטוס |
|---|---|
| ריפו `www` קיים | verified |
| README קיים | verified |
| `.gitignore` חוסם `.env` | verified |
| `PROJECT_RULES.md` נוצר | verified |
| `docs/system-rules.md` נוצר | verified |
| `docs/requirements.md` נוצר | verified |
| `docs/repository-map.md` נוצר | verified |
| `docs/import-contract.md` נוצר | verified |
| `docs/lti-contract.md` נוצר | verified |
| `docs/testing-plan.md` נוצר | verified |
| LTI 1.1 מתואר ב־README | described, requires current code verification |
| Dashboard בעברית מתואר ב־README | described, requires current UI verification |
| API בסיסי מתואר ב־README | described, requires current endpoint verification |
| חיבור Moodle API חי | not verified |
| SSO משרד החינוך מלא | not verified |
| ייצוא Excel | planned / not verified |
| ייצוא PDF | planned / not verified |
| עריכה דו־כיוונית ב־Moodle | blocked until real token/write permission |
| Production-ready | not verified |

---

## מה אסור לטעון עדיין

אין לטעון שהמערכת production-ready.

אין לטעון שחיבור Moodle API חי עובד עד שתהיה הוכחה:

- token אמיתי.
- קריאת API אמיתית.
- תוצאה אמיתית מ־Moodle.
- תיעוד ב־evidence log.

אין לטעון ש־Excel/PDF עובדים אם קיימים רק CSV/הדפסה.

אין לטעון שעריכה מול Moodle עובדת בלי בדיקת כתיבה אמיתית.

---

## חסרים להמשך אימות

- מיפוי מלא של קבצי הריפו הנוכחי.
- audit פיזי מלא מול הריפו legacy.
- בדיקת `npm run check`.
- בדיקת `npm run dev`.
- בדיקת `/health`.
- בדיקת `/dev/login`.
- בדיקת `/lti/launch-1p1` עם launch אמיתי או payload בדיקה חוקי.
- בדיקת APIs.
- בדיקת Dashboard.
- בדיקת ייצוא.
- בדיקת שאין secrets בריפו.

---

## סטטוס כולל

```text
Repository governance: active
Canonical repo: yanivmizrachiy/www
Legacy repo status: marked legacy
Rules page: created
Product requirements: captured
Code verification: partial
Moodle API live connection: not verified
Production readiness: not verified
```
