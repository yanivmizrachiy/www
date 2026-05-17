<!-- MTH_CURRENT_VERIFIED_STATE_20260512_START -->
## מצב אמת מאומת — 2026-05-12

- ריפו: `yanivmizrachiy/www`.
- ענף קנוני: `main`.
- Runtime קבוע: `https://www-tijc.onrender.com`.
- Teacher release: **NO**.

עובד ומאומת:
- Automation Core V1 מוזג ל־`main`.
- `/api/release/readiness` עובד ב־Live.
- `/api/persistence/validate` עובד ב־Live.
- Supabase production persistence אומת.
- אין החזרת סודות.
- אין החזרת שורות תלמידים.

עדיין לא מאומת:
- Launch אמיתי מתוך Moodle אחרי השינויים האחרונים.
- Import מלא אמיתי.
- בדיקת שני מורים/שני מרחבים.
- אי־ערבוב נתונים.

כלי חכמים:
בכל שלב יש לבדוק כלים שיכולים לעזור באמת: GitHub, Render, Supabase, Moodle, CI, UX, RTL, דוחות וייצוא. אין להתקין כלי שלא מקדם עבודה אמיתית.
<!-- MTH_CURRENT_VERIFIED_STATE_20260512_END -->

# PROJECT_RULES — www / Moodle Teacher Hub

<!-- MTH_CURRENT_VERIFIED_STATE_20260510_START -->
## מצב אמת מאומת — 2026-05-10

הפרויקט אינו מתחיל מאפס. זהו ריפו קיים וחי, ויש להמשיך ממנו בלבד.

### מה כבר עובד ומאומת

- ריפו פעיל: `yanivmizrachiy/www`.
- ענף עבודה פעיל: `gemini/ai-studio-sync-20260428-193953`.
- Runtime קבוע: `https://www-tijc.onrender.com`.
- LTI 1.3 עובד מתוך Moodle.
- NRPS עובד ומחזיר משתתפים אמיתיים מהקורס.
- NRPS החזיר 62 משתתפים: 59 Learners ו־3 Instructors.
- NRPS מחזיר מזהים ותפקידים, אך לא שמות ולא מיילים.
- ייבוא Participants אמיתי ממודל הצליח.
- הייבוא קלט 62 שורות, הוסיף 62, עדכן 0 ודחה 0.
- עמוד תלמידים מציג תלמידים אמיתיים עם שמות ומיילים שיובאו מ־Participants.
- נתיב Moodle Web Services קיים כאבחון עתידי, אך תלוי ב־`MOODLE_WS_TOKEN` אמיתי ב־Render.

### גבולות בטיחות

- אין להעלות לגיט קבצי תלמידים, CSV/XLSX/ODS, גיבויי JSON, או `data/store.json`.
- אין להריץ Deploy/Restart לפני גיבוי מקומי או persistence אמיתי.
- אין להמשיך לציונים/לוגים/דוחות לפני סידור persistence ומיפוי תלמידים.

### סדר המשך מחייב

1. גיבוי מקומי בטוח של הנתונים שיובאו.
2. סידור ריפו ומקור אמת.
3. persistence קבוע, כנראה Supabase.
4. מיפוי NRPS ↔ Participants.
5. Gradebook / ציונים.
6. Logs / זמן תרגול.
7. דוחות וייצוא.

Updated: 2026-05-10T05:10:58Z
<!-- MTH_CURRENT_VERIFIED_STATE_20260510_END -->

מסמך זה הוא מקור האמת העליון של הריפו `yanivmizrachiy/www`.

הריפו הזה הוא הריפו המחייב לפרויקט Moodle Teacher Hub המשודרג. כל תיעוד, קוד, בדיקה, החלטה או שינוי עתידי חייבים להתיישר מול המסמך הזה.

אם קיימת סתירה בין README, docs, קוד, STATE או הודעות קודמות — המסמך הזה קובע עד שיעודכן במפורש ובצורה מנומקת.

---

## 1. שם הריפו המחייב

שם הריפו הרשמי:

```text
yanivmizrachiy/www
```

אין להתייחס לריפו אחר כמקור אמת של הפרויקט הזה, אלא אם המשתמש נותן הוראה מפורשת להעברת מקור האמת.

---

## 2. מטרת המערכת

