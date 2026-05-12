# Dashboard data fallback — 2026-05-05

## Problem

Moodle LTI launch works and the UI shows connected, but the dashboard still tried Supabase RPC `lti_get_imports_overview` first/only and displayed `Failed to fetch` when Supabase runtime was not configured or DNS failed.

## Fix

- Added Node endpoint `/api/imports/overview`.
- Updated `useImportsOverview` to call Node first.
- If Supabase fails, the dashboard shows a real empty state with zero counts instead of an error.
- No fake students, grades, tasks, logs, chapters, or practice time are created.

## Current truth

LTI connection works. Data import is still required for real students/grades/activity.
