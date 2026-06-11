# מפת CI ואימותים — Moodle Teacher Hub

עודכן: 2026-06-12
Teacher Release: **NO**

## פקודות מקומיות קנוניות

| פקודה | תפקיד | Live? |
|---|---|---|
| `npm run check` | maintenance scripts + `node --check src/server.js` | לא |
| `npm run typecheck` | TypeScript project build | לא |
| `npm run build` | Vite production build | לא |
| `npm run doctor` | סריקת קבצים מסוכנים/secrets ומקורות אמת | לא |
| `npm run validate:moodle:static` | סט audits סטטיים של Moodle | לא |
| `npm run validate:moodle:live` | live validation מול runtime | כן |
| `npm run validate:moodle:all` | static ואז live | כן |

אין להריץ live scripts בלי סביבה מוכנה ובלי להבין שהם פונים ל־`https://www-tijc.onrender.com` כברירת מחדל או ל־`MTH_LIVE_BASE_URL`.

## Audits סטטיים קיימים

- `audit:moodle-automation`
- `audit:multi-teacher-safety`
- `audit:deep-launch-context`
- `audit:lti-probes`
- `audit:moodle-webservices-readiness`
- `audit:teacher-date-format`
- `audit:automation-capabilities`
- `audit:automation-capability-contract`
- `audit:automation-evidence-log`
- `audit:auto-extraction-source-router`
- `audit:multi-teacher-isolation-evidence`
- `audit:supabase-rls-isolation-readiness`

Audits אלה לא מוכיחים live data isolation. הם מוכיחים חוזים/קוד/חסמים בלבד.

## Live scripts קיימים

- `validate:lti:live`
- `validate:teacher-release:live`
- `validate:imports:live`
- `validate:finish:live`
- `validate:gradebook:live`
- `validate:gradebook-ui:live`
- `validate:wide-gradebook-ui:live`
- `validate:logs-ui:live`
- `validate:capability-center:live`

תוצאה live חייבת להירשם ב־`STATE/evidence-log.md` או progress doc לפני שמעלים סטטוס.

## GitHub Actions

- `.github/workflows/ci.yml` רץ על PR/push ל־main: install, check, build, doctor.
- `.github/workflows/moodle-automation-safety.yml` רץ על PR ל־main ו־workflow_dispatch: audits Moodle, check, build, doctor.
- `.github/workflows/moodle-teacher-hub-safety-check.yml` הוא workflow ישן שמכוון לענף gemini וכולל references לנתיבי scripts ישנים; לא להסתמך עליו כשער release מודרני בלי עדכון.
- `.github/workflows/build-termux-runtime.yml` מייצר runtime package לענף termux-runtime; אינו שער Teacher Release.
- workflows של `luz-teddy` נפרדים לפי paths ואינם הוכחה או כישלון של Moodle Teacher Hub.
