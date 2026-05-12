# Persistence Live Validation

Endpoint:

`GET /api/persistence/validate`

It checks required Supabase tables using server-side credentials and returns only safe metadata:
- table name
- ok/missing status
- aggregate count
- short error code/message if inaccessible

It must not return secrets, rows, names, emails, grades, logs, or raw Moodle data.
