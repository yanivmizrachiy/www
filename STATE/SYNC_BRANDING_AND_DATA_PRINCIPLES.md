# Historical addendum — Sync, Branding, and Data Usage Principles

Original date: 2026-07-06  
Routing clarified: 2026-09-11  
Repo: `yanivmizrachiy/www`

## Status of this file

This file is retained as a historical principles snapshot. It is **not** an independent memory/source-of-truth file.

`PROJECT_MEMORY.md` is the only repository-wide canonical source of truth. `STATE/**` files provide dated evidence, principles, snapshots and operational context only. If anything below conflicts with `PROJECT_MEMORY.md`, `PROJECT_RULES.md`, `RULES.md` or `STATE/CURRENT.md`, the current canonical files win.

## Synchronization principle

Meaningful requirement changes must be recorded first in `PROJECT_MEMORY.md` before code work continues. The public mirror `public/PROJECT_MEMORY.md` must remain synchronized with it, but it is not an independent source of truth.

Runtime/deployment state is evidence of what is deployed; it is not a separate place to define product requirements.

## Use existing WWW work first

Claude Code must use the existing data, code, architecture, routes, components, and documented truth already present in the www repo before creating new structures.

The correct order is:

1. Read `PROJECT_MEMORY.md` and the relevant canonical rules.
2. Understand what already exists.
3. Reuse and improve the existing implementation.
4. Add only what is missing.
5. Remove duplication safely.

## Teacher Hub product

The Teacher Hub / WWW product is the app that teachers use from their own Moodle learning space.

It must:

- Work from each teacher's own Moodle space where technically available.
- Use the Moodle context and available permissions.
- Show information only for the relevant teacher space.
- Improve automatic data extraction as much as possible.
- Stay separate from the Guide presentation product.

## Guide presentation product

The Guide presentation is a different product.

It is a real web guide for teachers about Moodle learning spaces.

It must:

- Use a separate link from the Teacher Hub setup/use link.
- Explain Moodle learning spaces in simple Hebrew.
- Help every teacher work inside a Moodle learning space.
- Be organized by Hebrew topics.
- Include real approved screenshots from Moodle learning spaces when available.
- Include real working buttons and navigation.

## Branding principle retained from the original snapshot

The original July 2026 addendum requested clear Yaniv Raz branding and, where appropriate, a link to the documented Instagram profile. This is a retained historical product preference, not a separate authority over current Guide/Teacher Hub requirements in `PROJECT_MEMORY.md`.

## Separation rule

Do not confuse the two products or links:

1. Guide presentation link — for viewing the Moodle teacher guide.
2. Teacher Hub / WWW link — for using the data app from a Moodle learning space.

They are different products, routes, runtimes, user goals and UX flows.

## Final rule

Keep the repo synchronized, clean, Hebrew-first and real. Never create parallel truth files to preserve a requirement; update `PROJECT_MEMORY.md` instead.
