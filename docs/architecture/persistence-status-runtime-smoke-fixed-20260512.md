# Persistence Status Runtime Smoke Fixed

This verifies `/api/persistence/status` and the persistence block inside `/api/sync/status`.

The check allows safe boolean field names such as `supabase_service_role_configured`, while still blocking secret values, JWT-like values, private student rows, and fake persistence claims.
