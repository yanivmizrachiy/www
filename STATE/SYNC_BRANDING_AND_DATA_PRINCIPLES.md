# Addendum — Sync, Branding, and Data Usage Principles

Date: 2026-07-06
Repo: yanivmizrachiy/www

## Always-synced memory principle

The project memory must stay synchronized between:

- The local project folder on Yaniv's computer
- GitHub main branch
- The connected deployment service, such as Vercel or the active runtime

Every meaningful requirement update must be recorded in the project memory files before code work continues.

Main memory files:

- PROJECT_MEMORY.md
- STATE/PRINCIPLES_HEBREW_UI_REAL_PRODUCT.md
- STATE/SYNC_BRANDING_AND_DATA_PRINCIPLES.md

## Use existing WWW work first

Claude Code must use the existing data, code, architecture, routes, components, and documented truth already present in the www repo before creating new structures.

The correct order is:

1. Read the repo truth files.
2. Understand what already exists.
3. Reuse and improve the existing WWW implementation.
4. Add only what is missing.
5. Remove duplication safely.

## Teacher Hub product

The Teacher Hub / WWW product is the app that teachers use from their own Moodle learning space.

It must:

- Work from each teacher's own Moodle space where technically available.
- Use the Moodle context and available permissions.
- Show information only for the relevant teacher space.
- Improve automatic data extraction as much as possible.
- Stay separate from the guide presentation product.

## Guide presentation product

The guide presentation is a different product.

It is a real web guide for teachers about Moodle learning spaces.

It must:

- Use a separate link from the Teacher Hub setup/use link.
- Explain Moodle learning spaces in simple Hebrew.
- Help every teacher work inside a Moodle learning space.
- Be organized by Hebrew topics.
- Include real approved screenshots from Moodle learning spaces when available.
- Include real working buttons and navigation.

## Branding on every page

Every page in the site must include clear branding text:

Managed by Yaniv Raz

Hebrew display text:

מנוהל ע״י יניב רז

The site should also include a link to Yaniv's personal Instagram profile when appropriate in the footer or branding area.

Instagram:

https://www.instagram.com/yani__raz

## Separation rule

Do not confuse the two links:

1. Guide presentation link — for viewing the Moodle teacher guide.
2. Teacher Hub / WWW link — for using the data app from a Moodle learning space.

These are different products, different routes, different user goals, and different UX flows.

## Final rule

The repo must stay synchronized, clean, Hebrew-first, real, and focused on improving the existing WWW product while also managing the separate guide presentation product.
