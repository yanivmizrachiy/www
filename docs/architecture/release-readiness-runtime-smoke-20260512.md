# Release Readiness Runtime Smoke

This verifies that `/api/release/readiness` runs locally and returns a conservative readiness result.

The endpoint must not approve teacher release while blockers remain.

It also must not return secret values or private student rows.
