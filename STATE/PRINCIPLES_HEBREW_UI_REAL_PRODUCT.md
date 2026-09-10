# Historical addendum — Hebrew UI and Real Product Principles

Original date: 2026-07-06  
Routing clarified: 2026-09-11  
Repo: `yanivmizrachiy/www`

## Status of this file

This file is retained as a historical principles snapshot. It is **not** an independent source of truth.

`PROJECT_MEMORY.md` is the only repository-wide canonical source of truth. `PROJECT_RULES.md` contains detailed Teacher Hub truth, `RULES.md` defines repository boundaries, and `STATE/CURRENT.md` is the concise current-state snapshot. If anything below conflicts with those files, the canonical current files win.

## Core requirement retained

The project must be a real product, not a demo.

## Hebrew UI

All visible UI must be in Hebrew and RTL where the current product contract requires it:

- Buttons
- Menus
- Labels
- Tooltips
- Empty states
- Error messages
- Success messages
- Admin screens
- Teacher-facing screens

## Real buttons only

Every button shown in the product must perform a real action.

No demo buttons.  
No demo labels.  
No fake links.  
No fake sync.  
No fake data.

If something is not connected yet, the UI must say that clearly instead of simulating success.

## Two separate product areas

The repo contains two separate Moodle products:

1. **Guide Presentation** — a live static web presentation that explains Moodle learning spaces to teachers.
2. **Moodle Teacher Hub / WWW** — the data/tooling application teachers can open from their own Moodle learning space.

They must stay separate in code, navigation, routes, data, UX, runtime and deployment proof.

## Managed links principle

Any admin surface that manages links must distinguish between:

1. The Guide share link.
2. The Teacher Hub setup/use link.

The Guide link is for viewing the presentation. The Teacher Hub link is for using the Teacher Hub from a Moodle learning space.

## Guide presentation principles retained

The Guide should remain clear, simple, Hebrew-first and suitable for teachers. It must use real approved Moodle screenshots where required and must never invent a screenshot or fake a completed action.

## Repository cleanup

Repository cleanup must remain safe:

- Clear folder structure.
- No duplicate active components.
- No dead active files presented as current.
- No unused demo code.
- No duplicate active routes.
- No mixing between Guide and Teacher Hub.
- Check references before deleting anything.
- Do not break working flows.
- Run the relevant audits/tests after changes.

## Final rule

Keep the repo clean, real, Hebrew-first and production-oriented, but record new requirements only in the canonical truth files rather than creating another principles/memory document.
