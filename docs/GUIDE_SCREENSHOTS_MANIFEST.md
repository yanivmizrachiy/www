# מניפסט צילומי המדריך — מקור אמת תפעולי

מסמך זה מתעד את נכסי הצילום האמיתיים של מצגת Moodle: provenance, פרטיות, שמות קבצים, שימוש במצגת וכללי שילוב.  
**מקור האמת למוצר ולדרישות המצגת נשאר `PROJECT_MEMORY.md`; המסמך הזה אינו מקור אמת מקביל.**

## מקור וצינור ההפקה

- מקור הצילומים: session חי ומאומת ב-Moodle של משרד החינוך (`moodlemoe.lms.education.gov.il`).
- הצילומים נוצרו מניווט ולחיצות אמיתיות במערכת; אין תמונות סטוק, UI מומצא או צילום AI.
- צילומים עם מידע אישי אינם מתפרסמים ללא טשטוש/החלפה בטוחה.
- מקורות גולמיים/תיקיות extraction מקומיות אינם נשמרים ב-Git כאשר אינם נדרשים למוצר.

## פרטיות

אסור לפרסם צילום שמציג מידע אישי גלוי של תלמידים, ציונים, מיילים, מזהים, IP, תוכן הגשה או פרט פרטי אחר.

דוגמאות שכבר הוחרגו בעבר:
- מסך התחברות עם מזהה משתמש ממולא.
- רשימת קורסים עם שם צד ג׳ ללא הסכמה.
- מסכי משתתפים/ציונים חיים עם נתוני תלמידים.

כאשר צילום מכיל שמות מותאמים לצורכי הדרכה, יש להשתמש בערכים בדויים/מאושרים בלבד.

## הארכיטקטורה הפעילה

הארכיטקטורה הקנונית הנוכחית היא:

```text
PROJECT_MEMORY.md
        ↓
src/data/guideDeckSource.ts
        ↓
src/data/guideDeck.ts
        ↓
src/pages/Guide.tsx
        ↓
/guide
```

- `guideDeckSource.ts` מחזיק את תוכן השקופיות, status, `missingCaptureId`, צילומים וקישורים.
- `guideDeck.ts` הוא שער normalization/publication היחיד של האפליקציה:
  - ממיר כל צילום runtime ל-AVIF;
  - מנרמל שקף עם `missingCaptureId` ל-`needs-capture`;
  - מפרסם רק `status === 'ready' && !missingCaptureId`;
  - מסנן Quick Start כך שלא יפנה לשקף חסום.
- `Guide.tsx` צורך רק את `guideDeck.ts`. אסור לרכיב אפליקטיבי לעקוף את שער הפרסום ולייבא ישירות את `guideDeckSource.ts`.
- `public/guide/screenshots/` מחזיק את נכסי המקור ואת נגזרות AVIF/WebP המאומתות.

## Focus overlays — הדגשת הכפתור האמיתי

מקור האמת דורש שבכל פעולה יהיה ברור מיד על מה לוחצים. לשם כך נוספה תשתית focus שאינה משנה את צילום Moodle ואינה מציירת כפתור חלופי.

הארכיטקטורה:

```text
public/guide/focus-map.json
        ↓
public/guide/focus-overlays.js
        ↓
מלבן/תווית מעל צילום Moodle אמיתי בלבד
```

כללים מחייבים:
- `focus-map.json` יכול להישאר ריק; ריק עדיף על סימון מנוחש.
- מוסיפים entry רק אחרי בדיקה חזותית של הצילום האמיתי ואימות coordinates.
- coordinates הם אחוזים `x/y/w/h` בתחום 0–100.
- כל entry חייב לכלול `label` ברור ו-`evidence` שמסביר מאיפה הגיע האימות.
- overlay הוא שכבת הדגשה בלבד; אין לערוך את UI של Moodle או ליצור כפתור שאינו קיים.
- אם המפה חסרה/לא תקינה, המדריך עובד כרגיל ללא overlay (fail-open).
- `scripts/checks/guide-focus-map-audit.cjs` מוודא שהצילום קיים, משמש את המצגת וה-coordinates תקינים.

## קבצי צילום קיימים

