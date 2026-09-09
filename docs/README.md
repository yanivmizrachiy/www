# Documentation Map — Moodle Teacher Hub + Guide

This folder is organized by purpose. Historical documents may remain for evidence, but they are not automatically current product truth.

## Folders

- `architecture/` — product architecture, data flow, Moodle/API contracts, system design and cleanup audits.
- `lti/` — LTI 1.0/1.1, LTI 1.3, NRPS, AGS, launch and service documentation.
- `imports/` — Moodle Participants, Gradebook, Logs, and import contracts.
- `persistence/` — durable storage planning, Supabase, schema, and persistence runbooks.
- `privacy/` — runtime data safety and student-data handling rules.
- `operations/` — runbooks, testing, repository maps, and operational instructions.
- `ai-handoff/` — AI handoff prompts/reports and external builder prompts.
- `dev/` — developer notes.
- `archive-candidates/` — old snapshots/documents that require review before archive/delete.
- Guide-specific documents at `docs/GUIDE_*` — screenshot manifest, missing captures and presentation contracts.

## Truth hierarchy

- `../RULES.md` — repository boundary.
- `../PROJECT_RULES.md` — canonical Teacher Hub product truth.
- `../PROJECT_MEMORY.md` — canonical Guide truth and Guide/Teacher-Hub separation contract.
- `../public/PROJECT_MEMORY.md` — deployment mirror only, never an independent source of truth.
- `../STATE/` — evidence, verification snapshots and history. A dated STATE document does not override newer canonical truth.
- `../README.md` — public overview, not a separate source of truth.

## Runtime split

- Teacher Hub → Render: `https://www-tijc.onrender.com`
- Guide → GitHub Pages: `https://yanivmizrachiy.github.io/www/guide/`

Render must not publish or validate the Guide.

## Data safety

Do not put real student rows, raw Moodle exports, secrets, credentials or private runtime data in this folder.
