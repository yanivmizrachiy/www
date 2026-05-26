<!-- MTH_SAFE_NEXT_PR_BACKLOG_AFTER_PR168_START -->

# Current safe next PR backlog after PR #168

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

Current progress: **90%**.

Remaining gap (not UI — real blocking items):

1. Live Moodle automation verified (NRPS, AGS, or Moodle WS with real token).
2. Multi-teacher isolation proof in live environment.
3. Release hardening gate review.

Rules:

- Teacher Release remains NO.
- PR #127 remains untouched.
- No SQL.
- No deploy.
- No secrets.
- No .env.
- Do not delete working features.
- Do not recreate completed features.

<!-- MTH_SAFE_NEXT_PR_BACKLOG_AFTER_PR168_END -->
