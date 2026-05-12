# Server Runtime Canonical Audit — 2026-05-12

Mode: audit only.

## What this branch does

- Confirms which server file is active in package scripts.
- Compares `server.ts` and `src/server.js` at a metadata/route/reference level.
- Records decision: `src/server.js` is active; `server.ts` requires review before archive.

## What this branch does not do

- No source code changes.
- No moves.
- No deletion.
- No deploy.
- No secrets.
- No student data.

## Next

Review whether `server.ts` contains unique logic. If not, archive it safely in a later PR.
