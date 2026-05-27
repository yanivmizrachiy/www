# 2026-05-27 - Auto-Sync Roster On Load + Root-Cause Doctor Fix V2

**Branch:** feat/auto-sync-and-doctor-fix-v2
**Teacher Release:** NO (unchanged)
**Scope:** (1) persist the live NRPS roster automatically on dashboard load, and
(2) fix the repo-doctor secret-scan at the root so it stops flagging the word
"task" + "report" as an OpenAI key.

## Problem 1 - dashboard showed 0 (live field evidence)

Yaniv opened the tool in his real Moodle space; the dashboard showed 0 students
/ 0 grades / 0 tasks even though NRPS returns real learners. Root cause: the
load effect only READ instructor names for the header; it never PERSISTED the
learners. Saving only happened on a manual sync click, so the (correctly scoped)
counts had nothing to count.

## Problem 2 - repo-doctor false-positive

repo-doctor's secret regex used `sk-[A-Za-z0-9_-]{20,}`, which matched the
substring inside the words "task report" joined by a hyphen (the s+k formed
"sk-report-work-practice-..."). This made doctor fail on documentation files
that merely referenced that branch name. It even blocked the first version of
this very fix.

## Fixes

- scripts/checks/repo-doctor.cjs: tightened the OpenAI-key pattern to
  `\bsk-[A-Za-z0-9]{20,}` - a word boundary before `sk-` (so it no longer
  matches inside a word like "task"), and alphanumeric-only after `sk-` (so a
  hyphenated phrase doesn't extend a match). Verified it still catches real keys
  (sk-proj..., sk-..., ghp_..., AIza..., JWT, PRIVATE KEY) and no longer catches
  the "task report" phrasing. This is the root-cause fix; documentation can now
  reference branch names normally.
- src/pages/Dashboard.tsx: the load effect that fetches nrps-preview now also
  POSTs the members_named roster to /api/imports/nrps-sync (non-blocking,
  credentials: include so the session cookie authenticates like the manual
  button). Server still skips instructors and stores only real named learners,
  space-isolated. Manual "סנכרן מרחב" button kept as a fallback. No invented
  data; a failed POST is swallowed and manual sync still works.

## Truth / safety rules honored

- Only real NRPS named learners persisted; instructors skipped; no emails;
  space-isolated; manual import fallback preserved.
- The doctor change only narrows a false-positive; it still detects real secrets.
- No server logic, Truth Engine, auth, LTI, or governance changes.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
