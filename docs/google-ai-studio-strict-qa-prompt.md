# Google AI Studio Strict QA Prompt — Moodle Teacher Hub

פרומפט בדיקות מחמירות ל־Google AI Studio / Gemini. המטרה: לוודא שכל הדרישות של יניב מתקיימות, ובעיקר שהמורה עושה מינימום פעולות בתוך Moodle כדי לקבל מקסימום מידע אמיתי באפליקציה, בלי Web Services token, בלי דמו, ובלי כפתורים מזויפים.

---

```text
You are now acting as a strict QA auditor, product architect, Moodle workflow analyst, and senior full-stack engineer for the existing project:

Moodle Teacher Hub

Canonical repo:

yanivmizrachiy/www

This is not a new build task.
This is a strict verification task.
Do not create a new app.
Do not rewrite from scratch.
Do not invent missing data.
Do not claim success without proof.

Your job is to verify whether the current repo satisfies all user requirements, especially the requirement that every teacher performs the minimum possible manual actions inside Moodle to receive the maximum possible real data in the app.

==================================================
1. READ FIRST
==================================================

Read these files first:

- PROJECT_RULES.md
- docs/lovable-handoff-report.md
- docs/google-ai-studio-execution-prompt.md
- docs/data-acquisition-and-teacher-workflows.md
- docs/lti-contract.md
- docs/import-contract.md
- docs/moodle-api-contract.md
- docs/system-rules.md
- docs/work-plan.md
- docs/requirements.md
- STATE/project-status.md
- STATE/evidence-log.md
- STATE/gemini-ai-studio-run-2026-04-28.md

PROJECT_RULES.md is the highest source of truth.

If any file or code conflicts with PROJECT_RULES.md, mark it as a contradiction.

==================================================
2. STRICT TRUTH RULES
==================================================

No demo data.
No fake students.
No fake grades.
No fake tasks.
No fake activity.
No fake practice time.
No fake Moodle API connection.
No fake live sync.
No fake connected buttons.
No fake export buttons.
No fake Moodle write-back.
No Moodle username/password form.
No scraping Moodle credentials.
No secrets in GitHub.
No private student files in GitHub.

If something is missing, it must be shown as missing.
If something is blocked because there is no Moodle Web Services token, it must be shown as blocked.
If something is calculated from logs, it must be labeled as calculated/estimated from logs.
If something requires another Moodle report, the UI must say exactly which report is needed.

==================================================
3. CENTRAL QA QUESTION
==================================================

For every feature, answer:

What is the minimum action a teacher must do inside Moodle to get this information into the app?

For each data domain, determine:

1. Can the app get it automatically through LTI context only?
2. Can the teacher export it from Moodle?
3. Can the teacher copy/paste it from Moodle?
4. Can the app auto-detect the report type?
5. Can the app auto-map columns?
6. Can the app validate the data before saving?
7. Can the app show a preview before import?
8. Can the app reduce teacher effort further without lying about API access?
9. What exact Moodle report is required if the data is missing?
10. What exact Hebrew empty/blocked message should appear?

==================================================
4. DATA DOMAIN TEST MATRIX
==================================================

Create a QA matrix for each domain:

A. LTI / teacher context
B. Students / Participants
C. Grades / Gradebook
D. Tasks
E. Chapters / Topics
F. Activity completion
G. Logs / activity events
H. Daily practice time
I. Reports
J. CSV export
K. XLSX export
L. PDF / print export
M. Moodle Web Services API
N. Moodle write-back / editing
O. Setup / installation link for teachers

For each domain, report:

- Required user requirement
- Current implementation status: verified / partial / missing / blocked / contradiction
- Current files involved
- Real Moodle source
- Minimum teacher action
- What the app automates
- What remains manual
- Whether UI explains missing data truthfully
- Whether button/route exists
- Whether button actually works
- Build/runtime dependency
- Evidence found
- Exact fix required

==================================================
5. MINIMUM TEACHER ACTION REQUIREMENT
==================================================

For each Moodle data type, propose the best practical workflow with the fewest teacher steps.

Students:
- Preferred: use Gradebook export if it already contains students, so teacher does not need separate Participants export.
- Alternative: Participants export.
- App must detect and normalize students automatically.

Grades:
- Preferred: one Gradebook Excel/CSV export.
- App must auto-detect grade columns.
- Missing grades must remain missing, not zero.
- Date filtering only if the imported report has real timestamps.

Tasks and chapters:
- Preferred: Activity completion report if it contains tasks/sections.
- Alternative: copied course activity table.
- App must group tasks by real chapter/section.
- Tasks without section must go to “ללא פרק”.
- No question count unless real source includes it.
- No copy-link button unless real URL exists.

Activity and daily practice time:
- Preferred: Logs export for selected date range.
- App must map log rows to imported students.
- App may calculate session windows from timestamps using a documented gap rule.
- App must label this as calculated from logs, not official duration.
- If no logs exist, show “לא ניתן לחשב ללא לוגים”.

Reports:
- Reports must be generated from imported real data only.
- If data is missing, the report must instruct which Moodle export is needed.

Export:
- CSV may work first.
- XLSX only if real xlsx writing is implemented and tested.
- PDF only if real PDF generation exists or clearly says browser Save as PDF.

==================================================
6. ROUTE AND BUTTON QA
==================================================

Verify every route:

- /
- /lti
- /install -> /setup
- /auth -> /setup
- /login -> /setup
- /signup -> /setup
- /sites
- /students
- /students/:id
- /tasks
- /chapters
- /chapters/:sectionId
- /grades
- /activity
- /reports
- /reports/students
- /reports/tasks
- /reports/days
- /reports/gaps
- /export
- /settings
- /import
- /setup
- * -> NotFound

For each route:

- Does it render?
- Is it Hebrew RTL?
- Does it use real data or truthful empty state?
- Does it avoid fake counters?
- Are all buttons functional?
- Does it avoid direct raw imported table access from pages if RPC/hooks/adapters exist?

==================================================
7. BUILD QA
==================================================

Run or verify:

- npm install
- npm run build

If build fails:
- Do not continue to feature QA as if everything works.
- Record the exact error.
- Identify the file and dependency causing it.

Known risks:
- lovable-tagger must not be required outside Lovable.
- SWC may fail in Termux due to native binding.
- Vite 5 must not use plugin-react version that requires Vite 8.

==================================================
8. SUPABASE / LTI QA
==================================================

Verify code/documentation for:

- lti-launch
- lti-config
- import-moodle-report
- moodle-probe
- moodle-proxy
- site-admin
- lti_get_context
- lti_get_imports_overview
- lti_list_students
- lti_get_grades_matrix
- lti_get_course_structure
- lti_get_activity_overview
- lti_get_daily_activity
- lti_get_student_reports
- lti_get_task_completion_detail
- lti_get_practice_time
- lti_get_student_profile
- lti_delete_batch

Do not claim real LTI verified unless there is evidence of a real launch from Moodle.
Do not claim Moodle API verified unless there is a real Web Services token and successful API response.
Do not run Supabase SQL automatically unless explicitly instructed.

==================================================
9. GEMINI / AI STUDIO OUTPUT QA
==================================================

Review STATE/gemini-ai-studio-run-2026-04-28.md.

Gemini previously worked in repo_temp and did not push to GitHub.

Therefore:
- Treat AI Studio build as useful but not canonical.
- Do not mark repo as fixed until changes are actually in yanivmizrachiy/www.
- Do not accept “Built” unless npm run build passes on the canonical repo or a synced branch.

==================================================
10. REQUIRED OUTPUT
==================================================

Produce a strict QA report with these sections:

1. Executive verdict:
   - Ready / Not ready / Partially ready
   - Overall percentage ready
   - What is blocking the next percentage jump

2. Requirement coverage table:
   - requirement
   - status
   - evidence
   - missing/fix

3. Minimum teacher action table:
   - data type
   - current minimum teacher action
   - better possible automation
   - exact UI instruction needed

4. Route/button QA table.

5. Build QA result.

6. LTI/API QA result.

7. Data import QA result.

8. Export QA result.

9. Contradictions found.

10. Dangerous items not to merge.

11. Exact next fixes in priority order.

12. Files that must be changed.

13. Files that must not be touched.

14. Clear final statement:
   - What works now
   - What is still not verified
   - What is blocked because there is no Moodle Web Services token
   - What the teacher still has to do manually

Do not write a marketing summary.
Do not say production ready unless fully verified.
Do not hide failures.

Start the strict QA now.
```
