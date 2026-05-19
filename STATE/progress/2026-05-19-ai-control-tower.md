# Progress — AI Control Tower foundation

Date: 2026-05-19
Type: docs and checks only — no runtime code changed
Teacher Release: **NO**

---

## Why this was created

Previous sessions showed that Claude operated without a clear Work Order
system. GPT's role as project manager and Claude's role as coding agent
were not formally defined, which led to scope drift, repeated practice-time
gate attempts, and duplicate PRs.

This control tower formalises the split so every future Claude session
starts with a concrete, bounded Work Order instead of a broad prompt.

---

## How GPT and Claude split work

| Responsibility | GPT | Claude |
|----------------|-----|--------|
| Project memory and decisions | ✓ | — |
| Writing Work Orders | ✓ | — |
| Reviewing PRs | ✓ | — |
| Keeping PROJECT_RULES and STATE | ✓ | — |
| Multi-file implementation | — | ✓ |
| Build fixes and UI/backend work | — | ✓ |
| Opening PRs | — | ✓ |
| Approving and merging | — | Yaniv only |

---

## Next epic

**Course Structure & Activities Import V1**

Work Order: `WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md`

Goal: teacher can upload a Moodle course structure / activity completion
report and see real course sections and activities in the `/tasks` view.

---

## What was done in this session

- Created `docs/AI_CONTROL_TOWER.md` — role definitions and automation ladder.
- Created `WORK_ORDERS/CLAUDE_COURSE_STRUCTURE_ACTIVITIES_V1.md` — next Claude task.
- Created `scripts/checks/ai-control-tower-sanity.cjs` — verifies foundation files.
- Created this progress file.

No runtime code was changed. No imports were modified. No Supabase changes.
No LTI changes. Teacher Release remains NO.

---

## Remaining blockers before Teacher Release YES

1. Course Structure / Activity Completion import (Level 2).
2. Multi-teacher / multi-course isolation validated.
3. Teacher Release final gate.
