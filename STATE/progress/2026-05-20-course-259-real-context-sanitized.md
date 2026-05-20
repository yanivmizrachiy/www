# Progress — Real Moodle course context, sanitized

Date: 2026-05-20  
Source: user-provided diagnostic/research report from the real Moodle course where Teacher Hub is installed.  
Privacy: sanitized / aggregate only. No student names, emails, phone numbers, raw rows, Moodle exports, or private files are committed.  
Teacher Release: **NO**

## Why this matters

This report confirms that the project is connected to a real Moodle course context, not a demo scenario.

It provides useful product and automation evidence:

- There is a real Moodle course ID.
- There is a real course structure.
- There are real activity types.
- There are real Moodle report paths that can guide imports and automation.
- The Teacher Hub LTI tool has real usage inside the Moodle course.
- There are concrete blockers for full automation.

This file intentionally avoids raw personal data.

## Course context

| Field | Value |
|---|---|
| Course name | ספר המודל - חלק ג' |
| Course ID | `259` |
| Institution/context | תיכון טדי קולק, פסגת זאב |
| Domain | Mathematics: algebra, quadratic function, geometry, probability |
| Platform | Moodle, Israel Ministry of Education |
| Report timestamp | 2026-05-20 18:20 |

## Course structure / topics

Main topic areas reported:

1. Main course area
2. Quadratic function
3. Algebra
4. From properties to graph and back
5. Geometry
6. Probability
7. Summary tasks
8. Additional topics

Additional sections reported:

- General
- Tools, software and technology
- Teacher resources
- Additional numbered sections

## Activity types reported

| Activity type | Approximate count / signal |
|---|---|
| Quizzes | 27+ parabola quizzes/pages |
| H5P interactive content | 3+ |
| Designed pages/applets | 2+ |
| URL/external links | 3 |
| Forum | 1 |
| External LTI tools | 2 Teacher Hub instances |
| Assignment | 1 summary/recommended tasks item |

## Participants and engagement — aggregate only

Reported participants: `62`.

Reported role split:

- Students: about 60+.
- Teacher/instructor: at least 1.
- Additional course-request/context role: at least 1.

Reported engagement distribution:

- Active within about 14 days: approximately 35–40 students.
- Active within about 15–45 days: approximately 10–12.
- Inactive for 45+ days: approximately 8–12.

Important privacy note: the original report contained individual names and risk notes. Those are intentionally not stored in GitHub.

## Completion report signal

The report indicates that Activity Completion / Progress tracks about 27 parabola quiz completion points.

Reported condition: completion depends on achieving a passing quiz grade.

This directly supports the Course Structure / Activity Completion workstream and should guide future parser validation.

## Outline / usage signal

Reported activity usage includes:

- Summary tasks: 24 views by 14 users.
- Teacher Hub instance in section 4/5: 113 views.
- Teacher Hub instance in general section: 8 views by 1 user.
- Forum: 3 views by 2 users.
- Designed parabola applet: 32 views.
- H5P factorization: 2 views.

Important product signal:

Teacher Hub is not just installed; it has meaningful observed usage in the real course.

## Logs signal

Reported Moodle logs:

- Approximately 901 pages × 20 rows = about 18,000 visible/report rows in the explored report mode.
- Timeline from course restoration/start in 2025-08-26 through 2026-05-20.
- Action types include views, quiz attempts, grade updates, restore actions, and report views.

Important note:

This report-level estimate differs from the repository's previously verified imported log count (`log_events_written=89995`). This difference may be caused by report filters, pagination mode, import scope, or different export/report formats. Do not overwrite verified imported counts without a direct evidence check.

## Gradebook/export capabilities

Reported Gradebook export options from Moodle:

- CSV/plain text
- Excel/XLSX
- JSON
- ODS
- HTML
- PDF

This is strong evidence that Smart Import should support multiple export formats and not rely on only one file type.

## Connection and automation blockers confirmed by course report

- `MOODLE_WS_TOKEN` is still missing.
- Web Services automatic sync remains blocked.
- Course/report paths are real targets, but they are not proof of API sync.
- Full automatic extraction without teacher action remains blocked until a verified token/API path exists.

## Product implications

This report helps the project in the following concrete ways:

1. Confirms real Course ID `259` can be used for live validation.
2. Confirms `/automation` and report-target links should be tested against course `259`.
3. Confirms Activity Completion / Progress is a high-value next import source.
4. Confirms the course has enough quizzes and completions to justify a robust tasks/progress dashboard.
5. Confirms Smart Import should support Gradebook exports in CSV/XLSX/JSON/ODS/HTML/PDF where feasible.
6. Confirms Teacher Hub usage is visible in Moodle outline reports.
7. Confirms privacy controls are mandatory because reports may include identifiable student risk data.

## What still must be verified live

- Open Teacher Hub from inside Moodle course `259` as an External Tool.
- Confirm LTI session becomes available.
- Confirm Course ID is detected as `259` by `/api/automation/capabilities`.
- Confirm teacher/course identity appears only when launched from Moodle.
- Confirm `/api/automation/export-links` returns report target paths only after Course ID detection.
- Confirm whether NRPS/AGS service claims are available in the live launch.
- Confirm whether an authorized Moodle Web Services token can be obtained and configured outside GitHub.
- Confirm whether Activity Completion report can be imported into `course_sections`, `course_tasks`, and/or `task_completions`.

## What must not happen

- Do not commit raw Moodle exports.
- Do not commit student names, emails, phone numbers, or risk tables.
- Do not expose individual student risk information in public diagnostics.
- Do not treat report paths as API sync.
- Do not mark Teacher Release YES.
- Do not claim Web Services automation until a live API call is verified and recorded.
