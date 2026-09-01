# Progress — Guide synchronization from Model source of truth

Date: 2026-09-02  
Repo: `yanivmizrachiy/www`  
Target production branch: `rebuild/lti13-secure-teacher-hub`  
Teacher Release: **NO**

## Scope

Implemented a focused synchronization of the existing Moodle teacher Guide with the canonical presentation requirements that were synchronized into `PROJECT_MEMORY.md` from the Google Drive folder `מודל`.

This work changes the Guide layer only. It does not change Teacher Hub data logic, LTI, Supabase, imports, release gates, or Moodle credentials.

## Existing implementation preserved

The existing production Guide was found in:

- `src/pages/Guide.tsx`
- `src/data/guideDeck.ts`
- `src/data/guideButtons.ts`
- `public/guide/screenshots/`
- `docs/GUIDE_SCREENSHOTS_MANIFEST.md`

Existing slide IDs/deep links were preserved when the slide already existed, including `create-space`, `rename-space`, `quiz-settings`, `assignment-submissions`, `logs`, `gradebook`, and `export-grades`.

Existing non-conflicting teaching content remains available. New requirements do not delete an older useful slide merely because a better screenshot is still needed.

## Presentation UX changes

- Slide titles are phrased as short teacher questions wherever applicable.
- Text was shortened and made more action-oriented.
- The screenshot column is larger.
- Screenshots can be opened at full size.
- Operational step sections are labeled `כפתור אחרי כפתור`.
- Bottom navigation now includes a persistent table-of-contents action in addition to previous/next and progress.
- Existing keyboard navigation, swipe navigation, search, menu, fullscreen, 16:9 frame, and deep-link query parameters are preserved.

## Screenshot policy

Existing screenshots were audited before declaring gaps. Real assets 01–33 (except 23) are reused where relevant.

New questions that genuinely require a missing screenshot are kept in the deck source with `needs-capture` status and are not published as completed slides until real evidence exists. Existing legacy slides remain published when they already carried useful content, even when a better screenshot is listed as a follow-up.

The single consolidated missing-capture list is:

`docs/GUIDE_MISSING_CAPTURES.md`

It currently contains M01–M22 and includes exact capture location, presentation placement, safety constraints, and a `קואורק` prompt for every missing capture.

## New/expanded requirements represented

- self-learning space and teacher-association distinction
- student self-enrolment and `רשום אותי`
- one-attempt/test-like configuration
- correction/retry behavior
- archive flow
- change space image/title
- participant removal
- groups and group-specific data
- additional teacher role change
- direct task links
- student task result pass/fail
- task hide/delete distinction
- computerized-task pink icon
- task dragging
- importing tasks from another space
- content-update dragging result
- activity timestamp
- attempt count and highest score
- gradebook/export screenshots

## Safety and non-regression boundary

Untouched by this change:

- LTI launch flows
- Supabase persistence and RLS
- import pipelines
- Teacher Hub routes and data pages
- Render configuration
- Teacher Release gate
- secrets and credentials

Teacher Release remains `NO`.
