# 2026-05-25 - NRPS Sync Persists Roster + Remove Onboarding Demo V1

**Branch:** feat/nrps-sync-persist-roster-v1
**Teacher Release:** NO (unchanged)
**Scope:** make "סנכרן מרחב" actually persist the live NRPS learner roster, and
remove the onboarding "3 steps" demo block from the dashboard.

## Context

Yaniv: "I don't want any demo or demo text" + "improve the data-extraction
automation - that's the most important thing". Investigation found that the
"סנכרן מרחב" button only ran capability detection (sync_run mode
"capability-detection-only") - it updated lastSyncAt but did NOT pull or save
the 59 NRPS learners. So the roster showed live but never persisted to profiles.

## What changed

- src/server.js: new POST /api/imports/nrps-sync. Takes the learner roster the
  client already received from /api/lti13/nrps-preview (members_named) and
  upserts only the learners (instructors skipped) into store.students,
  space-isolated, with source "moodle-nrps-sync". Stable id
  stableId("student", spaceId+"|nrps|"+identity). No emails, no invented data;
  saves the store and bumps lastSyncAt only when something changed.
- src/pages/Dashboard.tsx:
  - "סנכרן מרחב" now runs a real handler: fetch /api/lti13/nrps-preview -> POST
    the members_named to /api/imports/nrps-sync -> then the existing
    syncStatus.runSync(). Button shows a spinner while syncing.
  - Removed the TeacherOnboarding "איך מתחילים — 3 צעדים" demo block (and its
    now-unused import + showOnboarding/hasAnyData state).

## Why this is real automation (not demo)

The names come from the live NRPS membership (Moodle privacy = always). The sync
persists those real learners so each gets a saved /students/<id> profile that the
grades/activity importers can later attach to. Nothing is invented.

## Truth / safety rules honored

- Only real NRPS learners with a name are saved; instructors skipped; no emails.
- Space-isolated by session spaceId; node --check + doctor secret-scan pass.
- TeacherOnboarding.tsx file kept (not deleted) in case it's reused; just not
  rendered.
- Teacher Release stays NO.

## What was NOT touched

- The nrps-preview handler, Truth Engine, LTI auth/verification, governance,
  PR 127 RLS draft, .env, deploy - unchanged.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
