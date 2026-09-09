# Addendum — Hebrew UI and Real Product Principles

<!-- SUPERSEDED_TRUTH_LIST -->
> **⚠️ מסמך היסטורי — אינו מקור אמת.** הוראות הכתיבה שהיו בו אוחדו ל-`PROJECT_MEMORY.md` פרק 3א §5 ולסעיף ה-Routes של המצגת.
>
> ניתוב מקורות האמת המחייב היום: מצגת `/guide` → `PROJECT_MEMORY.md` · מוצר Moodle Teacher Hub →
> `PROJECT_RULES.md` · גבול הריפו → `RULES.md` · תקציר וניתוב → `CLAUDE.md`.
> התוכן נשמר כראיה היסטורית ואין להסיק ממנו כללים. עודכן 2026-09-09.

Date: 2026-07-06
Repo: yanivmizrachiy/www

## Core requirement

The project must be a real product, not a demo.

## Hebrew UI

All visible UI must be in Hebrew and RTL:

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

If something is not connected yet, the UI must say that clearly in Hebrew.

## Two separate product areas

The same website manages two separate areas:

1. Guide Presentation — a live web presentation that explains Moodle learning spaces to teachers.
2. Moodle Teacher Hub / WWW — the existing tool in this repo that teachers can open from their own Moodle learning space.

These two areas must stay separate in code, navigation, routes, data, and UX.

## Managed links

The admin area must let Yaniv manage:

1. A share link for the live guide presentation.
2. A setup/use link for Moodle Teacher Hub / WWW.

The guide link is for viewing the presentation.
The Teacher Hub link is for using the WWW tool from a Moodle learning space.

## Guide presentation

The guide presentation must be organized by Hebrew topics.
It must be clear, simple, and suitable for teachers.
It must use real approved screenshots where available.
It must cover general Moodle learning-space actions as fully as possible.

## Repository cleanup

Claude Code must keep the repo clean:

- Clear folder structure
- No duplicate components
- No dead files
- No unused demo code
- No duplicate routes
- No mixing between Guide System and Teacher Hub System

Cleanup must be safe:

- Check references before deleting
- Do not break existing working flows
- Run tests after changes
- Commit cleanup separately when possible

## Final rule

The repo must stay clean, real, Hebrew-first, and production-oriented.
