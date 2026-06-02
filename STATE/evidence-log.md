# Evidence Log — www / Moodle Teacher Hub

לוג הוכחות עבור הריפו `yanivmizrachiy/www`.

הכלל המרכזי: מה שלא מופיע כאן כהוכחה — לא נחשב מאומת.

---

## 2026-05-17 — Practice-time truth gate: blocked NO_DURATION_FIELD

### Verified

- Moodle Logs imported: log_events_written=89995, skipped_rows=0
- Moodle Logs report contains no explicit duration field (checked: duration_seconds, duration, timeDiff).
- `src/practiceTime.js` implements `buildPracticeTimeGate()` — returns `practice_time_available=false` with `blocker_key=NO_DURATION_FIELD` when no duration field present.
- Timestamp-window estimation is disabled (`window_estimation_enabled=false`).
- No fake or invented practice time (`fake_time=false`).
- Teacher Release remains NO.
- STATE recorded in `STATE/teacher-release/practice-time-truth-blocked-no-duration.json`.
- `STATE/teacher-release/current-verified-state-latest.json` updated to mode `practice-time-truth-gate`.
- Build passes: `npm run build` and `npm run check` both green.

### Not verified yet

- Practice time with an official Moodle duration field (requires a different Moodle report or API).
- Multi-teacher or multi-course isolation.
- Teacher release final gate.

---

## 2026-04-27 — Repository governance setup

### Verified

- הריפו `yanivmizrachiy/www` אותר בגיטהאב.
- נמצא `README.md` קיים.
- נמצא `.gitignore` קיים שמחריג `.env`, לוגים, backups, `dist`, `coverage` וקבצי מערכת.
- נוצר/אומת `PROJECT_RULES.md` כמקור אמת עליון.
- נוצר/אומת `docs/system-rules.md`.
- נוצר/אומת `docs/requirements.md`.
- נוצר `STATE/project-status.md`.
- נוצר `STATE/evidence-log.md`.

### Not verified yet

- build מלא.
- הרצת שרת.
- `/health`.
- `/dev/login`.
- `/api/lti/launch` מול Moodle אמיתי.
- חיבור Moodle API חי.
- SSO משרד החינוך מלא.
- ייצוא Excel אמיתי.
- ייצוא PDF אמיתי.
- עריכה דו־כיוונית מול Moodle.

### Current truth status

```text
Repository governance: verified
Product requirements captured: verified
Code/runtime verification: not completed
Production-ready: no
```


## 2026-04-27T23:20:27.269236+00:00 — Termux React shell autofix prepared

- Generated missing safe shell files only when absent.
- No demo data added.
- Build will be attempted by the Termux script after npm install.


## 2026-04-27T23:21:19.193868+00:00 — Termux build attempt

```text
no build log
```


## 2026-04-27T23:24:00.768565+00:00 — Termux React shell autofix prepared

- Generated missing safe shell files only when absent.
- No demo data added.
- Build will be attempted by the Termux script after npm install.


## 2026-04-27T23:24:02.135344+00:00 — Termux build attempt

```text
no build log
```


## 2026-04-27 — User Termux run result

### Verified from user terminal output

```text
commit: 5150d0c Complete safe React shell for Moodle Teacher Hub
push: PUSH_OK
remote: c8f45ad..5150d0c main -> main
BUILD_STATUS=1
PROJECT_PROGRESS=99%
```

### Truth status

- Git push succeeded.
- Build did not pass yet because `BUILD_STATUS=1`.
- The exact build error was not included in the pasted output.
- Next required step: inspect `/tmp/www-build.log` or rerun build and capture full error.

### Not verified yet

- production build success.
- runtime server preview.
- route rendering.
- Moodle/LTI end-to-end launch.

---

## 2026-04-28 — Moodle external tool configuration screenshots

### Observed from user screenshots

- The Moodle host appears to be `moodlemoe.lms.education.gov.il`.
- The user is configuring/opening the external tool inside a real Moodle course/learning space.
- Tool name shown: `Moodle Teacher Hub`.
- Tool URL shown: `https://iibrglxkiszrbzakrnlo.functions.supabase.co/lti-launch`.
- Tool description shown: `כלי לניהול משימות ודוחות`.
- LTI version shown: `LTI 1.0/1.1`.
- Consumer key shown: `yaniv-lti-tool`.
- Shared Secret field exists and is masked. The secret value was not captured and must not be stored in GitHub.

### Observed current app state inside Moodle

- The app/tool appears inside the Moodle course area under the name `Moodle Teacher Hub`.
- A setup/status screen is visible inside the Moodle context.
- Tabs or sections visible include LTI/external-tool rules, settings, Moodle metadata, and additional options.
- The status message indicates the Web Service token is missing/invalid, so live Moodle Web Services access is not available.
- The UI warns that without a Web Service token it cannot show live students/grades from Moodle Web Services.

### Truth status

