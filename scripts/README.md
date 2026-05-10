# Scripts Map — Moodle Teacher Hub

Scripts are organized by purpose.

- maintenance/ — scripts required by npm lifecycle or safe maintenance.
- audit/ — read-only checks and verification scripts.
- termux/ — Termux/mobile helper scripts.
- dev/ — local development helpers.
- archive-candidates/ — old one-time scripts kept for review before archive/removal.

If a script is referenced from package.json, update package.json and run npm run check + npm run build.

Do not put secrets or student data in scripts.
