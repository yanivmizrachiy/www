# 2026-05-25 - Hebrew Role Labels V1

**Branch:** feat/hebrew-role-labels-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new roleLabel helper + apply across role displays

## Purpose

Yaniv saw the raw English role "teacher" in the header ("יניב רז · teacher")
and asked for everything to be in Hebrew. This adds a single Hebrew role-label
helper and uses it everywhere a raw Moodle/LTI role string was shown.

## What was built / changed

- src/lib/roleLabel.ts (new): hebrewRoleLabel() maps raw roles (teacher,
  Instructor, the LIS vocab URL, student/Learner, admin, content developer, TA)
  to clean Hebrew labels. Unknown-but-present roles are shown as-is (no invented
  label); empty role returns the neutral "—" placeholder.
- src/components/AppLayout.tsx: header now shows hebrewRoleLabel(session.role)
  instead of the raw role (this was the "· teacher" in the screenshot).
- src/components/NrpsPrivacyInsight.tsx: NRPS role-count breakdown uses Hebrew
  labels ("מורה: 2 · תלמיד: 60" instead of "Instructor: 2 · Learner: 60").
- src/pages/Students.tsx: dual labels "Learners / תלמידים" and
  "Instructors / מורים" simplified to Hebrew-only "תלמידים" / "מורים".

## Truth / safety rules honored

- Pure display mapping. No data invented; unknown roles shown verbatim; empty
  shows "—". Counts and identities still come from the real session/NRPS.
- No data paths, endpoints, or Truth Engine touched.
- Teacher Release stays NO.

## What was NOT touched

- server.js, hooks (read-only), Truth Engine - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
