# TypeScript Config Notes — Moodle Teacher Hub

מסמך זה מתעד את תצורת TypeScript שסופקה מתוך Lovable ואת המשמעות שלה להמשך פיתוח.

---

## קבצים ידועים

המשתמש סיפק תצורת TypeScript ראשית שמפנה אל:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

בנוסף מופיעים compiler options מרכזיים:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  },
  "noImplicitAny": false,
  "noUnusedParameters": false,
  "skipLibCheck": true,
  "allowJs": true,
  "noUnusedLocals": false,
  "strictNullChecks": false
}
```

---

## משמעות מקצועית

הפרויקט משתמש ב־TypeScript, אבל לא בתצורה מחמירה.

ההשלכות:

- build יכול לעבור גם אם קיימים טיפוסים חלשים.
- `any` לא נחסם.
- פרמטרים לא בשימוש לא מפילים build.
- local variables לא בשימוש לא מפילים build.
- null/undefined לא נאכפים בחומרה.
- `allowJs=true` מאפשר הכנסת JavaScript לצד TypeScript.

זה מתאים לפיתוח מהיר ב־Lovable, אבל לא מספיק לבדו להוכחת production quality.

---

## כלל עבודה

אסור להסיק מ־`tsc` נקי בלבד שהמערכת production-ready.

לפני סימון production-ready נדרשים גם:

- בדיקת build.
- בדיקת lint.
- בדיקת routes.
- בדיקת imports אמיתיים.
- בדיקת empty states.
- בדיקת LTI launch אמיתי.
- בדיקת Supabase functions.
- בדיקה שאין secrets בריפו.

---

## המלצת המשך

בשלב ראשון אין להקשיח מיד את TypeScript כדי לא לשבור קוד Lovable קיים.

הקשחה תיעשה בהדרגה:

1. לשמר build עובד.
2. להוסיף בדיקות סביב data adapters ו־import parsers.
3. להוסיף type guards למקורות Moodle.
4. להקשיח קבצים חדשים בלבד.
5. רק אחרי יציבות — לשקול `strict=true`.

---

## סטטוס

תצורת TypeScript: ידועה חלקית מהחומרים שסופקו.

קבצי הליבה שעדיין צריכים להיבדק:

- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`
- `eslint.config.js`
