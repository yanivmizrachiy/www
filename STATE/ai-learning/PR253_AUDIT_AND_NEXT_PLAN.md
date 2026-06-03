# PR #253 — Audit and Next Plan

Updated: 20260603-181927  
PR: https://github.com/yanivmizrachiy/www/pull/253

## החלטה

PR #253 לא הרס את main כי הוא Draft ולא מוזג.  
אבל הוא לא מוכן למיזוג.

## מה בריא

- ניסיון לאחד PRים כפולים.
- ניסיון לנקות UI.
- עבודה כ־Draft.
- אי־נגיעה ב־RLS #215/#127.
- רכיבים עצמאיים כמו StudentAvatar יכולים להיות טובים.

## מה מסוכן

- מחיקות רבות מדי.
- החלפת useImports.tsx עלולה למחוק hooks קיימים.
- החלפת AppSidebar.tsx עלולה למחוק ניווט, session, Moodle connection, שם המוצר המודל החכם.
- החלפת Students.tsx עלולה לפגוע בלוגיקת NRPS/participants breakdown.
- החלפת GradebookImport.tsx עלולה למחוק preflight והגנות ציון חסר אינו 0.
- useLTIContext עלול להיות import לא קיים.

## תוכנית תיקון

לא לתקן את #253 בכוח אם הוא גדול מדי.

עדיף לפתוח PR נקי מ־main:

feat/safe-ui-consolidation-v1

שם:
- מוסיפים StudentAvatar בלבד אם בטוח.
- מוסיפים Skeleton בלי לשבור exports.
- משפרים UI נקודתית.
- לא מוחקים hooks.
- לא נוגעים SQL/env/secrets/Teacher Release/PR #127.

## בדיקות חובה לפני כל מיזוג

- npm run check
- npm run build
- npm run doctor
- npm run typecheck
- audits קיימים בריפו
- בדיקה ידנית של דפים מרכזיים
