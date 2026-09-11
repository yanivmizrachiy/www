<!-- BACKLOG_STATUS_20260911_START -->
> **Historical Teacher Hub backlog snapshot.**
>
> הקובץ מתעד backlog מתקופת PR #168 ואינו מקור האמת הנוכחי לריפו.
> לפני ביצוע משימה יש לבדוק את \PROJECT_MEMORY.md\, \PROJECT_RULES.md\,
> \RULES.md\ ואת \STATE/CURRENT.md\.

<!-- BACKLOG_STATUS_20260911_END -->

# Safe Next PR Backlog — status index

עודכן: 2026-09-10

הקובץ הזה **אינו מקור אמת קנוני** ואינו רשימת המשימות הנוכחית של כל הריפו. הוא snapshot היסטורי של Teacher Hub לאחר PR #168.

למצב הנוכחי:
- מקור אמת ריפו: `PROJECT_MEMORY.md`.
- אמת Teacher Hub מפורטת: `PROJECT_RULES.md`.
- מצב תמציתי: `STATE/CURRENT.md`.
- חוסרי Guide אמיתיים: `docs/GUIDE_MISSING_CAPTURES.md`.

אין להסיק מהמספר "90%" למטה את מוכנות המוצר כיום, ואין להשתמש ב-PR #168 כנקודת HEAD פעילה.

---

<!-- MTH_SAFE_NEXT_PR_BACKLOG_AFTER_PR168_START -->

## Historical snapshot — after PR #168

Do not repeat completed work:

- PR #159: scoped dashboard overview counts to current session.
- PR #160: teacher sidebar final workflow.
- PR #161: teacher-facing Test/LTI label cleanup.
- PR #162: docs sync after PR #161.
- PR #163: unified date/time/duration formatting (formatTeacherDateDmyShort, formatTeacherTime, formatTeacherDateTime, formatTeacherDateFull; fixed duration singular).
- PR #164: /times page — time range report, per-student, Excel.
- PR #165: "פעילויות" nav to /chapters; ChapterDetail due_date + completion counts.
- PR #166: task report — null/false/true distinction + Excel.
- PR #167: Smart Import sends LTI token for session-scoped imports.
- PR #168: dashboard/grades: distinguish loading / no-source / real-zero.

Historical progress at that time: **90%**.

Remaining gap recorded at that time (not UI — real blocking items):

1. Live Moodle automation verified (NRPS, AGS, or Moodle WS with real token).
2. Multi-teacher isolation proof in live environment.
3. Release hardening gate review.

Rules recorded with that snapshot:

- Teacher Release remains NO.
- PR #127 remains untouched.
- No SQL.
- No deploy.
- No secrets.
- No .env.
- Do not delete working features.
- Do not recreate completed features.

<!-- MTH_SAFE_NEXT_PR_BACKLOG_AFTER_PR168_END -->
