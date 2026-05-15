# Moodle Teacher Hub — Gradebook Next Step

## Current verified state

Participants import succeeded and is persisted in Supabase.

Expected live counts:

students > 0  
import_batches > 0

## Why Gradebook is next

Teacher Release is still false because Gradebook and Logs are missing.

The app currently blocks Gradebook import until a real Moodle Gradebook export is available.

## Required Moodle Gradebook export

Export a real Moodle Gradebook report that includes as many of these columns as possible:

- Full name / שם מלא
- First name / שם פרטי
- Last name / שם משפחה
- Email / דוא"ל
- Username / שם משתמש
- Grade item / שם פעילות / מטלה / Quiz / Assignment
- Grade / ציון
- Max grade / ציון מרבי
- Last modified / תאריך עדכון, if available

## Truth rules

- Do not invent grades.
- Do not treat missing grade as 0.
- Do not commit student rows or grade rows to GitHub.
- Store only aggregate counts in diagnostics.
- Teacher Release remains false until all gates pass.

## Next implementation gate

Only implement/write Gradebook import after seeing the real Moodle Gradebook headers or uploaded file structure.
