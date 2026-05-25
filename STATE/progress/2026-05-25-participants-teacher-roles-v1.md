# 2026-05-25 — Participants Teacher Roles + Privacy-Safe List V1

**Branch:** feat/participants-teacher-roles-privacy-safe-list-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only — src/pages/Students.tsx

## Purpose

Make the participants area clean, premium, privacy-safe, and real-data-only.
First teacher-facing product PR after the infrastructure sequence (#119-#128).

## What changed (Students.tsx only)

1. Teachers in this space (new section)
   - Shows teacher count ONLY if NRPS returns a real Instructor count.
   - Shows teacher NAMES only if NRPS members carry a real instructor role
     AND a real name string. Never invents names.
   - If count exists but names don't: honest Hebrew message.
   - If no real source: honest Hebrew "no real source" message.

2. Clean student list (privacy-safe)
   - Main list shows ONLY: clickable student name + "פתח פרופיל" action.
   - Emails / usernames / external IDs are NO LONGER in the main list.
   - They appear only behind an explicit "הצג פרטים נוספים" toggle, and only
     when such data actually exists (toggle hidden otherwise).
   - Data is not deleted from the system — only hidden by default in the UI.

3. Clickable names
   - The student NAME itself is now a link to /students/:id (not only a
     separate button). The "פתח פרופיל" action is kept as well.

4. Preserved
   - NRPS truth messages and refresh kept.
   - Real counts cards kept.
   - "what is missing" import fallback CTA kept.
   - Page title updated "תלמידים" -> "משתתפים" (teachers + students).

## What was NOT touched

- src/hooks/useImports.tsx (parser/hooks) — unchanged.
- src/pages/StudentProfile.tsx + useStudentProfile — unchanged (profile works).
- src/pages/Dashboard.tsx — unchanged. The clear "משתתפים" button linking to
  /students already exists. Teacher names live on the Students page where NRPS
  is already loaded; adding NRPS fetch to the Dashboard would be scope creep
  and runtime risk, so it was intentionally avoided.
- Participants import, Gradebook/Logs/Course Structure imports — unchanged.
- LTI, Supabase, Truth Engine, Auto Extraction Router, Governance, Teacher
  Release gate, PR #127 RLS draft, .env, deploy — all untouched.

## Truth rules honored

- No fake data, no invented student names, no invented teacher names.
- No fake "connected" state. Missing stays missing with honest Hebrew text.
- No sensitive identifiers in the main list by default.

## Checks (sandbox, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