Moodle Teacher Hub הוא אתר/כלי מורה בעברית מלאה וב־RTL, שנפתח מתוך Moodle ומטרתו להציג למורה את נתוני מרחב הלמידה שלו בצורה נוחה, מהירה, גרפית ומסודרת.

המערכת אינה מחליפה את Moodle. היא שכבת נוחות, ארגון, סינון, דוחות וייצוא מעל נתוני Moodle אמיתיים.

המערכת נבנית תחילה ונבדקת קודם במרחב Moodle האישי/הלימודי של יניב, אבל היעד הסופי הוא קישור התקנה/פתיחה שכל מורה יוכל להוסיף לכל מרחב לימודי שלו ב־Moodle, כך שכל מורה יראה רק את הנתונים האמיתיים של המרחב שלו.

---

## 3. כלל אמת עליון

אסור ליצור או להציג:

- נתוני דמו.
- תלמידים מזויפים.
- ציונים מזויפים.
- משימות מזויפות.
- פעילות מזויפת.
- זמן תרגול מומצא.
- כפתורים שאינם עובדים באמת.
- טקסט שמרמז על חיבור Moodle חי אם אין חיבור מאומת.

כל נתון במערכת חייב להגיע ממקור אמיתי:

1. Moodle Web Services / API מאומת, אם וכאשר קיים token אמיתי.
2. LTI launch אמיתי לצורך כניסה והקשר.
3. ייבוא ידני של דוחות Moodle אמיתיים, אם אין API זמין.
4. שאיבה אוטומטית מקסימלית מהממשק/המרחב רק באמצעים חוקיים, יציבים ומאומתים, ללא scraping של סיסמאות וללא התחזות לחיבור API שלא קיים.

---

## 4. מצב API / SSO / שאיבת מידע מקסימלית

הדרישה המוצרית הסופית היא חיבור חכם דרך Moodle / משרד החינוך כך שהמורה ייכנס מתוך מרחב Moodle שלו ללא סיסמה נוספת ויראה רק את נתוני המרחב שלו.

עם זאת, אין לטעון ש־Moodle API חי עובד עד שקיימים בפועל:

- token / Security Key / API key אמיתי ומאומת.
- בדיקת קריאה אמיתית ל־Moodle.
- בדיקת הרשאות לפי מורה/מרחב.
- תיעוד ב־STATE/evidence-log.md.

אם אין token מאומת, מצב העבודה האמיתי הוא Manual Real Data Import בלבד, בשילוב אוטומציות מקסימליות אפשריות סביב דוחות Moodle, טבלאות Moodle מועתקות, קבצי CSV/XLSX/ODS/TXT, או נתונים אמיתיים שהמורה מקבל מתוך המרחב.

אין Key/Secret/Web-Service token זמין כרגע לקריאת Moodle Web Services חיה, ולכן אין לבנות את המוצר כאילו קיימת קריאת API חיה. יש לשמור Adapter עתידי לכך, אך לסמן אותו חסום/לא מאומת.

חובה לקיים כל הזמן חשיבה, חקירה ושיפור של הדרך שבה המורה מוציא את המידע מתוך Moodle ומקבל אותו באפליקציה באופן האוטומטי המקסימלי האפשרי. בכל פיתוח חדש יש לשאול:

- מאיזה מסך/דוח/טבלה ב־Moodle המורה יכול לקבל את הנתון בפועל?
- האם אפשר לזהות את סוג הדוח אוטומטית?
- האם אפשר למפות עמודות אוטומטית?
- האם אפשר להפחית פעולה ידנית מהמורה בלי לשקר על חיבור API?
- איזה נתון חסר, ואיזה דוח Moodle צריך כדי להשלים אותו?
- האם נוצרה כפילות בין מקורות מידע או מודלים?

כל תשובה לשאלות האלה חייבת להתגלגל לתכנון, לקוד, ולתיעוד הרלוונטי בריפו.

---

## 5. ריבוי מכשירים

המערכת צריכה לעבוד בצורה מסודרת ממכשירים שונים:

- מחשבי חדר מחשב.
- מחשב אישי.
- טלפון נייד.

אין לערבב state בין מכשירים בלי session/context אמיתי. מעבר מכשיר דורש session תקין או launch חדש. אין להציג נתוני מורה/מרחב ממכשיר אחר ללא הקשר מאומת.

---

## 6. עמוד ראשי

עמוד הבית חייב לכלול:

