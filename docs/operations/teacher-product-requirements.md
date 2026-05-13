# Teacher Product Requirements - Moodle Teacher Hub

Status: 2026-05-13 - sourced from teacher requirements session
Source of truth: this file + PROJECT_RULES.md

## Vision

Each teacher gets one Cartridge link. Uploads it once to Moodle.
From that moment: teacher clicks External Tool, enters premium dashboard,
and sees ALL real data of their course automatically.

## Core Principles

1. Truth only - no demo, no fake data, no dummy buttons.
2. Maximum automation - teacher clicks one button, system pulls everything.
3. Transparent blockers - if blocked, clear reason and next steps.
4. Full RTL Hebrew + premium design - no technical jargon for teacher.
5. Multi-teacher isolation - teacher A never sees teacher B's data.

## Main Dashboard

### Header
- Teacher name (from LTI launch)
- Course name (from context_title)
- Connection status (green/yellow/red)
- Last update time
- `Sync Course` button (auto-sync)

### 8 Large Navigation Buttons

| Button | Content | Data Source |
|---|---|---|
| Participants | Student list, search, filter, student card | NRPS / Participants import |
| Tasks | List by chapters, task types | Activity Completion / resources |
| Chapters | Course hierarchy | Course structure (sections) |
| Grades | Real gradebook, averages, breakdowns | AGS / Gradebook import |
| Activity & Time | Practice time per student | Logs import |
| Reports | 4 reports: daily, gaps, student, task | Calculated |
| Import | Smart wizard for Moodle reports | Manual fallback |
| Settings | Connection, permissions, diagnostics | env status |

## Student Card (NEW)

Route: /students/:id

- Full name, email, role
- **Practice time accumulated per day** (from log_events) - HH:MM format
- **Averages**: per task, per chapter, course-wide
- **Chart**: ups/downs last 7/30 days
- **Task list**: completed / not completed / not attempted

## Task Screen

Route: /tasks/:id

- Average grade on task
- Submission counts (% of class)
- Average time on task
- Grade distribution chart
- Student list: grade + status

## Chapter Screen

Route: /chapters/:id

- Chapter title + all tasks (cards)
- **Chapter average** = average of task averages in chapter
- Completion percentage
- Average practice time
- Per-student progression chart

## Real Calculations - No Estimation

### Practice Time

From log_events: GROUP BY user_id, DATE(timestamp).
Sliding window: each log event adds 1 minute,
max 5 minutes between consecutive events, else new session.
Format: HH:MM (not decimal!)

### Task Average

AVG(grade_results.grade) WHERE task_id = X
Returns: { average: 87.5, count: 24, max_possible: 100 }

## Premium Design

### Colors
- Primary: #0F4C75 (deep blue)
- Accent: #FFD700 (gold)
- Success: #4CAF50
- Warning: #FF9800
- Error: #F44336
- BG light: #F5F7FA
- BG dark: #1A2332

### Typography
- Font: Heebo (Hebrew-optimized)
- Heading: 24-32px bold
- Body: 16px regular

## Teacher Installation (Cartridge)

### LTI 1.1 Cartridge XML
Path: /public/cartridge.xml (created by this PR)

## Capability Detector

After each launch, system checks:

| Capability | Check | If Available | If Blocked |
|---|---|---|---|
| NRPS | GET /lineitems via LTI 1.3 | auto roster | manual Participants |
| AGS | GET /scores via LTI 1.3 | auto grades | manual Gradebook |
| Web Services | check MOODLE_WS_TOKEN env | full sync | manual only |
| Activity logs | scrape Moodle reports | auto practice time | manual log upload |

## What Is Forbidden Until Verified

- No grade display without real grade_results row
- No practice time without real log_events rows
- No student without real students row
- No Teacher Release = YES

## What Is Allowed Now

- Empty states with clear messages
- Manual import of Participants/Gradebook/Logs
- Calculations from imported data
- Aggregate diagnostics without PII
