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

## עדכון אוטומטי נוסף

בוצע תיקון בטוח ב־PR #254:

- הסקריפט `scripts/audit-pr253-safe-consolidation.ps1` הומר למחרוזות ASCII/English בלבד בתוך קוד PowerShell.
- מטרת התיקון: למנוע שגיאות parser שנגרמו מקידוד עברית בתוך script.
- אין שינוי בקוד המוצר.
- אין שינוי SQL/RLS/env/secrets.
- Teacher Release נשאר NO.
- PR #127 לא נוגע.

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

## חסמים ידועים שאינם נגרמים מ־PR #254

מהריצה המקומית האחרונה:

- check עבר.
- build עבר.
- doctor עבר.
- audits עברו.
- typecheck נכשל בקבצים קיימים: AppLayout.tsx, ChapterDetail.tsx, GradebookImport.tsx, Tasks.tsx.

המשמעות: PR #254 הוא תיעוד/כלים בלבד, אבל לפני הכרזת יציבות מלאה צריך לפתור את typecheck בנפרד.