- שם המורה, אם זמין מה־LTI/API/session.
- שם המרחב/הקורס, אם זמין מה־LTI/API/session.
- גישה מהירה בעברית אל:
  - תלמידים
  - משימות
  - פרקים
  - דוחות
  - פעילות/זמנים
  - הגדרות
  - ייצוא
  - ייבוא נתונים

אם שם המורה או שם המרחב אינם זמינים, יש להציג הודעת חוסר אמיתית ולא ערך מומצא.

כל הכפתורים באפליקציה חייבים להיות בעברית, תקינים באמת, ולהוביל למסך/פעולה קיימים. אין כפתור סרק ואין כפתור שמרמז על פעולה שלא קיימת.

---

## 7. תלמידים ומעקב

המערכת צריכה לתמוך, כאשר הנתונים קיימים, ב:

- סינון תלמיד בודד.
- סינון קבוצה.
- סינון כיתה.
- סינון טווח תאריכים.
- משימות שנפתרו/לא נפתרו.
- ציונים.
- מספר ניסיונות.
- ממוצע.
- פעילות.
- זמן תרגול מצטבר בכל יממה.

זמן תרגול:

- אם Moodle מספק משך רשמי — מציגים אותו.
- אם קיימים רק לוגים — מותר להציג חלון פעילות מחושב, עם הסבר ברור שזה חישוב ולא משך רשמי.
- אם אין מידע מספיק — לא מחשבים ולא ממציאים.

---

## 8. משימות ופרקים

לכל משימה יש להציג רק נתונים שקיימים באמת:

- שם משימה.
- שיוך לפרק/נושא.
- כמות שאלות, אם קיימת במקור.
- קישור ישיר למשימה, אם קיים id/link מאומת.
- כפתור העתקת קישור רק אם הקישור אמיתי.

פרקים צריכים להופיע היררכית וברורה, עם כותרות בולטות וניווט נוח בין משימות.

---

## 9. דוחות וייצוא

סוגי דוחות יעד:

- ציונים.
- משימות.
- זמנים.
- פעילות.
- שילובים בהתאמה אישית.

אפשרויות ייצוא יעד:

- צפייה במערכת.
- Excel/XLSX.
- PDF.
- הדפסה מסודרת.
- CSV כפתרון בסיסי קיים/מותר.

אין להציג Excel/PDF כעובד אם קיימת רק CSV/הדפסת דפדפן.

---

## 10. עריכה דו־כיוונית מול Moodle

הדרישה הסופית כוללת יכולות עריכה אמיתיות מתוך האתר, בתנאי שלמורה יש הרשאה לכך ב־Moodle.

דוגמאות:

- שינוי שם מרחב.
- שינוי הגדרות משימה.
- שינוי מספר ניסיונות.
- פעולות ניהול נוספות לפי הרשאות Moodle.

אבל: פעולות אלה חסומות עד שיש Moodle API token אמיתי עם הרשאות כתיבה, ובדיקת כתיבה מאומתת. אין כפתורי עריכה דמה.

---

## 11. סטנדרט ריפו ועבודה עם AI

הריפו חייב להיות:

- נקי.
- מסודר.
- ללא כפילויות מיותרות.
- ללא קוד שאינו מועיל.
- ללא secrets.
- ללא קבצי תלמידים אמיתיים.
- ללא דוחות Moodle פרטיים.
- עם docs ו־STATE מעודכנים.

כל שינוי משמעותי חייב לעדכן:

- `PROJECT_RULES.md` אם כלל/התנהגות השתנו.
- `README.md` אם ההתנהגות הציבורית השתנתה.
- `STATE/project-status.md` אם סטטוס היכולת השתנה.
- `STATE/evidence-log.md` אם בוצעה בדיקה.

כל AI שעובד על הפרויקט חייב קודם ללמוד את הריפו הקיים, לקרוא את דפי הכללים וה־STATE, ורק אחר כך לשפר. אסור לו ליצור הכול מחדש, אסור לפתוח אפליקציה מקבילה, ואסור להתעלם ממה שכבר נבנה על ידי Lovable ומה שכבר סונכרן לריפו.

כל שינוי ש־AI עושה — קוד, תיעוד, בדיקה, תיקון build, UI, import, LTI, או backend — חייב להתועד בריפו ולהישמר ב־GitHub.

