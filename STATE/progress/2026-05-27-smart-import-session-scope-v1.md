# 2026-05-27 - Smart Import Session Scope V1

**Branch:** fix/smart-import-session-scope-v1-20260527
**Teacher Release:** NO
**PR #127:** untouched

## Purpose

Smart Import now sends the LTI session token with every import request, ensuring imports are scoped to the current Moodle session/space.

## Problem

SmartImport was calling `/api/import` without a token. The server's `importSessionFromRequest()` reads from `body.token`, `query.t`, or `x-lti-session`. Without any of these, imports were not linked to the current Moodle session.

## Fix

- `src/pages/SmartImport.tsx`: get `getLtiToken()` and include `token` in the POST body if available
- Manual import fallback still works without a token (server falls back to session-based auth)

## Checks

- check: PASS
- build: PASS
- typecheck: PASS