```text
External tool configuration: observed from screenshots
LTI version: observed as LTI 1.0/1.1
Consumer key: observed
Shared secret: exists but value unknown/not stored
Moodle Web Services token: not available / not verified
Active data mode: Manual Real Data Import + maximum automation from real Moodle reports/tables
Live Moodle API sync: blocked-no-token
```

### Not verified yet

- Successful OAuth signature validation.
- Session token creation from real launch.
- `lti_get_context` success after real launch.
- Live Moodle Web Services/API access.
- Real import of Moodle reports end-to-end.

## AI Studio Sync Update (20260428-193953)
- **Source ZIP**: C:\Users\yaniv\Downloads\moodle-teacher-hub (1).zip
- **Branch**: gemini/ai-studio-sync-20260428-193953
- **Install Result**: SUCCESS
- **Build Result**: SUCCESS
- **Logs**: Located in STATE/gemini-sync/
- **Safety**: No SQL was executed. No Supabase functions deployed. LTI not verified.
- **Notes**: Automated recovery sync from Gemini AI Studio.

## PR Cleanup Update (20260428-200201)
- **Task**: Removed local backup snapshot from PR tracking.
- **Branch**: gemini/ai-studio-sync-20260428-193953
- **Removed**: STATE/gemini-sync/backup-before-sync-20260428-193953
- **Updated .gitignore**: Added pattern for backup exclusions.
- **Build Status**: BUILD_PASSED
- **Install Exit Code**: 0
- **Build Exit Code**: 0
- **Logs**:
  - STATE/gemini-sync/review-npm-install-20260428-200201.log
  - STATE/gemini-sync/review-npm-build-20260428-200201.log
- **Security Check**:
  - No SQL operations performed.
  - No Supabase functions deployed.
  - LTI Signature verification not refreshed from external Moodle.

## PR Cleanup Update (20260428-201923)
- **Task**: Removed local backup snapshot from PR tracking.
- **Branch**: gemini/ai-studio-sync-20260428-193953
- **Removed Folder**: STATE/gemini-sync/backup-before-sync-20260428-193953
- **Updated .gitignore**: Added pattern preservation for future syncs.
- **Build Result**: BUILD_PASSED
- **Audit Logs**:
  - \STATE/gemini-sync/review-npm-install-20260428-201923.log\
  - \STATE/gemini-sync/review-npm-build-20260428-201923.log\
- **Safety Protocol Check**:
  - No SQL operations performed.
  - No Supabase functions deployed.
  - LTI Signature verification not refreshed from external Moodle.

## PR Safety Hardening Update (2026-04-28)
- **Branch**: gemini/ai-studio-sync-20260428-193953
- **PR**: https://github.com/yanivmizrachiy/www/pull/1
- **LTI hardening**: `supabase/functions/lti-launch/index.ts` was changed to a safe blocked implementation. It no longer pretends OAuth verification works, does not create teacher sessions, and does not log launch success before real OAuth1 HMAC-SHA1 verification is implemented and tested.
- **SQL safety**: the reconstructed AI Studio migration was copied into `supabase/migrations/20240428_initial_reconstruction_DRAFT_DO_NOT_RUN.sql` with a clear warning header, and the runnable `20240428_initial_reconstruction.sql` file was removed from the PR branch.
- **No SQL operations performed.**
- **No Supabase functions deployed.**
- **No real Moodle LTI launch verified yet.**
- **Production-ready**: no.

## PR branch local audit (20260501-065132)
- Branch: gemini/ai-studio-sync-20260428-193953
- Commit: c6da29ecd628811847cbf15c1b0d178ae9e3eaea
- Build: BUILD_FAILED
- Typecheck: FAILED
- Has demo strings: True
- OAuth heuristic: False
- Ready for Moodle use: NO
- Report: STATE/local-audit/pr-branch-audit-20260501-065132.md


## Production hardening patch (20260501-070424)
- Branch: gemini/ai-studio-sync-20260428-193953
- Commit before patch: 24cbc582b99676ed16866102a9c4e996d13fb069
- Canonical endpoint set to /api/lti/launch.
- Runtime server src/server.js replaced with OAuth1 HMAC-SHA1 verification.
- server.ts aligned as source server.
- No SQL was run.
- No deploy was performed.
- Moodle Tool URL was not changed automatically.
- Real Moodle launch still must be verified after secrets are configured.

---

## 2026-05-03 — Central coordination evidence update

### Verified from current conversation screenshots and terminal output