כל AI שעובד על הפרויקט חייב לשמור על חקירה רציפה של מסלולי שאיבת מידע מ־Moodle, לשפר את האוטומציה למורה, ולתעד בכל שינוי איך המורה מקבל את הנתון בפועל ומה עדיין דורש פעולה ידנית.

---

## 12. הגדרת Done

יכולת נחשבת Done רק אם:

1. יש קוד אמיתי.
2. אין demo fallback.
3. יש בדיקת build או הסבר למה לא בוצעה.
4. יש empty state אמיתי.
5. יש טיפול בנתונים חסרים.
6. אין secrets.
7. יש תיעוד ב־STATE.
8. נבדק שהכפתורים הרלוונטיים באמת עובדים.
9. תועד מקור הנתונים האמיתי ואופן הפעולה שהמורה צריך לבצע כדי להביא את הנתון.

אם אחד התנאים חסר — הסטטוס הוא partial / planned / blocked, לא Done.

---

## 13. כלל אחרון

מה שלא נבדק — לא מסמנים כעובד.
מה שחסר — מציגים כחסר.
מה שלא קיים — מתוכנן בלבד.
מה שסותר את האמת — מתקנים מיד.

<!-- MTH_PRODUCTION_HARDENING_START -->

## Moodle Teacher Hub — Production Hardening Rules

- GitHub remains the source of truth.
- Canonical LTI endpoint: /api/lti/launch.
- Legacy /lti/launch-1p1 must not be used as the Moodle Tool URL.
- No demo teacher, demo space, fake grades, fake activity, or fake practice time are allowed in production paths.
- LTI launch must require OAuth1 HMAC-SHA1 verification.
- Missing LTI_SHARED_SECRET must block launch.
- Missing or wrong LTI_CONSUMER_KEY must block launch when configured.
- Supabase SERVICE_ROLE_KEY must remain server-only.
- SQL must remain unrun until reviewed and approved.
- Moodle use is allowed only after real launch evidence is recorded in STATE/evidence-log.md.

<!-- MTH_PRODUCTION_HARDENING_END -->

<!-- MTH_RUNTIME_DATA_SAFETY_20260510_START -->
## Runtime Data Safety — 2026-05-10

נתוני Moodle אמיתיים אינם חלק מקוד המקור.

אסור להכניס ל־GitHub: data/store.json, גיבויי תלמידים, קבצי Participants/Gradebook/Logs, שמות, מיילים, ציונים, לוגים, tokens או secrets.

הקובץ data/store.json הוא runtime/local בלבד. הדוגמה הסינתטית היחידה היא docs/examples/store.example.json.

השלב הבא: persistence קבוע ואז מיפוי NRPS ↔ Participants.
<!-- MTH_RUNTIME_DATA_SAFETY_20260510_END -->

<!-- MTH_DOCS_ORGANIZATION_20260510_START -->
## Docs Organization — 2026-05-10

תיקיית `docs/` מאורגנת לפי תפקיד:

- `docs/architecture/` — ארכיטקטורה, חוזי API וזרימת נתונים.
- `docs/lti/` — LTI 1.3, NRPS, AGS ונתיבי launch.
- `docs/imports/` — Participants, Gradebook, Logs וחוזי ייבוא.
- `docs/persistence/` — Supabase ושמירה קבועה.
- `docs/privacy/` — פרטיות ונתוני תלמידים.
- `docs/operations/` — בדיקות, הפעלה, runbooks ומפות ריפו.
- `docs/ai-handoff/` — מסמכי מעבר ופרומפטים לכלי AI.
- `docs/dev/` — הערות פיתוח.
- `docs/archive-candidates/` — מסמכים ישנים לבדיקה לפני ארכיון.

אין לשים ב־docs נתוני תלמידים אמיתיים, קבצי Moodle, גיבויי JSON או secrets.
<!-- MTH_DOCS_ORGANIZATION_20260510_END -->

<!-- MTH_SCRIPTS_ORGANIZATION_20260510_START -->
## Scripts Organization — 2026-05-10

תיקיית `scripts/` מאורגנת לפי תפקיד:

- `scripts/maintenance/` — סקריפטים שנדרשים ל־npm lifecycle או תחזוקה בטוחה.
- `scripts/audit/` — בדיקות ואימותים read-only.
- `scripts/termux/` — כלי Termux/מובייל.
- `scripts/dev/` — כלי פיתוח מקומי.
- `scripts/archive-candidates/` — סקריפטים חד־פעמיים/ישנים לבדיקה לפני ארכיון.

