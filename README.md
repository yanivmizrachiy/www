# Moodle Teacher Hub

מוצר אמיתי למורים מתוך Moodle באמצעות LTI 1.1, עם Dashboard בעברית מלאה, RTL, API פנימי, דוחות, יצוא וארגון ריפו לקראת הרחבות עתידיות.

## מקור אמת דרישות וכללים
- `docs/product/rules.md` — דף הכללים המלא והמעודכן (מה חייבים לבנות, מה קיים, מה חסר, מה אסור ומה מתוכנן).

## עקרונות
- לא דמו
- לא נתונים מומצאים
- לא לשבור מה שכבר עובד
- Launch דרך Moodle הוא נקודת הכניסה
- נתונים אמיתיים יגיעו מ-Moodle Web Services / APIs
- UI נפרד מלוגיקה העסקית

## קיים כרגע
- Node.js + Express
- `/lti/launch-1p1`
- `/health`
- Dashboard בעברית
- `data/store.json`
- API בסיסי:
  - `/api/bootstrap`
  - `/api/launches`
  - `/api/students`
  - `/api/tasks`
  - `/api/grades`
  - `/api/activity`
  - `/api/settings`
  - `/api/moodle-summary`
  - `/api/moodle-captures`
  - `/api/export/grades.csv`

## הרצה
```bash
npm install
npm run check
npm run dev
```

## בדיקות ידניות
- `http://127.0.0.1:3000/health`
- `http://127.0.0.1:3000/dev/login`

## מבנה
- `src/server.js` — שרת ראשי
- `src/ui/dashboard/dashboard.html` — דשבורד
- `docs/` — החלטות, פריסה, API ומוצר
- `data/store.json` — אחסון מקומי זמני
- `docs/product/rules.md` — דף כללים ומדיניות מוצר
