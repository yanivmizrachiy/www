# Repository Map — www / Moodle Teacher Hub

מסמך זה מגדיר את מבנה הריפו הרצוי והמחייב, כדי שהפרויקט יישאר נקי, חכם, מסודר וללא סתירות.

---

## מקור אמת

```text
PROJECT_RULES.md        מקור אמת עליון
README.md               תקציר ציבורי והפעלה
docs/                   תכנון, חוזים, כללים וארכיטקטורה
STATE/                  מצב אמת, הוכחות, בדיקות ומה חסר
src/                    קוד המערכת
public/                 קבצים סטטיים בלבד
data/                   אחסון זמני/מקומי בלבד, ללא נתוני תלמידים אמיתיים
```

---

## מבנה יעד

```text
www/
  README.md
  PROJECT_RULES.md
  package.json
  .gitignore
  .env.example

  docs/
    system-rules.md
    requirements.md
    repository-map.md
    implementation-plan.md
    moodle-api-contract.md
    lti-contract.md
    testing-plan.md

  STATE/
    project-status.md
    evidence-log.md
    lovable-intake.md
    open-gaps.md

  src/
    server.js / main app files
    ui/
    routes/
    services/
    adapters/
    exports/

  data/
    store.json        זמני בלבד; לא מקור אמת production
```

---

## חלוקת אחריות

### README.md

מיועד לקריאה מהירה:

- מה הפרויקט עושה.
- איך מריצים.
- מה עובד כרגע.
- מה חסום.
- איפה מקור האמת.

### PROJECT_RULES.md

מסמך מחייב:

- איסור דמו.
- כללי אמת.
- דרישות Moodle/API/LTI.
- סטנדרט Done.
- איסורי secrets.

### docs/

מסמכי תכנון:

- דרישות.
- חוזה API.
- חוזה LTI.
- תכנון פיתוח.
- תכנון בדיקות.

### STATE/

מצב אמת:

- מה אומת.
- מה לא אומת.
- אילו קומיטים בוצעו.
- מה חסר.
- אילו בדיקות עברו/נכשלו.

---

## כלל אי־סתירה

אם יש סתירה:

1. `PROJECT_RULES.md` קובע.
2. `STATE/project-status.md` קובע מה באמת אומת.
3. README חייב להתעדכן בהתאם.
4. מסמכי docs חייבים להיות מסונכרנים.

---

## כלל ניקיון

אסור להשאיר בריפו:

- קוד מת שלא מועיל.
- מסמכים כפולים עם אותו תפקיד.
- נתוני תלמידים אמיתיים.
- secrets.
- לוגים זמניים.
- תיקיות backup לא נחוצות.

---

## יעד ניהול עתידי

כל עדכון עתידי צריך להיכנס לאחד מארבעת המקומות:

- קוד — אם זו יכולת אמיתית.
- docs — אם זו החלטה/תכנון.
- STATE — אם זו הוכחה/סטטוס.
- README — אם זה מידע שימושי למפתח או משתמש.