אם סקריפט מופיע ב־`package.json`, אסור להזיז אותו בלי לעדכן את `package.json` ולהריץ `npm run check` ו־`npm run build`.

אין לשים secrets, נתוני תלמידים, גיבויי Moodle או קבצי CSV/XLSX בתוך scripts.
<!-- MTH_SCRIPTS_ORGANIZATION_20260510_END -->

<!-- MTH_REPO_ORGANIZATION_MASTER_20260510_START -->
## Repo Organization Master Plan — 2026-05-10

הריפו מאורגן סביב מקור אמת אחד ברור.

### מה כבר הצלחנו

- LTI 1.3 עובד מתוך Moodle.
- NRPS עובד.
- NRPS החזיר 62 משתתפים אמיתיים: 59 תלמידים ו־3 מורים.
- ייבוא Participants אמיתי הצליח.
- נקלטו 62 שורות.
- עמוד תלמידים מציג שמות ומיילים אמיתיים.
- סודר מקור אמת.
- סודר סיווג קבצים.
- `data/store.json` יצא ממקור tracked.
- `docs/` אורגן לפי תפקיד.
- `scripts/` אורגן לפי תפקיד.

### מבנה עבודה מחייב

- `PROJECT_RULES.md` — מקור אמת עליון.
- `README.md` — שער כניסה קצר.
- `STATE/project-status.md` — סטטוס עדכני.
- `STATE/evidence-log.md` — הוכחות aggregate בלבד.
- `STATE/file-classification/` — מפת סיווג קבצים.
- `docs/` — תיעוד לפי תחומים.
- `scripts/` — אוטומציות לפי תפקיד.
- `src/` — קוד פעיל.
- `supabase/` — שכבת persistence עתידית לבדיקה.
- `data/` — runtime/local בלבד, לא source.

### מה נשאר להמשך

1. לאמת גיבוי מקומי לתלמידים שיובאו.
2. למזג את שרשרת PRs רק אחרי בדיקה ובסדר הנכון.
3. לבנות persistence קבוע.
4. לבנות מיפוי NRPS ↔ Participants.
5. לבנות Gradebook.
6. לבנות Logs וזמן תרגול.
7. לבנות דוחות וייצוא.

אין לסמן ציונים, לוגים, זמן תרגול או דוחות כעובדים עד שיש מקור נתונים אמיתי ואימות.
<!-- MTH_REPO_ORGANIZATION_MASTER_20260510_END -->

<!-- MTH_PERSISTENCE_PLAN_20260510_START -->
## Persistence Plan — 2026-05-10

לפני הרחבה לציונים, לוגים, זמן תרגול ודוחות — חובה לבנות persistence קבוע.

### למה

המערכת כבר הצליחה לייבא Participants אמיתי ולהציג שמות תלמידים, אבל נתונים כאלה חייבים להישמר בשכבת אחסון קבועה ולא להישען על runtime זמני.

### שכבת persistence עתידית

הכיוון המועדף הוא Supabase, אבל אין להריץ SQL, migrations או functions בלי בדיקה ואישור.

### הפרדה מחייבת

כל נתון שמור חייב להיות מופרד לפי:

- issuer
- clientId
- deploymentId
- course/context
- teacher/user
- importBatch
- sourceType

### סדר עבודה

1. לתעד ולאשר תוכנית persistence.
2. לבדוק קבצי Supabase קיימים.
3. ליצור schema בטוח.
4. לשמור import_batches ו־students.
5. להוכיח reload/restart.
6. לבנות מיפוי NRPS ↔ Participants.
7. רק אחר כך Gradebook.
8. רק אחר כך Logs / זמן תרגול.
9. רק אחר כך דוחות.

אין לסמן persistence כעובד עד שנתוני תלמידים אמיתיים נטענים מחדש אחרי restart/deploy בלי להיכנס לגיט.
<!-- MTH_PERSISTENCE_PLAN_20260510_END -->

<!-- MTH_SUPABASE_REVIEW_20260510_START -->
## Supabase Review — 2026-05-10

לפני שימוש ב־Supabase כ־persistence קבוע, חובה לסקור את כל קבצי Supabase הקיימים.