| קובץ | מה רואים |
| --- | --- |
| `01-login.jpg` | עמוד כניסה, שדות ריקים |
| `02-my-courses-home.jpg` | „מרחבי־הלימוד שלי” |
| `03-topbar-edit-off.png` | מצב עריכה כבוי |
| `04-topbar-edit-on.png` | מצב עריכה פעיל |
| `05-home-edit-on.jpg` | עמוד בית במצב עריכה |
| `06-course-edit-on.jpg` | קורס במצב עריכה |
| `07-unit-menu.jpg` | תפריט יחידה |
| `08-more-options.jpg` | „אפשרויות נוספות” |
| `09-user-menu.jpg` | תפריט משתמש |
| `10-course-page.jpg` | עמוד קורס ותפריט קורס |
| `11-notifications.jpg` | פאנל התראות |
| `12-messages.jpg` | פאנל מסרים |
| `13-section-menu-full.jpg` | תפריט יחידה מלא |
| `14-hidden-items.jpg` | מצבי הסתרה/זמינות |
| `15-add-activity-button.jpg` | „הוספת משאב או פעילות” |
| `16-activity-chooser.jpg` | בורר פעילויות — חלק א׳ |
| `17-activity-chooser-more.jpg` | בורר פעילויות — חלק ב׳ |
| `18-reports.jpg` | עמוד הדוחות |
| `19-wizard-step1.jpg` | אשף פתיחת מרחב — שלב 1 |
| `20-wizard-step1-selected.jpg` | בחירת מסלול בשלב 1 |
| `21-wizard-step1-form.jpg` | טופס שלב 1 |
| `25-wizard-step1-filled.jpg` | שלב 1 לאחר מילוי |
| `22-wizard-step2.jpg` | בחירת סוג מרחב |
| `24-wizard-step4.jpg` | אישור וסיום |
| `26-selfenrol-methods-list.jpg` | שיטות שיוך עצמי וסמל העין |
| `27-selfenrol-settings.jpg` | הגדרות שיוך עצמי |
| `28-selfenrol-student-view.jpg` | „רשום אותי” בצד התלמיד |
| `29-selfenrol-success-studentview.jpg` | הצטרפות הושלמה |
| `30-student-mycourses-selflearning.jpg` | מרחב מורה מול למידה עצמית |
| `31-updates-drawer.jpg` | פאנל עדכוני תוכן |
| `32-updates-list-expanded.jpg` | רשימת עדכונים וידית גרירה |
| `33-quiz-question-behaviour.jpg` | הגדרות ניסיונות/התנהגות שאלה |

לכל צילום מקור קיימות נגזרות AVIF ו-WebP לפי בדיקות ה-integrity. ה-runtime משתמש ב-AVIF.

## רשימת החוסרים

`docs/GUIDE_MISSING_CAPTURES.md` מכיל **רק** חוסרי צילום שטרם נפתרו. הרשימה דינמית: כאשר evidence אמיתי מושלם, מסירים את `missingCaptureId` מהשקף ואת ה-M המתאים מהמסמך.

אסור לקבע ב-CI שמספר החוסרים חייב להישאר 22. CI בודק התאמה דו-כיוונית בין הקוד למסמך ולא מספר קסם.

## כללי שילוב צילום חדש

1. לחפש קודם בכל נכסי הריפו.
2. אם צילום מתאים כבר קיים — להשתמש בו.
3. אם לא קיים — להשאיר/להוסיף M מפורש בלבד; אין Placeholder.
4. לצלם רק בסביבה מורשית.
5. לטשטש/להחליף PII לפני commit.
6. לשמור מקור + AVIF + WebP לפי הצינור הקיים.
7. לשייך את הצילום לשקף המתאים ב-`guideDeckSource.ts`.
8. אם נדרש focus, לאמת את אזור הלחיצה ולהוסיף entry ל-`focus-map.json` עם evidence.
9. להסיר `missingCaptureId` ולסמן `ready` רק כשהרצף באמת שלם.
10. להריץ `npm run audit:guide`, `npm run audit:guide-focus`, `npm run report:guide-gaps` ו-build לפני פרסום.
