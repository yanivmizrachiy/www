# 2026-05-27 - Resilience Layer for Auto-Sync V1

**Branch:** feat/resilience-layer-v1
**Teacher Release:** NO (unchanged)
**Scope:** strategic improvement that solves a class of past bugs at the root.
Auto-sync failures (#175 root-cause cookies, similar future issues) used to be
silently swallowed by .catch(() => {}). The teacher saw 0 and had no idea why
or what to do. This adds a real status flow with a banner and a retry path.

## Problem we are solving permanently

In the auto-sync flow added by #170/#175, a failed POST (401 from cookie
blocking, 5xx network, etc.) was caught and ignored. The dashboard stayed at 0
with no signal to the teacher. We fixed the specific cookie cause in #175, but
the same silent failure could return for any future reason (server downtime,
new browser policies, expired sessions). This PR makes the failure VISIBLE
and ACTIONABLE.

## What changed

- src/pages/Dashboard.tsx:
  - New useAutoSyncStatus() hook tracks the auto-sync lifecycle:
    idle -> syncing -> success | auth-failed | network-failed | empty.
    Replaces the silent .catch(() => {}). Distinguishes 401/403 (auth) from
    other failures (network/server) for accurate teacher messaging. Exposes a
    retry() that re-runs the sync.
  - New AutoSyncBanner shows ONLY when sync failed. Color-codes by failure
    type (amber for auth, rose for network), shows the error briefly, offers
    two actions: "נסה שוב" (re-run) and "ייבוא ידני" (link to /smart-import as
    a real fallback path).
  - Removed the duplicate auto-sync from useDashboardTeachers so we do not
    fire two POSTs. That hook stays focused on showing the teacher header.

## Why this is the right strategic move

The teacher now has:
1. A signal when something is wrong (no more silent failures).
2. A truthful explanation (auth vs network vs empty), not a fake "we're trying".
3. A real recovery path (retry or manual import), not a dead end.

Future failures of the same family will surface automatically. No more
"yesterday it worked, today 0 with no clue".

## Truth / safety rules honored

- No invented data; the banner appears only when a request actually failed.
- Error text is the truth ("auth failed", "network failed", with the HTTP code).
- Pure presentation / error reporting; no Truth Engine, capability, or server
  logic changed.
- Does not touch the working flows of #170/#171/#172/#173/#174/#175/#176.
- Teacher Release stays NO; PR #127 untouched; no .env/SQL/deploy.

## Checks (all 11 green)

check, build, doctor, typecheck, audit:moodle-automation,
audit:automation-capabilities, audit:automation-capability-contract,
audit:automation-evidence-log, audit:auto-extraction-source-router,
audit:multi-teacher-isolation-evidence, audit:supabase-rls-isolation-readiness.