אסור להריץ:
- SQL
- migrations
- Supabase Functions
- database deploy
- service role usage

לפני בדיקה ואישור.

כל קובץ תחת `supabase/` הוא REVIEW_REQUIRED עד שנבדק.

ה־schema העתידי חייב לתמוך בהפרדה לפי issuer/clientId/deploymentId/course/teacher/importBatch/sourceType.

אין להכניס secrets, service-role keys, exports או נתוני תלמידים לגיט.
<!-- MTH_SUPABASE_REVIEW_20260510_END -->

<!-- MTH_AUTOMATION_FIRST_EXECUTION_20260511_START -->
## Automation-First Execution Rule — 2026-05-11

המערכת חייבת לפעול לפי כלל עבודה אחד:

**המורה עושה מינימום. המערכת עושה מקסימום.**

כל פעולה ידנית מצד מורה נחשבת בעיית מוצר, אלא אם הוכח שאי אפשר לבצע אותה אוטומטית בגלל מגבלת Moodle או הרשאות.

### Teacher Action Budget

הפעולות האידיאליות היחידות של מורה:

1. לפתוח את הכלי מתוך Moodle.
2. ללחוץ `סנכרן מרחב`.

פעולה ידנית מותרת רק אם אוטומציה חסומה:

- העלאת דוח Moodle אחד שהמערכת ביקשה במפורש.

אסור לדרוש מהמורה:

- להבין NRPS.
- להבין AGS.
- להבין Supabase.
- להבין GitHub.
- להבין API.
- לבחור לבד איזה דוח צריך.
- למפות עמודות ידנית אם אפשר לזהות אוטומטית.

### השלב הבא בקוד

ה־PR הבא בקוד חייב להיות Automation Core:

1. Capability Detector.
2. Sync Engine.
3. Sync Status Endpoint.
4. Frontend Sync Hook.
5. כפתור `סנכרן מרחב`.
6. Feature Gates לכל כפתור.
7. הסבר בעברית מה חסר.

### כלל כפתורים

כל כפתור ראשי חייב להיות מחובר ל־Feature Gate:

- אם יש נתונים אמיתיים — פעיל.
- אם חסר דוח — מציג איזה דוח צריך.
- אם חסומה הרשאה — מציג חסימת הרשאה.
- אם מתוכנן בלבד — לא מוצג כפעיל.

### כפתורים ראשיים

- `סנכרן מרחב`
- `משימות`
- `משתתפים`
- `ציונים`
- `זמנים`
- `דוחות`
- `ייצוא`
- `מה חסר?`

### אין התחלה מחדש

חובה לשדרג את הקיים:

- Dashboard קיים → מרכז שליטה פרימיום.
- Tasks קיים → פרקים ומשימות חכמים.
- Students קיים → משתתפים ותלמידים חכמים.
- Grades קיים → ציונים ודוחות.
- Activity קיים → זמנים ופעילות.
- Reports קיים → מרכז דוחות.
- Export קיים → Excel/PDF/WhatsApp helper.
- Import קיים → fallback חכם לדוחות Moodle אמיתיים.
<!-- MTH_AUTOMATION_FIRST_EXECUTION_20260511_END -->

<!-- MTH_PRODUCTION_REALITY_HARDENING_20260511_START -->
## Production Reality / No-Demo Hardening — 2026-05-11

הפרויקט הזה נבנה כמוצר אמיתי לשימוש אמיתי, ואולי גם כמוצר מסחרי עתידי. הוא אינו דמו.

### כלל יסוד

אין להתחיל מחדש. אין למחוק או לעקוף יכולות שכבר עובדות. כל פיתוח ממשיך מהריפו הקיים ומהמסכים הקיימים בלבד, אלא אם יש החלטה מתועדת ומנומקת אחרת.

### מסך קיים אינו הוכחה שיכולת עובדת

קיום route או מסך אינו מספיק כדי לסמן יכולת כעובדת.

דוגמאות:
- אם יש מסך `Grades`, זה לא אומר שציונים עובדים.
- אם יש מסך `Activity`, זה לא אומר שזמני תרגול עובדים.
- אם יש מסך `Tasks`, זה לא אומר שכל פרקי Moodle וכל המשימות נשלפים אוטומטית.
- אם יש מסך `Reports`, זה לא אומר שדוחות production מוכנים.

