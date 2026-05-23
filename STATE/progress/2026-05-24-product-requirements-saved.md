# Progress — 2026-05-24: Product Requirements Saved to Repo

## What was done

All product requirements were documented and committed to the repository.
This ensures that any future AI or developer working on the repo has the full product vision,
not just technical spec.

## Files changed in this session

### Documentation updates

| File | What was added |
|---|---|
| `RULES.md` | Product definition, UI date format rule, homepage rules, student list privacy rules, navigation rules |
| `PROJECT_RULES.md` | Full 17-section product requirements block (sections 1–17) |
| `docs/automation/NEXT_AUTOMATION_AND_REPO_READINESS_PLAN.md` | NEW — full automation roadmap, admin checklist, phase plan, Teacher Release blockers |
| `docs/automation/SAFE_NEXT_PR_BACKLOG.md` | NEW — 8 ordered safe PRs with files, rules, audit commands |
| `docs/automation/MOODLE_WS_READINESS_V1.md` | NEW — readiness endpoint documentation |
| `STATE/progress/2026-05-24-moodle-ws-readiness-endpoint.md` | NEW — WS endpoint progress |
| `STATE/progress/2026-05-24-product-requirements-saved.md` | This file |

### Code changes (same session)

| File | What changed |
|---|---|
| `src/server.js` | Added `GET /api/automation/moodle-webservices/readiness` endpoint |
| `scripts/checks/moodle-webservices-readiness.cjs` | NEW — 15-check audit script |
| `package.json` | Added `audit:moodle-webservices-readiness` script |
| `.env.example` | Added `MOODLE_WS_TOKEN`, `MOODLE_WS_BASE_URL` documented |
| `src/components/PracticeTimeSection.tsx` | TypeScript fix: `exportToCsv` → `downloadCsv` |
| `src/hooks/useLtiSession.ts` | TypeScript fix: intermediate `unknown` cast |

## Product requirements now saved in repo

1. What the product IS — Action Hub for teacher in Hebrew RTL
2. Homepage requirements — teacher name (clickable), space name, student count, action buttons
3. Teacher profile screen — only real LTI/session data
4. Teachers list — per-space only, explain missing NRPS
5. Students list — name only in simple list (no TZ, no email, no IDs)
6. Grades — real sources only, missing stays missing (never → 0)
7. Practice time — no invented duration, blocked message required
8. Manual reports — fallback only, not the vision
9. Automation order — LTI → NRPS → AGS → WS (each step requires evidence)
10. Web Services — no secrets from user, readiness endpoint + admin checklist
11. Privacy — full list of what never to expose
12. Truth rules — full list of what is never allowed
13. Data isolation — no mixing courses / teachers / institutions
14. Date format — `D/M/YY` in UI only
15. Navigation — full Hebrew nav required on all screens
16. Protected pipelines — Participants / Gradebook / Logs / LTI / Supabase / Teacher Release
17. Safe PR backlog — 8 next PRs in priority order

## Checks run

```
npm run check               → OK
npm run doctor              → REPO_DOCTOR_OK
npm run typecheck           → 0 errors
npm run audit:moodle-webservices-readiness → 15/15 OK
npm run audit:multi-teacher-safety → OK
```

## Teacher Release

Remains **NO**.

## Protected pipelines — unchanged

- Participants import ✓
- Gradebook import ✓
- Logs import ✓
- LTI launch ✓
- Supabase migrations ✓ not touched
- Teacher Release gate ✓ NO
