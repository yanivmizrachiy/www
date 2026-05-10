# TypeScript Config Notes — www / Moodle Teacher Hub

מסמך זה מתעד את תצורת TypeScript שנמסרה מתוך פרויקט Lovable / Moodle Teacher Hub, כדי למנוע בלבול בין קבצי TypeScript שונים וכדי לשמור על תיעוד מקצועי בריפו `yanivmizrachiy/www`.

---

## קבצי TypeScript ידועים מהחומרים שנמסרו

המשתמש מסר לפחות שתי שכבות TypeScript:

1. `tsconfig` ראשי שמפנה ל־`tsconfig.app.json` ול־`tsconfig.node.json`.
2. תצורת app עם `include: ["src"]`, React JSX, alias `@/* -> ./src/*`, ותצורה לא מחמירה.
3. תצורת node/vite שמכסה את `vite.config.ts` בלבד, עם `strict: true`.

---

## tsconfig root — ידוע מהחומרים

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
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
}
```

משמעות: זהו קובץ תיאום/שורש שמפנה לקונפיגורציות משנה.

---

## tsconfig app — ידוע מהחומרים

תצורה עבור קוד האפליקציה תחת `src`:

- target: ES2020
- module: ESNext
- moduleResolution: bundler
- jsx: react-jsx
- alias: `@/* -> ./src/*`
- types: `vitest/globals`
- strict: false
- noImplicitAny: false
- strictNullChecks: לא מחמיר לפי root config

משמעות: קוד האפליקציה נוח לפיתוח Lovable, אך לא מחמיר טיפוסית.

---

## tsconfig node / vite — נמסר כעת

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

משמעות מקצועית:

- קובץ `vite.config.ts` נבדק ב־TypeScript מחמיר יותר מהאפליקציה.
- `strict: true` חל רק על קובצי include של קונפיגורציית node, כרגע `vite.config.ts`.
- אין להסיק מכך שכל קוד `src` מחמיר; קוד האפליקציה עדיין מתועד כלא מחמיר לפי החומרים שנמסרו.

---

## מסקנה

הפרויקט משתמש ב־TypeScript במבנה project references סטנדרטי של Vite:

- root tsconfig — מפנה לקבצי משנה.
- app tsconfig — עבור React/Vite app.
- node tsconfig — עבור `vite.config.ts`.

הקשחת TypeScript צריכה להיעשות בזהירות, בשלבים, ולא בבת אחת.

---

## המלצת עבודה

לפני כל שינוי TypeScript משמעותי:

1. לבדוק build קיים.
2. לבדוק lint/test אם קיימים.
3. לא לשנות `strict` של app בלי audit.
4. להוסיף טיפוסים חזקים קודם ל־parsers, adapters ו־API responses.
5. לתעד כל שינוי ב־STATE/evidence-log.md.

---

## סטטוס אמת

```text
TypeScript config knowledge: partial but improving
Root tsconfig: described from user input
App tsconfig: described from user input
Node/Vite tsconfig: described from user input
Full repo verification: not completed
```