יכולת נחשבת עובדת רק אם יש:
1. מקור נתונים אמיתי.
2. קוד שמחובר למקור הזה.
3. בדיקת build.
4. בדיקת התנהגות בפועל.
5. תיעוד ב־STATE.
6. מצב חסר נתונים ברור.
7. בלי demo fallback ובלי נתונים מומצאים.

### הפרדה בין LTI 1.3 לבין LTI 1.0/1.1

אסור לערבב מסלולי LTI.

- LTI 1.3 הוא המסלול שבו אומת NRPS.
- LTI 1.0/1.1 נשמר רק אם הוא נדרש לתאימות.
- OAuth1 HMAC-SHA1 שייך למסלול LTI 1.0/1.1.
- NRPS/AGS שייכים למסלול LTI 1.3 Advantage.
- אין להסיק שהצלחה במסלול אחד מוכיחה את השני.

כל endpoint, בדיקה, מסמך או UI חייבים לציין לאיזה מסלול LTI הם שייכים.

### מוצר אמיתי / שימוש רחב

לפני שליחת קישור למורים, חובה שהמערכת תעמוד בתנאים הבאים:

1. persistence קבוע.
2. הפרדה מלאה בין מורים, קורסים ומרחבים.
3. כפתור `סנכרן מרחב` אמיתי.
4. Capability Detector.
5. Feature Gates לכל כפתור ראשי.
6. מסך שמסביר מה חסר.
7. אין כפתורי דמו.
8. אין נתונים מומצאים.
9. build עובר.
10. בדיקה עם יותר ממורה/מרחב אחד.
11. תיעוד התקנה ברור למורה.
12. מדיניות פרטיות בסיסית לנתוני תלמידים.

### אוטומציה מקסימלית

כל פעולה ידנית מצד המורה נחשבת בעיית מוצר, אלא אם הוכח ש־Moodle או הרשאות חוסמות אוטומציה.

המערכת חייבת לנסות קודם:

1. LTI session.
2. NRPS.
3. Moodle Web Services אם יש token והרשאות.
4. AGS אם זמין.
5. persistence קיים.
6. ייבוא דוח Moodle אמיתי.
7. העלאה/הדבקה ידנית רק כמוצא אחרון.

### המשך עבודה מחייב

השלב הבא בקוד אינו עוד מסך יפה ואינו התחלה מחדש.

השלב הבא בקוד הוא:

1. Automation Core.
2. Capability Detector.
3. Sync Engine.
4. Sync Status Endpoint.
5. כפתור `סנכרן מרחב`.
6. Feature Gates.
7. Premium Dashboard שמציג רק יכולות אמת.

### כלל מוצר

כל PR עתידי חייב לענות:

- האם הוא ממשיך מהקיים?
- האם הוא מסיר דמו?
- האם הוא מפחית פעולה ידנית מהמורה?
- האם הוא מבדיל בין עובד / חסר דוח / חסום הרשאה / מתוכנן?
- האם הוא שומר על פרטיות?
- האם הוא תועד ב־STATE?
<!-- MTH_PRODUCTION_REALITY_HARDENING_20260511_END -->

<!-- MTH_HEBREW_NO_RESTART_MARKER_20260512_START -->
## כלל עברי מחייב — לא מתחילים מחדש

לא מתחילים מחדש.

ממשיכים מהקיים בלבד.

לא בונים דמו.

לא מחליפים את האפליקציה הקיימת באפליקציה חדשה.

לא מוחקים או עוקפים יכולות שכבר עובדות.

כל פיתוח עתידי חייב להמשיך מהריפו הקיים, מהשרת הפעיל `src/server.js`, מה־Tailwind הפעיל `tailwind.config.cjs`, ומהמסכים הקיימים.

אם יש מסך קיים, הוא אינו נחשב יכולת עובדת עד שיש מקור נתונים אמיתי, בדיקה, ותיעוד STATE.

השלב הבא בקוד הוא Automation Core: Capability Detector, Sync Engine, Sync Status Endpoint, Feature Gates, וכפתור `סנכרן מרחב`.
<!-- MTH_HEBREW_NO_RESTART_MARKER_20260512_END -->

MTH_CURRENT_VERIFIED_STATE_AFTER_PR79_START

## Current verified state after PR #79

Checked at: 20260515-182922