- Correct Supabase project identified: `moodle-teacher-hub`.
- Correct Supabase project URL identified: `https://ncoqanascubqkxxfvucfz.supabase.co`.
- Wrong Supabase project encountered once: `calendar-app`; it is paused and must not be used for Moodle Teacher Hub.
- Supabase project overview showed `Healthy`.
- Supabase project overview showed `Last migration: No migrations`, `Last backup: No backups`, and `No branches`.
- Moodle external tool screen showed current Tool URL: `https://nasty-rabbits-wait.loca.lt/api/lti/launch`.
- Moodle external tool screen showed LTI version `LTI 1.0/1.1` and consumer key `yaniv-lti-tool`.
- A Moodle launch attempt showed `503 - Tunnel Unavailable`, proving Moodle attempted to open the tool but the temporary tunnel was not reachable.
- Termux runtime on branch `gemini/ai-studio-sync-20260428-193953` reached commit `abd480c Redact LTI shared secret from setup log`.
- Termux used Node `v24.14.1` and npm `10.9.8`.
- `npm install` completed in the clean runtime folder.
- `npm run build` passed with Vite `5.4.21`.
- Local server `/health` returned JSON successfully on `http://127.0.0.1:3000/health`.
- Local server health showed canonical endpoint `/api/lti/launch` and OAuth required.
- Local server health showed `supabaseConfigured: false` at the time of the test.
- Local server health showed `readyForMoodleUse: false` at the time of the test.
- `npx localtunnel` CLI failed in Termux because `openurl` does not support Android.
- Supabase SQL table-list query verified exactly three public tables:
  - `launch_attempts`, RLS enabled.
  - `moodle_sites`, RLS enabled.
  - `teacher_sessions`, RLS enabled.

### Current truth status after 2026-05-03 evidence

```text
Correct Supabase backend candidate: verified by screenshot
Supabase public table list: verified by safe SQL screenshot
Supabase full schema columns: not verified yet
Supabase RPCs/functions: not verified yet
Runtime Supabase connection: not configured in latest local health
Termux build: verified passing
Local Node server: verified passing
Public tunnel: failing / not verified
Real Moodle LTI OAuth: not verified
Manual Real Data Import tables: not present in table-list screenshot
Production-ready: no
```

### Decision

Do not start a new app and do not run broad experiments. Continue from the existing GitHub PR branch, existing Moodle configuration, existing Node server, and existing Supabase project. The immediate practical target is a single working launch path:

```text
Moodle -> https://nasty-rabbits-wait.loca.lt/api/lti/launch -> Node server -> verified LTI session -> Supabase teacher/session record -> React dashboard
```

### Next technical action

Use the existing Supabase tables first. Before creating missing import tables, connect the runtime to `ncoqanascubqkxxfvucfz` with local-only environment variables and make the public tunnel reachable. Then test the Moodle launch and record the exact server log result.

---

## 2026-05-07 — LTI 1.3 diagnostic endpoints live on Render

### Verified from Termux checks

```text
live_health_ok=true
live_lti13_status_seen=true
live_lti13_config_seen=true
live_lti13_jwks_expected=true
```

Evidence file:

```text
STATE/readiness-audit/lti13-live-diagnostics-evidence-20260507.md
```

### Truth boundary

This verifies safe diagnostic endpoints only.

It does not verify:

- LTI 1.3 OIDC login.
- LTI 1.3 JWT launch validation.
- NRPS automatic participant sync.
- AGS grade sync.
- Full Moodle API access.

The working LTI 1.0/1.1 tool must remain unchanged.



<!-- MTH_EVIDENCE_PARTICIPANTS_IMPORT_20260510 -->

## 2026-05-10 — LTI 1.3, NRPS, and Participants import milestone

### Verified from live user workflow

- Moodle Teacher Hub opened from Moodle through the LTI 1.3 tool.
- LTI 1.3 session was available.
- NRPS services-status showed a live LTI 1.3 session with NRPS available.
- NRPS membership preview returned real membership counts:
  - `members_count: 62`
  - `Learner: 59`
  - `Instructor: 3`
- NRPS field presence showed identifiers but no names/emails:
  - `has_user_id_count: 62`
  - `has_lis_person_sourcedid_count: 62`
  - `has_name_count: 0`
  - `has_email_count: 0`
- A real Moodle Participants report/table was imported through the Import page.
- Import result shown in the UI:
  - 62 rows accepted.
  - 62 inserted.
  - 0 updated.
  - 0 skipped.
- Students page displayed real imported student names/emails.

### Privacy boundary

- No student names, emails, CSV/XLSX/ODS files, backup JSON files, or runtime `data/store.json` may be committed to GitHub.
- Evidence must remain aggregate-only.

### Next required evidence

- Local backup confirmation summary only, without student data.
- Persistence implementation evidence.
- NRPS ↔ Participants matching report.
- Gradebook import evidence.
- Logs/time calculation evidence.

Updated: 2026-05-10T05:10:58Z

## 2026-05-31 — RLS Policies הופעלו על Production
- grade_items: teacher_own_course_grade_items ✅
- grade_results: teacher_own_course_grade_results ✅
- import_batches: teacher_own_course_imports ✅
- log_events: teacher_own_course_logs ✅
- students: teacher_own_space_students ✅
- teacher_sessions: teacher_own_course_sessions ✅
- אומת ב-Supabase Dashboard → pg_policies

