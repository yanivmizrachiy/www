# 2026-05-25 - Isolation Status Page V1

**Branch:** feat/isolation-status-page-v1
**Teacher Release:** NO (unchanged)
**Scope:** UI only - new IsolationStatus page + route + dashboard link

## Purpose

Truth-first transparency for multi-teacher data isolation - the key concern
before any broad release. Surfaces, in one page, the code-level isolation
invariants that ARE guaranteed (mirroring the multi-teacher-isolation audit
that runs in CI on every PR) and the items that still require a live
two-teacher test. Never claims isolation is fully verified; Teacher Release
stays NO.

## What was built

- src/pages/IsolationStatus.tsx (new): two sections - (1) "מה כבר מובטח ברמת
  הקוד" listing 7 proven invariants (session per request, teacher-scoped,
  course-scoped, imports scoped to batch, course-scoped grade ids, no
  hardcoded pilot identity, diagnostics aggregate-only) each with its proving
  signal; (2) "מה עדיין דורש בדיקה חיה" listing the live-pending items (two-
  teacher test, Supabase RLS enforcement, Teacher Release gate). It reads the
  real /api/release/readiness endpoint and shows the relevant open blockers,
  plus an honest status footer with the readiness percent.
- src/App.tsx: /isolation route.
- src/pages/Dashboard.tsx: "בידוד נתונים" link in the secondary menu.

## Truth / safety rules honored

- Mirrors the CI isolation audit invariants; no invented guarantees.
- Live-pending items shown honestly as NOT yet verified.
- Reads only the real readiness endpoint for blockers; no secrets, no rows.
- Teacher Release stays NO; explicit "שער השחרור סגור" status.

## What was NOT touched

- server.js (readiness endpoint read-only), the isolation audit, useImports,
  Truth Engine - unchanged.
- LTI, Supabase, Auto Extraction Router, Governance, Teacher Release gate,
  PR 127 RLS draft, .env, deploy - untouched.

## Checks (sandbox + Yaniv machine via mth, all green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
