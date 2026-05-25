# 2026-05-25 - NRPS Roster + Clean Students/Teachers UI V1

**Branch:** feat/nrps-roster-and-clean-ui-v1
**Teacher Release:** NO (unchanged)
**Scope:** server nrps-preview adds members_named; Students page rebuilt clean;
Dashboard hero shows all teacher names; "משתתפים" -> "תלמידים".

## Context

After the teacher set Moodle tool privacy "שתפו שם המשתמש" -> "תמיד", NRPS now
returns real names. Real Moodle participants screen confirms 3 instructors
(טל שרה נחמיה, יניב רז, סוניה רפאלי) and ~59 learners. Yaniv asked to: remove
all demo/explainer text, drop the confusing "תלמידים עם שמות מיובאים" card,
show a real clickable student list, stop using the word "משתתפים" (only
תלמידים / מורים), and show ALL teacher names at the top.

## What changed

- src/server.js (/api/lti13/nrps-preview): now also returns members_named[] -
  { id (stable sha256 hash of the user id), name, is_instructor, has_email } -
  built from the live membership ONLY when Moodle actually sends names (privacy
  allows). No emails returned. Privacy flags updated honestly
  (no_names_returned: false, names_only_when_moodle_allows: true). No save.
- src/pages/Students.tsx: rebuilt clean. Title "תלמידים ומורים", no demo
  sentences. Two sections: מורים (real instructor names) and תלמידים (real NRPS
  roster, each row a clickable link to the profile; falls back to imported
  students when NRPS names absent). Removed the "אמת מקור" block, the
  "תלמידים עם שמות מיובאים" card, and all "ללא דמו/מומצא" copy.
- src/pages/Dashboard.tsx: useDashboardTeachers now reads members_named; the
  hero "מורה/מורים" card shows ALL teacher names joined (fallback to the
  session username); removed the redundant "מורים במרחב (Moodle לא שלח שמות)"
  row; main action card renamed "משתתפים" -> "תלמידים".

## Truth / safety rules honored

- members_named is built only from real NRPS members that actually have a name;
  no invented names; emails never returned. No save performed.
- Student rows link by a stable hashed id (nrps:<hash>) or the imported id.
- Teacher Release stays NO.

## What was NOT touched

- hooks (read-only), Truth Engine, all other server logic - unchanged.
- LTI verification/auth, Supabase, Auto Extraction Router, Governance, Teacher
  Release gate, PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
