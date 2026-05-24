# Automation Status / Missing Data Action Hub V1

**Date:** 2026-05-24
**Branch:** feat/automation-status-action-hub-v1-20260524
**Status:** COMPLETE — all checks pass

## What Was Built

`src/components/AutomationStatusPanel.tsx` — small Hebrew RTL capability status
panel added to the `/automation` page (`src/pages/Automation.tsx`).

Reads exclusively from `src/lib/automationCapabilityGovernance.ts`.
No API calls. No hardcoded statuses. No invented capabilities.

Shows the 5 teacher-visible capabilities: lti_context, participants, gradebook,
logs, course_structure. All hidden capabilities (practice_time,
moodle_web_services, nrps, ags, teacher_release) are not rendered.

## UI Behavior

Each card shows:
- labelHe — Hebrew capability name
- status badge — AUTO / SEMI_AUTO (derived from governed registry)
- evidence-type badge — distinguishes "ביקורת קוד" (audit) from "מאומת חי" (live)
- teacherActionHe — what the teacher must do
- nextTechnicalStep — next requirement in plain language

Capabilities with allowedTeacherActions get a real import route button:
- participants → /import
- gradebook → /gradebook-import
- logs → /logs-import
- course_structure → /course-structure-import
- lti_context → displayOnly, no button

No fake action buttons. No admin-only or live-only actions shown as available.

## Truth Engine Consumer Rule

- Imports only from `src/lib/automationCapabilityGovernance.ts`
- Does not import from `src/lib/automationCapabilities.ts`
- Does not duplicate capability status logic inside components
- Calls only: `getGovernedTeacherVisibleCapabilities()`

## Mandatory Gates

- UI imports only from automationCapabilityGovernance.ts: YES
- UI does not import from automationCapabilities.ts: YES
- UI does not hardcode capability statuses: YES
- UI does not invent Moodle capabilities: YES
- UI does not upgrade evidenceType to live: YES
- UI does not change truth values: YES
- Every visible card shows provenance (status + evidenceType + nextTechnicalStep): YES
- audit evidence visually distinguished from live evidence: YES
- No fake action buttons: YES

## Files Changed

- src/components/AutomationStatusPanel.tsx (new)
- src/pages/Automation.tsx (added AutomationStatusPanel import and render)
- STATE/progress/2026-05-24-automation-status-action-hub-v1.md (this file)

## Files Not Changed

- src/lib/automationCapabilities.ts (unchanged from main)
- src/lib/automationCapabilityGovernance.ts (unchanged from main)
- src/lib/automationCapabilityTypes.ts (unchanged from main)
- .env (not touched)
- Supabase migrations (not touched)
- LTI launch (not touched)
- Participants pipeline (not touched)
- Gradebook pipeline (not touched)
- Logs pipeline (not touched)
- Teacher Release gate (not touched)

## Checks Run

- npm run check: PASS
- npm run build: PASS
- npm run doctor: PASS
- npm run typecheck: PASS
- npm run audit:multi-teacher-safety: PASS
- npm run audit:moodle-webservices-readiness: PASS
- npm run audit:moodle-automation: PASS
- npm run audit:automation-capabilities: PASS
- npm run audit:automation-capability-contract: PASS

## Fresh-Context Review Rule

Before merging, verify in a fresh context or by PowerShell:

1. Run the full audit suite from a clean shell:
   npm run check
   npm run build
   npm run doctor
   npm run typecheck
   npm run audit:multi-teacher-safety
   npm run audit:moodle-webservices-readiness
   npm run audit:moodle-automation
   npm run audit:automation-capabilities
   npm run audit:automation-capability-contract

2. Verify these diffs are empty:
   git diff main -- src/lib/automationCapabilities.ts
   git diff main -- src/lib/automationCapabilityGovernance.ts

3. Verify Teacher Release remains NO / BLOCKED.

4. Verify no .env or secret file is staged.
