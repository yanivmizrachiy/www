# Moodle Teacher Hub — Gradebook Preflight UI

## Purpose

This page prepares the Gradebook import step after Participants were successfully persisted.

## Route

/gradebook-import

## What it does

- Reads a real Moodle Gradebook file or pasted table in the browser.
- Detects likely columns for student identity, grade item, grade, max grade, and update time.
- Shows a preview.
- Provides a safe copy button for the Gradebook header/profile JSON.

## What it does not do

- Does not write grades.
- Does not write students.
- Does not call Supabase.
- Does not run SQL.
- Does not set Teacher Release YES.
- Does not commit student or grade rows.

## Next step

Use this page with a real Moodle Gradebook export. Copy the safe profile JSON, then implement the real Gradebook import based on the actual headers.
