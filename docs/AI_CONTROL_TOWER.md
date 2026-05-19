# AI Control Tower — Moodle Teacher Hub

## Purpose

Defines how GPT, Claude, and Yaniv divide work so the project advances
safely without duplication, drift, or loss of truth.

---

## Role: GPT

- Project manager and architect.
- Keeper of `PROJECT_RULES.md` and `STATE/`.
- Writes and updates Work Orders for Claude.
- Reviews Claude PRs before Yaniv approves.
- Maintains memory of decisions, blockers, and completed gates.
- Does NOT write multi-file implementation code.
- Does NOT open PRs.

---

## Role: Claude

- Heavy coding agent only.
- Executes one Work Order at a time.
- Reads `PROJECT_RULES.md` and `STATE/` before touching any code.
- Does multi-file implementation, build fixes, UI and backend work.
- Runs `npm run check`, `npm run build`, `npm run doctor` before opening PR.
- Opens exactly one PR per Work Order and stops.
- Does NOT manage memory across sessions.
- Does NOT rewrite the app or start over.
- Does NOT deviate from the Work Order scope.

---

## Role: Yaniv

- Minimum manual work.
- Approves PRs only after GPT review confirms correctness.
- Provides real Moodle exports when a Work Order requires them.
- Final authority on Teacher Release YES.

---

## Role: GitHub

- Single source of truth for all code, state, and docs.
- All AI work must land in a PR and be merged to `main`.
- No work is "done" until it is in `main` and CI is green.

---

## Maximum Moodle Automation Ladder

| Level | Capability | Status |
|-------|-----------|--------|
| 1 | LTI launch, Participants, Gradebook, Logs, Supabase, Dashboard | Partial — imports done, dashboard live |
| 2 | Course Structure / Activity Completion import | Next epic |
| 3 | Smart Moodle report detection and auto-mapping | Planned |
| 4 | Moodle Web Services (requires real verified token + permissions) | Blocked — no token |
| 5 | Teacher Release after isolation and live validation | Blocked — gates not passed |

### Rules for Level 4 and 5

- Level 4 unlocks only when a real, verified Moodle Web Services token exists
  and a live API call is confirmed and recorded in `STATE/evidence-log.md`.
- Level 5 (Teacher Release YES) unlocks only after:
  1. Multi-teacher / multi-course isolation validated.
  2. Live launch evidence recorded.
  3. Final release gate passes.
  4. GPT and Yaniv both approve.

---

## Work Order Protocol

1. GPT writes a Work Order in `WORK_ORDERS/`.
2. Claude reads the Work Order, reads `PROJECT_RULES.md` and `STATE/`, then executes.
3. Claude runs checks and opens one PR.
4. GPT reviews the PR diff.
5. Yaniv approves and merges.
6. GPT updates `STATE/` and writes the next Work Order.

---

## Absolute Prohibitions (any role)

- No fake data, demo data, or invented time.
- No raw student rows committed to GitHub.
- No secrets or tokens in any file.
- No Teacher Release YES without passing all gates.
- No rewriting the app from scratch.
- No bypassing CI checks.
