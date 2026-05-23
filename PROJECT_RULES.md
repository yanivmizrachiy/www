<!-- MTH_SOURCE_OF_TRUTH_AUTOMATION_PLAN_20260519_START -->
# מקור אמת נוכחי — Moodle Teacher Hub / www

עודכן: 2026-05-19

## כלל עליון

PROJECT_RULES.md הוא מקור האמת המחייב של הריפו `yanivmizrachiy/www`.

בכל שינוי עתידי חייב להיות ברור:
1. מה כבר בוצע.
2. מה הדרישות של יניב.
3. מה עובד בפועל.
4. מה עדיין חסום.
5. מה נשאר לעשות.
6. מה תוכנית העבודה הבאה.
7. מה אסור לקלקל.

אם יש סתירה בין README, docs, STATE, PR ישן או שיחה — PROJECT_RULES.md קובע עד שיעודכן במפורש.

## חזון המוצר

היעד הסופי הוא כלי מורה עברי RTL פרימיום שנפתח מתוך Moodle.

כל מורה אמור להיות מסוגל להתקין/להוסיף את הכלי בכל מרחב Moodle שלו, לפתוח אותו מתוך המרחב, ולקבל אתר שמציג רק את נתוני המרחב שלו.

אסור שיהיה ערבוב נתונים בין מורים, מרחבים או מכשירים.

## דרישת אוטומציה

הדרישה הסופית היא שאיבה אוטומטית מקסימלית של נתוני Moodle לתוך הכלי.

המערכת חייבת תמיד לשאוף למינימום פעולות ידניות מצד המורה.

יש להמשיך באופן קבוע לחקור ולשפר את כל מסלולי השאיבה האפשריים מתוך Moodle:
- LTI launch/context.
- LTI 1.3 services.
- NRPS.
- AGS.
- Moodle Web Services אם ורק אם יש token אמיתי והרשאות מתאימות.
- דוחות Moodle אמיתיים שהמורה מעלה או מדביק.
- זיהוי דוח אוטומטי, מיפוי עמודות אוטומטי, ושמירה קבועה.

אסור לכתוב או להציג שהכול אוטומטי אם זה לא אומת בפועל.

## מצב הנתונים הנוכחי

נכון לעכשיו, הנתיב הפעיל בפועל הוא:

Moodle Launch / LTI
→ זיהוי מורה/מרחב/סשן
→ ייבוא דוחות Moodle אמיתיים שהמורה מעלה או מדביק באתר
→ זיהוי ומיפוי אוטומטיים ככל האפשר
→ שמירה ב-Supabase
→ תצוגה ודוחות באתר

כלומר:
- הנתונים אמיתיים.
- אין דמו.
- Participants עובד.
- Gradebook עובד.
- Logs עובד.
- Supabase persistence קיים.
- עמוד הבית הוא Action Hub ולא דף הסברים.
- אבל עדיין אין שאיבה אוטומטית מלאה של כל הנתונים ממודל ללא פעולה מצד המורה.

Manual Real Data Import הוא פתרון אמיתי ובטוח כרגע, אבל הוא לא החזון הסופי.

## כלל עמוד הבית — Action Hub בלבד

עמוד הבית חייב להיות מסך פעולה נקי למורה, לא דף הסברים.

חובה בעמוד הבית:
- כפתורי פעולה גדולים, בעברית, נוחים וברורים.
- כפתורים עובדים בלבד, שמובילים למסכים/פעולות קיימות.
- שם המורה אם התקבל מ־LTI/session/API.
- שם המרחב/הקורס אם התקבל מ־LTI/session/API.
- סטטוס חיבור קצר.
- מספרים קצרים בלבד: תלמידים, פריטי ציון, ציונים, פרקים, משימות, לוגים.
- הודעות שגיאה רק אם יש תקלה אמיתית.

אסור בעמוד הבית:
- טקסטי דמו.
- כיתובים כגון “אין דמו” כטקסט שיווקי קבוע.
- הסברים ארוכים על יכולות.
- פאנלים ארוכים שמסבירים מה חסר.
- טקסט שמבלבל את המורה במקום לתת פעולה.
- כפתורים שלא עובדים באמת.

סטטוסי עומק, חסמים, בדיקות יכולות, Teacher Release ו־diagnostics צריכים להיות במסכי הגדרות/מה חסר/בדיקות — לא להעמיס את הבית.

## דרישות כפתורי פעולה

כפתורי הבית הראשיים:
- משתתפים.
- פרקים ופעילויות.
- ציונים.
- כל השאר / פעולות נוספות.

