# STATE — evidence and historical snapshots

`STATE/` is an evidence/history area. It is **not** a competing source of product truth.

## How to read STATE

- Files with dates in their names are snapshots of what was known or tested at that time.
- `STATE/project-status.md`, `STATE/CURRENT.md`, `STATE/TODO-NEXT.md` and older readiness/progress files may contain statements that were current when written but are now historical.
- A stale STATE file must never override a newer canonical product document.
- Evidence remains valuable even when the operational conclusion has changed.

## Canonical truth hierarchy

1. `../RULES.md` — repository boundary.
2. `../PROJECT_RULES.md` — Teacher Hub product truth.
3. `../PROJECT_MEMORY.md` — Guide product truth and runtime separation contract.
4. `STATE/` — evidence, verification records and historical snapshots.
5. `../README.md` — public overview only.

## Runtime split

- Teacher Hub: `https://www-tijc.onrender.com` — Render.
- Guide: `https://yanivmizrachiy.github.io/www/guide/` — GitHub Pages.
- Render does not publish or validate the Guide.

## Evidence rules

- Do not commit raw student rows, raw grade rows, raw Moodle logs, Moodle exports, secrets, tokens, cookies or private runtime payloads.
- Aggregate counts and sanitized verification results are allowed when they cannot expose student PII.
- A PASS tied to a specific commit/runtime/date is evidence for that context only; do not silently reuse it as proof for a later commit.
- If a capability changes, update the canonical truth document and add new evidence rather than rewriting old evidence to look current.

## Historical files

Historical documents are intentionally retained for traceability. They do not need to be deleted merely because they contain old branch names, old runtimes or old next steps, provided they are treated as dated evidence rather than current instructions.
