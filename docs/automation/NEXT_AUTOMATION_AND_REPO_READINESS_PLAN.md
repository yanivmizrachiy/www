# Next Automation & Repo Readiness Plan

Updated: 2026-05-24  
Teacher Release: **NO**

## Current automation status per domain

| Domain | Level | Status | What's needed to advance |
|---|---|---|---|
| LTI context (teacher + course) | AUTO ✓ | Working | Nothing — keep stable |
| Participants (manual import) | AUTO ✓ | Working | Nothing — keep stable |
| Gradebook (manual import) | AUTO ✓ | Working | Nothing — keep stable |
| Logs (manual import) | SEMI_AUTO | Working — no duration field | Nothing until official duration source exists |
| Course Structure / Activity Completion | BLOCKED | Page exists, backend endpoint MISSING | Implement `/api/import/course-structure` endpoint |
| NRPS (auto participants) | BLOCKED | Claims absent from live launch | Moodle admin must enable LTI Advantage services |
| AGS (auto grades) | BLOCKED | Claims absent from live launch | Moodle admin must enable LTI Advantage services |
| Moodle Web Services | BLOCKED | Token not configured | See admin checklist below |
| Auto sync (full) | BLOCKED | Depends on WS + multi-teacher isolation | After WS verified + isolation validated |
| Teacher Release | BLOCKED | Depends on all above | After all gates pass |

---

## Automation expansion — order of operations

### Phase 1 — Unblock with existing launch (no admin needed)

1. **Implement `/api/import/course-structure` backend endpoint**
   - Page: `/course-structure-import` already exists
   - Parsing logic: partially in place
   - Missing: POST handler in `src/server.js`
   - This unblocks Course Structure and Activity Completion

### Phase 2 — Moodle Web Services first probe

Prerequisite: Moodle admin completes the checklist below.

2. **Verify `GET /api/automation/moodle-webservices/readiness` returns `verified_site_info`**
   - Endpoint already implemented (2026-05-24)
   - Status will be `missing_env` until token is set in Render
   - Record evidence in `STATE/evidence-log.md` when verified

### Phase 3 — Expand Web Services (after Phase 2 verified)

Each function expansion requires:
- Verified evidence of Phase 2
- A new safe probe implementation
- Audit script verifying no PII leaked
- Evidence recorded in `STATE/evidence-log.md`

Order:
3. `core_enrol_get_enrolled_users` → auto participants (replaces manual Participants import)
4. `gradereport_user_get_grade_items` + `core_grades_get_grades` → auto grades
5. `core_course_get_contents` → auto course structure
6. `core_completion_get_activities_completion_status` → auto activity completion

### Phase 4 — NRPS / AGS (if Moodle enables LTI Advantage)

If NRPS claims appear in live launch payload:
- `core_webservice_get_site_info` already verified
- NRPS: auto participants list (names + roles)
- AGS: auto grade line items

This is parallel to Phase 3, not a replacement.

### Phase 5 — Background sync

Only after:
- At least one Phase 3 function is live-verified
- Multi-teacher isolation is proven
- Teacher Release gate is reviewed

---

## Moodle admin checklist — what IT needs to do

These steps must be done by a Moodle site administrator. Do NOT ask the teacher or developer for passwords/tokens.

### Enable Web Services
```
Moodle Site Administration
  > Advanced features
  > Enable web services: YES (toggle on)
```

### Enable REST protocol
```
Moodle Site Administration
  > Plugins
  > Web services
  > Manage protocols
  > REST protocol: Enable
```

### Create a dedicated web service user
- Create a Moodle user (e.g. `mth-webservice-user`)
- Assign system role: `Web services`
- Assign capability: `moodle/webservice:createtoken`

### Create a token
```
Moodle Site Administration
  > Plugins
  > Web services
  > Manage tokens
  > Add token
  > User: mth-webservice-user
  > Service: select or create a service with core_webservice_get_site_info
```

### Set token in Render
- Go to Render dashboard → www service → Environment
- Add: `MOODLE_WS_TOKEN=<token value>`
- Never commit token to GitHub

### Verify
```
GET https://www-tijc.onrender.com/api/automation/moodle-webservices/readiness
Expected: { "status": "verified_site_info", "verified": true }
```

Record result in `STATE/evidence-log.md`.

---

## What blocks Teacher Release

1. `course_structure_or_activity_completion_full_verification` — Course Structure import not complete
2. `moodle_ws_token_missing_in_render` — Web Services not yet verified
3. `nrps_ags_live_claim_validation` — NRPS/AGS claims absent from live launch
4. `multi_teacher_or_multi_course_isolation` — not yet tested with second teacher/course
5. `teacher_release_final_gate` — requires all above

---

## Protected pipelines — do not touch

- Participants import
- Gradebook import
- Logs import
- LTI launch flow
- Practice time truth gate
- Supabase migrations
- Teacher Release gate

---

## Next audit commands

```bash
npm run audit:moodle-automation
npm run audit:moodle-webservices-readiness
npm run audit:multi-teacher-safety
npm run audit:deep-launch-context
npm run audit:lti-probes
npm run doctor
npm run check
npm run typecheck
```
