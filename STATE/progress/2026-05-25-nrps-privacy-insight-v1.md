# 2026-05-25 - NRPS Privacy Insight V1

**Branch:** feat/nrps-privacy-insight-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new NrpsPrivacyInsight component + CapabilityProbe wiring

## Purpose

Real Moodle tool screenshots showed NRPS ("סינכרון וניהול משתמשים") is ENABLED
but the tool's privacy is set to "אף פעם" for username and email, so NRPS
returns members but no names. The participants screen (62 members, with names,
emails, groups) proves the data exists and is teacher-accessible. This PR makes
the NRPS privacy reality visible and actionable in the Capability Probe page.

## What was built

- src/components/NrpsPrivacyInsight.tsx (new): fetches the existing
  /api/lti13/nrps-preview endpoint (which already returns members_count,
  role_counts, has_name_count, has_email_count) and shows: members received,
  count with names, count with emails, and role breakdown. When members exist
  but names = 0, it shows the exact actionable Moodle change ("שתפו שם המשתמש"
  -> "תמיד"). Honest states for not-reachable / no-members. Only live counts;
  no invented names.
- src/pages/CapabilityProbe.tsx: renders <NrpsPrivacyInsight /> right after the
  capability status rows.

## Truth / safety rules honored

- Reads only the existing real NRPS preview endpoint; no new data path.
- Shows real counts only; no student names rendered, no demo.
- Actionable guidance is the real Moodle privacy setting, not a fake claim.
- Teacher Release stays NO.

## What was NOT touched

- server.js (nrps-preview reused), hooks, Truth Engine - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