פעולות נוספות צריכות לכלול רק יעדים קיימים:
- ייבוא נתונים.
- ייבוא Gradebook.
- ייבוא יומני מעקב.
- פעילות / זמנים.
- דוחות.
- ייצוא.
- הגדרות.
- חיבור Moodle.
- מה חסר.

## דרישות פרקים ומשימות

בלחיצה על פרקים ופעילויות, היעד הסופי הוא להציג את כל הפרקים והמשימות שנמצאים במרחב Moodle המסוים של המורה.

המערכת צריכה לשאוף לשאוב זאת אוטומטית ככל האפשר מתוך Moodle. אם אין API שמחזיר זאת, יש להשתמש בדוח/טבלה/ייצוא Moodle אמיתי, עם זיהוי ומיפוי אוטומטי ככל האפשר.

אין להציג משימות מומצאות ואין להציג כפתור קישור למשימה אם אין קישור אמיתי.

## דרישות תלמיד וציונים

לכל תלמיד צריך להיות מסך נוח למורה עם:
- טבלת ציונים אמיתית.
- ממוצע ציונים מחושב רק מתוך ציונים קיימים.
- צבעי פרימיום ברורים.
- כפתורי פעולה בעברית.
- משימות/פעילות אם הנתונים קיימים.
- חוסרים מוצגים כחסר, לא כ־0 ולא כהשערה.

## מה כבר בוצע

- LTI / פתיחה מתוך Moodle קיימת.
- Supabase persistence קיים.
- Participants אמיתי יובא ונשמר.
- Gradebook אמיתי יובא ונשמר.
- Logs אמיתיים יובאו ונשמרו.
- Practice time לא מומצא ונשאר חסום כשאין שדה משך רשמי.
- Teacher Release עדיין NO.
- עמוד הבית הראשי הושלם כעמוד הבית החכם.
- נוספה שורת מעודכן לתאריך עם זמן אמיתי.
- נוספו כפתורים ראשיים: משתתפים, פרקים ופעילויות, ציונים, כל השאר.
- נוסף תפריט משני.
- בוצע עיצוב כחול כהה / פרימיום.
- מסך Import / Participants עבר ניקוי UI פרימיום.
- PR #99: מרכז יכולות Moodle דינמי מוזג ל־main.
- PR #100: בדיקת live קבועה למרכז היכולות נוספה ל־main.
- PR נוכחי: עמוד הבית עובר לניקוי Action Hub בלי טקסטי הסבר/דמו.

## מה נשאר לעשות

1. לשמור את PROJECT_RULES.md מעודכן בכל שינוי.
2. לבדוק לעומק אפשרויות שאיבה אוטומטית דרך LTI / NRPS / AGS / Moodle Web Services.
3. אם אין API מאומת — לשפר את הייבוא הידני כך שיהיה קצר, ברור וכמעט אוטומטי.
4. להשלים פרקים ומשימות אמיתיים לפי מרחב Moodle.
5. לשדרג מסכי תלמיד/ציונים לעיצוב פרימיום מלא עם ממוצעים, צבעים וכפתורי פעולה.
6. לנקות מסך־מסך לעיצוב פרימיום אחיד:
   - GradebookImport.tsx
   - LogsImport.tsx
   - Students.tsx
   - Tasks.tsx
   - Grades.tsx
   - Reports.tsx
   - SettingsPage.tsx
   - Export.tsx
   - MissingData.tsx
   - StudentProfile.tsx
7. לבדוק מורה שני או מרחב שני.
8. לוודא שאין ערבוב נתונים.
9. רק אחרי כל שערי האמת — לשקול Teacher Release = YES.

## מה אסור לקלקל

אסור לשבור או לשנות בלי צורך:
- Participants import.
- Gradebook import.
- Logs import.
- Supabase persistence.
- LTI launch.
- check/build.
- Teacher Release gate.
- כלל אין דמו.
- כלל אין נתונים מזויפים.
- כלל אין זמן תרגול מומצא.

## אחוזי מצב נוכחיים

ריפו / קוד / אוטומציה / תיעוד: 99%
צינור נתוני אמת: 98%
Participants: 100%
Gradebook: 100%
Logs: 100%
עמוד הבית כ־Action Hub: בתהליך PR נוכחי
שאיבה אוטומטית מלאה ממודל ללא פעולה מצד המורה: עדיין לא מלאה
מוכנות לכל מורה בכל מרחב: תלויה בבדיקת בידוד מורה/מרחב
Teacher Release: NO
<!-- MTH_SOURCE_OF_TRUTH_AUTOMATION_PLAN_20260519_END -->

---

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

---

## Automation Control Center V1 — PR #107

Status: implemented in PR #107; pending live validation after merge.

