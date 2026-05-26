# 2026-05-26 - Clean Automation Cards V1

**Branch:** feat/clean-automation-cards-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI - remove "ראיה: ביקורת קוד" dev jargon from Automation page cards;
shorten teacherActionHe text in automationCapabilities.ts.

## Context

The Automation page (AutomationStatusPanel) showed a badge with developer
jargon ("ראיה: ביקורת קוד") on every capability card. Also some teacherActionHe
fields included the word "אמיתי/אמיתיים" which is unnecessary filler.

## What changed

- src/components/AutomationStatusPanel.tsx:
  - EVIDENCE_DISPLAY labels: "ראיה: ביקורת קוד" → "מאומת בקוד",
    "ראיה: מאומת חי" → "מאומת חי", "ראיה: נגזר" → "נגזר",
    "ראיה: חסרה" → "חסר אימות".
  - Panel header tag: removed "ראיות ביקורת קוד בלבד ·" prefix, kept
    "Teacher Release: לא".
- src/lib/automationCapabilities.ts:
  - participants teacherActionHe: removed "האמיתית"
  - gradebook teacherActionHe: removed "אמיתיים"
  - course_structure teacherActionHe: removed "אמיתיים"

## What was NOT touched

- No evidenceType values changed (audit/live/inferred/missing).
- No CAPABILITY_AUDIT_METADATA changed.
- No governance, Truth Engine, or audit script logic changed.
- Teacher Release stays NO.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
