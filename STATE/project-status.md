# Project Status — Moodle Teacher Hub

Updated: 2026-05-20
Canonical branch: `main`
Live runtime: `https://www-tijc.onrender.com`
Teacher release: **NO**

## Latest progress sync

Full same-day progress details are documented in:

- `STATE/progress/2026-05-19-fast-sync.md`
- `STATE/progress/2026-05-20-moodle-automation-readiness-audit.md`
- `STATE/progress/2026-05-20-moodle-connection-blockers.md`
- `STATE/progress/2026-05-20-course-259-real-context-sanitized.md`
- `STATE/progress/2026-05-20-live-lti-course-259-validation.md`

## Verified real data

- Participants import succeeded: `students=62`.
- Real wide Gradebook import succeeded: `grade_items_written=243`, `grade_results_written=1693`.
- Real Moodle Logs import succeeded: `log_events_written=89995`, `skipped_rows=0`.
- Practice-time truth gate completed safely:
  - `practice_time_available=false`.
  - `blocker_key=NO_DURATION_FIELD`.
  - The Logs report contains no explicit official duration field.
  - Timestamp-window estimation is disabled: `window_estimation_enabled=false`.
  - No fake or invented practice time: `fake_time=false`.

## Verified infrastructure

- Canonical branch: `main`.
- Live release readiness endpoint works.
- Live persistence validation endpoint works.
- Supabase persistence is production-ready.
- Public diagnostics must remain aggregate-only.
- No student rows, grade rows, raw logs, secrets, Moodle exports, or private runtime files may be committed.
- Automation Control Center V1 is merged and live.
- Moodle Automation Readiness Audit exists as `npm run audit:moodle-automation`.

## 2026-05-19 merged work

- PR #99: Moodle capability panel became dynamic and API-backed.
- PR #100: Live validation command added for the dynamic capability center.
- PR #101: Dashboard changed to a clean action-only home hub; explanatory/demo text removed from home.
- PR #102: Dashboard activities count now falls back to real Gradebook items when full task/course structure is still missing.

## 2026-05-20 merged work

- PR #107: Automation Control Center V1 merged.
  - Adds `/automation`.
  - Adds `GET /api/automation/capabilities`.
  - Adds `GET /api/automation/export-links`.
  - Adds safe Hebrew RTL automation status UI.
  - Teacher Release remains **NO**.
- PR #108: Moodle Automation Readiness Audit merged.
  - Adds `npm run audit:moodle-automation`.
  - Adds read-only repo audit for AUTO / SEMI_AUTO / BLOCKED classification.

## Current product truth

- The project is not starting from scratch.
- The real-data pipeline is strong and verified.
- The dashboard is now an action hub, not an explainer page.
- Participants, Gradebook, Logs and Supabase must not be changed unless a verified bug appears.
- Automation Control Center is now available.
- Direct browser access correctly shows not connected.
- Real Moodle launch has now been validated for Course ID `259`.
- Full Moodle Web Services sync is still blocked until a real token is configured outside GitHub and a live API call is verified.

## Current Moodle connection status — 2026-05-20

### Previously identified blockers

| Path | Previous status | Reason |
|---|---|---|
| LTI 1.3 session | missing | No live Moodle LTI launch was active during direct browser/settings check. |
| NRPS / AGS | unavailable | Depends on valid LTI session and service claims. |
| `MOODLE_WS_TOKEN` | missing in Render | Required environment variable is not configured. |
| Names / emails / user IDs through NRPS | unavailable | No live LTI session and no verified Web Services token. |
| Web Services automatic sync | blocked | No token and no live API evidence. |

### Updated live validation result

User opened Teacher Hub from the real Moodle course and fetched `/api/automation/capabilities`.

Verified live result:

```json
{
  "ok": true,
  "connected": true,
  "courseId": "259",
  "courseName": "ספר המודל - חלק ג'",
  "ltiSessionAvailable": true,
  "importsAvailable": {
    "participants": true,
    "gradebook": true,
    "logs": true,
    "courseStructure": false
  },
  "automationLevels": {
    "ltiContext": "available",
    "manualReports": "available",
    "exportLinks": "available",
    "moodleWebServices": "missing",
    "autoSync": "missing"
  },
  "teacherRelease": false
}
```

Interpretation:

- LTI live launch for Course ID `259` is now verified.
- Course context detection works.
- Participants / Gradebook / Logs status is detected as available.
- Export target links are available because Course ID is detected.
- Course Structure / Activity Completion remains not imported.
- Moodle Web Services remain missing.
- Auto Sync remains missing.
- Teacher Release remains **NO**.

Reported services-status facts from earlier diagnostics:

```json
{
  "configured": false,
  "required_env": ["MOODLE_WS_TOKEN"],
  "base_url_host": "moodlemoe.lms.education.gov.il"
}
```

## Not done yet

- Activity Completion / Course Structure import for Course ID `259`.
- Render env configuration for `MOODLE_WS_TOKEN` if a real authorized token is available.
- Verified Moodle Web Services API call.
- NRPS / AGS live service-claim validation from Moodle launch.
- Multi-teacher or multi-course isolation validation.
- Teacher release final gate.
- Real Moodle launch validation with second teacher/course.
- Final teacher release runbook.
- Live visual validation after Render deploy for the latest automation changes.

## Remaining blockers before Teacher Release YES

1. `course_structure_or_activity_completion_full_verification`
2. `moodle_ws_token_missing_in_render`
3. `verified_moodle_web_services_api_call`
4. `nrps_ags_live_claim_validation`
5. `multi_teacher_or_multi_course_isolation`
6. `teacher_release_final_gate`
7. `latest_render_live_validation`

## Current percentages

- Repo / code / automation / documentation: 99%
- Real-data pipeline: 98%
- Dashboard action experience: 95%+
- Automation Control Center: implemented and live; LTI live context verified for Course ID `259`
- Course structure / tasks UX: still needs Activity Completion import and audit/endpoint verification
- Full automatic Moodle sync without teacher file/report action: blocked until token/API/service evidence exists
- Teacher release: **NO**
- Overall verified completion: strong real-data foundation plus live LTI validation, not yet release-complete for every teacher/every course

## Next action

Do not change Participants, Gradebook, or Logs import code unless a verified bug appears.

Next work must focus only on:

1. Import/parse Activity Completion / Progress report for Course ID `259`.
2. Repair automation audit so Course Structure becomes unblocked only after a real verified import/endpoint path exists.
3. Validate `/api/automation/export-links` after Moodle launch for Course ID `259`.
4. Inspect NRPS / AGS claims safely from live LTI context without exposing secrets or raw personal data.
5. Configure `MOODLE_WS_TOKEN` in Render only if a real authorized token exists.
6. Isolation evidence for a second teacher or second Moodle course.
7. Final release gate after isolation evidence exists.

Teacher Release must remain **NO** until these gates pass.