Added in feature branch `feat/automation-control-center-v1`:

- Frontend route: `/automation`
- Backend endpoint: `GET /api/automation/capabilities`
- Backend endpoint: `GET /api/automation/export-links`
- Moodle report target paths for Activity Completion, Gradebook, Logs, and Participants, based on detected Course ID
- State file: `STATE/automation/AUTOMATION_STATUS.md`
- Progress file: `STATE/progress/2026-05-19-automation-control.md`
- Documentation: `docs/automation/AUTOMATION_CONTROL_CENTER_V1.md`

Safety status:

- Teacher Release remains `NO`.
- Full Moodle API auto-sync is not enabled yet.
- No Moodle passwords are stored.
- No Moodle token storage was added.
- No Playwright/browser automation was added.
- No Supabase schema migration was added.
- No fake/demo Moodle data was added.
- No raw student rows should be returned by the automation endpoints.

Planning note:

- Automation progress must be measured by audit output and live validation, not by speculative percentages.
- Teacher convenience must be validated by real teacher workflow tests.
- National readiness remains blocked until multi-teacher / multi-course isolation and final release gates pass.

Every future PR must update a dated `STATE/progress/YYYY-MM-DD-*.md` file.

<!-- MTH_MOODLE_WS_READINESS_20260524_START -->

## Moodle Web Services Readiness Endpoint — 2026-05-24

Added `GET /api/automation/moodle-webservices/readiness` — a safe, read-only probe endpoint.

Current live status: `missing_env` — `MOODLE_WS_TOKEN` not configured in Render.

This endpoint will advance to `verified_site_info` only after:
1. A Moodle administrator enables Web Services and REST protocol.
2. A token with `core_webservice_get_site_info` capability is created.
3. `MOODLE_WS_TOKEN` is set in Render environment variables (never in GitHub).

Safety guarantees: no token returned, no student data, no grades, no PII, no raw Moodle response.

Audit: `npm run audit:moodle-webservices-readiness`

Teacher Release remains **NO**.

<!-- MTH_MOODLE_WS_READINESS_20260524_END -->

<!-- MTH_PRODUCT_REQUIREMENTS_20260524_START -->

## דרישות מוצר מלאות — 2026-05-24

מסמך זה שומר את כל דרישות המוצר כפי שהוגדרו. הוא מחייב כמו שאר חלקי PROJECT_RULES.md.

### 1. מה המוצר

Moodle Teacher Hub הוא Action Hub למורה — אתר בעברית מלאה ו-RTL שנפתח מתוך מרחב לימוד אמיתי ב-Moodle.

זה לא אתר כללי. זה לא דף הסבר. זה לא פורטל שיווקי.

כל נתון חייב להיות שייך למרחב הלימוד הנוכחי שממנו המורה פתח את הכלי.

### 2. עמוד הכניסה

עמוד הכניסה חייב להציג:
- שם מרחב הלימוד / הקורס (מ-LTI context בלבד)
- שם המורה — לחיץ (פתיחת מסך פרטי מורה)
- מספר תלמידים (ממקור אמת בלבד; "—" אם חסר)
- מספר מורים אם יש מקור אמת
- כפתורי פעולה ראשיים בעברית
- מה חסר במערכת

אם נתון חסר — לא להמציא. לכתוב מצב חסר ברור.

### 3. מסך פרטי מורה

שם המורה בעמוד הכניסה הוא לחיץ ופותח מסך פרטי מורה.

מוצגים רק פרטים אמיתיים שהתקבלו מה-LTI/session/context:
- שם מלא
- שם משתמש (username) אם התקבל
- role
- מרחבים / קורסים שפתח (אם ידוע)

אסור להמציא פרטי מורה.

### 4. מורים

כפתור "מורים" פותח רשימת מורים של אותו מרחב בלבד.

אם ידוע רק המורה הנוכחי — מציגים רק אותו ומסבירים שחסר מקור מלא (NRPS missing).

אסור להמציא מורים נוספים.

מקורות עתידיים למורים: NRPS (כשיהיה זמין), Moodle Web Services.

### 5. תלמידים

כפתור "תלמידים" פותח רשימת תלמידים ממוספרת של אותו מרחב בלבד.

**ברשימה הפשוטה מציגים רק:**
- שם פרטי + שם משפחה / שם תצוגה

**אסור להציג ברשימה הפשוטה:**
- תעודת זהות
- מייל
- username
- external id
- מזהים פנימיים

פרטים נוספים מותרים רק במסך פרופיל תלמיד בודד ורק אם הגיעו ממקור אמת.

### 6. ציונים

