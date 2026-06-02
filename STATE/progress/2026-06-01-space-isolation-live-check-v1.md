# 2026-06-01 - Space Isolation Live Check V1

**Branch:** feat/space-isolation-live-check-v1
**Teacher Release:** NO (unchanged)
**Scope:** add a live, safe space-isolation diagnostics page at /isolation-check.

## Context

The /isolation page documents code-level isolation invariants and points to a
live two-space test. The prior /isolation-check page existed but read imported
data counts (useImportsOverview) and did not show the installation/course
diagnostics required to prove per-space scoping. This PR makes the page read the
real current-session NRPS breakdown instead, and surfaces the safe identity of
the space so a teacher can prove that opening course A, then course B, then A
again does not mix numbers or course.

## What changed

- src/server.js: /api/lti13/participants-breakdown now also returns two safe,
  additive fields from the current LTI 1.3 session: `course_title` and
  `resource_link_id`. These are installation/course diagnostics (already present
  in the launch context), not personal data. The privacy block is unchanged:
  still no emails, no raw user IDs, no names, no access token, no save.
- src/pages/IsolationLiveCheck.tsx: rewritten to read ONLY the safe breakdown
  endpoint and show current-session diagnostics — course id, course title,
  client id, deployment id, resource link id, students count (learners),
  teachers count (instructors), total participants, and last sync source (NRPS).
  Keeps the two-space snapshot/compare flow, now keyed by resource link id
  (fallback course id) so two distinct spaces are required for a valid test.
  No raw student rows, no names, no emails, no person IDs, no tokens, no secrets.
- src/App.tsx: removed a duplicate `useKeepAlive` import (the /isolation-check
  route already existed).

## Not touched

- LTI launch flow, NRPS token/membership logic, server-owned sync behavior.
- Supabase schema/RLS, production SQL, env/secrets, Render, render.yaml.
- Teacher Release gate, PR #127, manual import fallback, evidence logs.
- Sidebar (intentionally simplified previously) — left unchanged.
- Student sync behavior — unchanged, so the 216 synced learners are not affected.

## Privacy behavior

The page never requests or renders person-level data. It consumes only the
counts/diagnostics fields of participants-breakdown, whose server response
strips emails, raw IDs, names, tokens, and performs no save. Course id, course
title, client id, deployment id, and resource link id are installation/context
diagnostics already available in the app session and are safe to display.

## Live Moodle check (must be done by a human, לא אומת here)

1. Open the tool from course A → press "צלם מצב מרחב זה".
2. Open the tool from course B → press "צלם מצב מרחב זה".
3. Open the tool from course A again → confirm the diagnostics + counts match
   A's snapshot and did NOT pick up B's resource link / course id / counts.
   Two distinct resource link ids with each space's own counts proves isolation.

## Why this does not break the 216 synced learners

This PR adds read-only diagnostics fields and a read-only page. It does not
touch the NRPS sync path, the learners table, or any write logic, so the
existing 216 synced learners are unaffected.

## Checks

check, build, doctor, typecheck, node --check src/server.js,
audit:moodle-automation, audit:automation-capabilities,
audit:automation-capability-contract, audit:automation-evidence-log,
audit:auto-extraction-source-router, audit:multi-teacher-isolation-evidence,
audit:supabase-rls-isolation-readiness.

## Progress

Teacher Release remains NO. PR 8 of the isolation/teachers series complete.
Estimated overall series progress: ~95% (live two-space Moodle verification is
the remaining human gate; `לא אומת` until run on real Moodle).
