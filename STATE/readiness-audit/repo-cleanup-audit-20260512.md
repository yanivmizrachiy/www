# Repo Cleanup Audit — 2026-05-12

Mode: audit only.

## What this branch does

- Checks tracked risky/private file patterns.
- Checks root docs/scripts that may need organization.
- Checks duplicate basenames.
- Checks old content markers: demo/fake/mock/placeholder/localtunnel/cloudflare/ngrok/TODO/FIXME.
- Checks package.json script references.
- Checks possible server/config duplication.

## What this branch does not do

- No deletion.
- No moves.
- No source code change.
- No deploy.
- No secrets.
- No student data.

## Next

Only after reviewing this audit:
1. archive safe old experiments with `git mv`,
2. remove confirmed obsolete files,
3. run `npm run check`,
4. run `npm run build`,
5. update PROJECT_RULES / STATE if needed.