ציונים מוצגים רק ממקור אמת:
- Gradebook import (פעיל)
- AGS — רק אם יאומת
- Moodle Web Services — רק אם יאומת

**אסור:** להפוך ציון חסר ל-0. חסר נשאר חסר ומוצג כחסר.

### 7. זמני פעילות

זמן מצטבר לתלמיד מוצג רק אם יש מקור משך אמיתי ומאומת (שדה duration רשמי ב-Logs).

אם יש רק Logs בלי duration רשמי — לא להמציא זמן. להציג:
"לא ניתן לחשב זמן מצטבר ללא מקור משך מאומת"

תמיכה עתידית נדרשת:
- בחירת יום בודד
- בחירת טווח תאריכים
- זמן מצטבר בטווח
- ניווט נוח

### 8. דוחות ידניים — מעמד ותפקיד

Manual import הוא fallback בלבד — לא המסלול הראשי.

דוחות Moodle הרלוונטיים (לפי סדר עדיפות):
1. Participants — תלמידים/משתתפים
2. Gradebook — ציונים
3. Logs — פעילות
4. Activity Completion / Progress — השלמות
5. Course Structure / Course Contents — מבנה קורס

המטרה הסופית: כמה שפחות הורדות ידניות מהמורה.

### 9. סדר אוטומציה

```
LTI context        → עובד ✓
NRPS               → missing כרגע
AGS                → missing כרגע
Moodle Web Services → missing / not verified
  └─ core_webservice_get_site_info    ← safe first probe
  └─ core_enrol_get_enrolled_users   ← אחרי אימות ראשון
  └─ gradereport_user_get_grade_items ← אחרי אימות ראשון
  └─ core_course_get_contents         ← אחרי אימות ראשון
  └─ core_completion_get_activities_completion_status ← אחרי אימות
  └─ report_log_get_events            ← אחרי אימות
```

כל שלב מחייב ראיה ב-`STATE/evidence-log.md` לפני המשך.

### 10. Web Services — כלל עבודה עם AI

אין לבקש מהמשתמש token / password / cookie / admin credentials.

הריפו מכין readiness endpoint ו-audits בלבד.

אם Admin צריך להפעיל משהו — לכתוב checklist ברור למנהל Moodle ב-docs.

אסור לשמור סוד בקוד או ב-GitHub.

### 11. פרטיות — מה לא לחשוף בשום מצב

- סיסמאות
- tokens
- cookies
- raw headers
- raw student rows
- emails ברשימות פשוטות
- תעודות זהות
- מזהים פנימיים מיותרים
- raw Moodle API response אם יש בו PII

### 12. כלל אמת — רשימה מלאה

- אין דמו
- אין fake sync
- אין כפתורים מזויפים
- אין תלמידים מומצאים
- אין מורים מומצאים
- אין ציונים מומצאים
- אין זמני פעילות מומצאים
- אין Teacher Release YES

### 13. בידוד נתונים

כל נתון חייב להיות שייך ל-context הנוכחי בלבד.

אסור לערבב: קורסים / מורים / מוסדות / מרחבי לימוד.

Course 259 הוא ראיית pilot בלבד — לא hardcode מוצרי.

### 14. פורמט תאריכים ב-UI

כל תאריך שמורה רואה ב-UI מוצג: `D/M/YY`

דוגמה: `5/3/26`

כלל זה חל על UI בלבד. לא לשנות DB / API / logs / STATE / JSON.

### 15. ניווט

בכל המסכים יהיו כפתורי ניווט עבריים וברורים:
- חזרה לעמוד הבית
- מורים
- תלמידים
- ציונים
- זמני פעילות
- דוחות
- ייבוא דוחות
- מה חסר
- הגדרות

### 16. מה לא לגעת — פיפליינים מוגנים

לא לגעת בלי סיבה מוכחת ובעיה מוכחת:
- Participants import
- Gradebook import
- Logs import
- LTI launch flow
- Supabase migrations
- Teacher Release gate
- deploy
- secrets

### 17. מה לשפר עכשיו

סדר עדיפות ל-PRs הבאים:
1. docs / RULES / PROJECT_RULES / audits / backlog — ✅ בוצע ב-2026-05-24
2. `/api/import/course-structure` — backend endpoint חסר (page קיים)
3. UI date format — `D/M/YY` בכל מסכי תאריכים
4. מסך פרטי מורה לחיץ מעמוד הכניסה
5. רשימת מורים per-space
6. Privacy guard ברשימת תלמידים (הסתרת TZ / email)
7. Moodle WS readiness — ✅ בוצע ב-2026-05-24 (`/api/automation/moodle-webservices/readiness`)

<!-- MTH_PRODUCT_REQUIREMENTS_20260524_END -->

