# Active Marker Review — 2026-05-12

Mode: audit/decision only.

## What this branch does

- Reviews active markers in runtime/source/deployment-related files.
- Separates harmless markers from production blockers.
- Identifies whether there are fake/placeholder fallbacks that must be fixed before teacher release.

## What this branch does not do

- No source code changes.
- No moves.
- No deletion.
- No deploy.
- No secrets.
- No student data.

## Next

If a production blocker exists, fix it in a small targeted PR before Automation Core.