Live:
- Base URL: https://www-tijc.onrender.com
- Gradebook preflight route: `/gradebook-import`
- Gradebook UI marker found: `True`

Persisted real data:
- students: 62
- import_batches: 1
- teachers: 1
- courses: 1
- teacher_sessions: 39

Still missing:
- grade_items / grade_results
- log_events
- multi-teacher or multi-course isolation validation
- Teacher Release YES

Rules:
- Do not repeat Participants as the main blocker unless live counts fall back to 0.
- Next main blocker is Gradebook, then Logs.
- Do not fake grades.
- Do not commit student rows or grade rows.
- Do not run destructive SQL.
- Teacher Release remains NO until all gates pass.

MTH_CURRENT_VERIFIED_STATE_AFTER_PR79_END

MTH_CURRENT_VERIFIED_STATE_AFTER_PR81_START

## Current verified state after PR #81

Checked at: 20260516-222400

Live:
- Base URL: https://www-tijc.onrender.com
- Gradebook route: /gradebook-import
- Wide Gradebook UI marker found: True

Persisted real data:
- students: 62
- import_batches: 1
- teachers: 1
- courses: 1
- teacher_sessions: 39

Wide Gradebook status:
- Code implemented: true
- UI deployed: true
- report_type=grades enabled: true
- grade_items currently: 0
- grade_results currently: 0

Still missing:
- Actual Gradebook import button click after uploading grad.ods
- log_events
- multi-teacher or multi-course isolation validation
- Teacher Release YES

Rules:
- Do not repeat Participants as the main blocker unless live counts fall back to 0.
- Next main action is clicking ייבא Gradebook אמיתי using the real grad.ods file.
- Do not fake grades.
- Do not convert missing grades to 0.
- Do not commit student rows or grade rows.
- Do not run destructive SQL.
- Teacher Release remains NO until all gates pass.

MTH_CURRENT_VERIFIED_STATE_AFTER_PR81_END

MTH_AFTER_REAL_GRADEBOOK_IMPORT_START

## After real Gradebook import

Verified result:
- students: 62
- grade_items_written: 243
- grade_results_written: 1693
- skipped_students: 0
- skipped_empty_grades: 12644
- empty grade cells were not saved as zero
- Teacher Release remains NO

Remaining blockers:
- real Moodle Logs import
- practice-time validation
- multi-teacher or multi-course isolation validation
- final Teacher Release gate

MTH_AFTER_REAL_GRADEBOOK_IMPORT_END

MTH_AFTER_REAL_LOGS_IMPORT_START

## After real Moodle Logs import

Verified result:
- students: 62
- grade_items_written: 243
- grade_results_written: 1693
- log_events_written: 89995
- logs_skipped_rows: 0
- fake_logs: false
- practice_time_invented: false
- Teacher Release remains NO

Remaining blockers:
- practice-time truth gate
- multi-teacher or multi-course isolation validation
- final Teacher Release gate

Rules:
- Do not invent practice time.
- Do not expose raw logs publicly.
- Do not commit source log rows to GitHub.
- Teacher Release remains NO until all gates pass.

MTH_AFTER_REAL_LOGS_IMPORT_END

MTH_PRACTICE_TIME_TRUTH_GATE_START

## Practice-time truth gate — BLOCKED: NO_DURATION_FIELD

Checked at: 2026-05-17

Verified result:
- students: 62
- grade_items_written: 243
- grade_results_written: 1693
- log_events_written: 89995
- practice_time_available: false
- blocker_key: NO_DURATION_FIELD
- fake_time: false
- window_estimation_enabled: false
- teacher_release_changed: false

Reason: The imported Moodle Logs report contains no explicit duration field
(checked: duration_seconds, duration, timeDiff). Practice time cannot be
calculated without an official duration field. Timestamp-window estimation
is permanently disabled to prevent fake official practice time.

Rules:
- Do NOT calculate practice time from timestamps.
- Do NOT label timestamp-window estimates as official Moodle time.
- Do NOT set practice_time_available=true until a real duration field exists.
- Do NOT set Teacher Release YES.
- Do NOT expose raw log rows publicly or commit them to GitHub.
- If a future Moodle report provides an explicit duration field, re-run gate.

Remaining blockers:
- multi_teacher_or_multi_course_isolation
- teacher_release_final_gate

MTH_PRACTICE_TIME_TRUTH_GATE_END
