# Runtime Data Safety — Moodle Teacher Hub

Real Moodle data must not be committed to GitHub.

Do not commit student names, emails, grades, logs, Moodle exports, backup JSON files, or runtime data/store.json.

data/store.json is runtime/local data and must not be tracked.

Use docs/examples/store.example.json as the only synthetic example.
