# HISTORICAL SNAPSHOT — backlog after PR #168

> המסמך הזה נשמר לצורך היסטוריה בלבד. הוא **אינו** backlog נוכחי ואינו מקור אמת.  
> ל-Teacher Hub יש לפעול לפי `PROJECT_RULES.md`; ל-Guide לפי `PROJECT_MEMORY.md`; גבול הריפו מוגדר ב-`RULES.md`.

<!-- MTH_SAFE_NEXT_PR_BACKLOG_AFTER_PR168_START -->

## Safe next PR backlog as recorded after PR #168

Do not repeat completed work from that historical point:

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

Historical progress at that point: **90%**.

Remaining gap recorded at that time:

1. Live Moodle automation verified (NRPS, AGS, or Moodle WS with real token).
2. Multi-teacher isolation proof in live environment.
3. Release hardening gate review.

Historical rules recorded at that point:

- Teacher Release remains NO.
- PR #127 remains untouched.
- No SQL.
- No deploy.
- No secrets.
- No .env.
- Do not delete working features.
- Do not recreate completed features.

<!-- MTH_SAFE_NEXT_PR_BACKLOG_AFTER_PR168_END -->
