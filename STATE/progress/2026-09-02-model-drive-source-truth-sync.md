# Progress — Model Drive Source-of-Truth Sync

Date: 2026-09-02  
Repo: `yanivmizrachiy/www`  
Teacher Release: **NO**

## Scope

Synchronized the existing canonical project memory with the requirements collected in the Google Drive folder `מודל`, specifically the document `מקור אמת יחיד – מצגת הדרכה למודל`.

## Canonical-source rule

- `PROJECT_MEMORY.md` remains the single canonical source of truth in the repository.
- `public/PROJECT_MEMORY.md` is a public/deployment mirror only and is not an independent source of truth.
- Existing requirements were preserved wherever they did not conflict with the new requirements.
- Conflicting rules were corrected instead of keeping parallel versions.

## Important conflict resolved

The previous guide rule allowed a visible placeholder when a required Moodle screenshot was missing. The synchronized rule now requires:

1. Search the repository thoroughly for an existing suitable screenshot first.
2. Reuse an existing suitable real screenshot when available.
3. Never invent a button, demo screen, or placeholder.
4. Put only truly missing buttons/screens into a final capture list.
5. For every missing capture, document the exact action, missing UI, capture location, presentation step, and a prompt for `קואורק`.

## Guide requirements added/expanded

The canonical memory now includes the detailed presentation requirements for:

- Q&A slide structure and interactive presentation UX.
- Real direct links where relevant.
- Opening a Moodle space.
- `המרחבים שלי`, archive, and self-learning spaces.
- Editing space details.
- Student enrollment and first-time `רשום אותי` flow.
- Participants, groups, and additional teachers.
- Sending tasks.
- Attempts, correction, feedback, and pass/fail result display.
- Edit mode, hiding/deleting tasks, computerized-task icon, and dragging tasks.
- Importing tasks and space updates.
- Student activity, attempts, highest score, and space-association troubleshooting.
- Final acceptance criteria for screenshots, links, navigation, and missing-asset reporting.

## Preserved non-conflicting content

The existing Teacher Hub / WWW architecture, automation priorities, analytics requirements, routes, preferred technologies, safety rules, release gate, and non-breakage requirements remain part of the canonical memory.

## Code impact

No application code, LTI flow, Supabase logic, routes, deployment configuration, or Teacher Release state was changed by this synchronization.
