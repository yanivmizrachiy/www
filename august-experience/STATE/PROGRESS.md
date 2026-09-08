# August Experience — Progress Log

Branch: `feat/august-experience-v1`  
Base: `august-moodle-model-20260823`  
Teacher Release: **NO**  
Production/Main impact: **NONE**

## 2026-09-08 — Architecture hardening

Created `august-experience/ARCHITECTURE_V1.md`.

Decisions added beyond the August 23 vision:

- V1 is presentation-first and read-only.
- fail-open is mandatory;
- activation is teacher-only and conservative;
- Moodle DOM access is centralized behind versioned adapters;
- low-confidence detection must preserve native Moodle;
- native-view escape hatch is mandatory;
- accessibility, privacy and compatibility are release gates;
- no Moodle page text/student data leaves the browser in V1;
- architecture must remain portable to a future official Moodle theme/plugin.

## 2026-09-08 — Extension scaffold

Created a Manifest V3 extension shell under `august-experience/extension/`.

Current host scope:

`https://moodlemoe.lms.education.gov.il/*`

No extra extension permissions are requested.

## 2026-09-08 — Context detector

Added `src/detector.js`.

Responsibilities:

- detect Moodle course-view surface;
- read course id hint from URL;
- detect teacher/editing capability evidence conservatively;
- report confidence and evidence;
- never activate on unsupported pages.

Important limitation: current capability evidence is DOM-based and must be validated against a real authorized teacher course before Teacher Release.

## 2026-09-08 — Adapter registry

Added `src/adapter-registry.js`.

Rules:

- feature code does not select Moodle selectors directly;
- adapters must explicitly support a detected context;
- adapter failures are isolated and must preserve native Moodle.

## 2026-09-08 — Moodle course adapter V1

Added `src/adapters/moodle-course.js`.

Current read-only extraction:

- course title;
- visible course sections;
- section titles;
- visible activity labels;
- native activity URLs.

The semantic model is read-only. No forms are submitted and no Moodle write endpoints are called.

Current selector set is intentionally small and centralized. It must be validated against the real Ministry Moodle DOM before it can be marked compatible.

## 2026-09-08 — August Shell V1

Added `src/shell.js` and expanded `src/styles.css`.

Current shell behavior:

- renders a teacher workspace heading;
- renders Moodle sections as responsive cards;
- renders existing Moodle activities as links to the original Moodle targets;
- preserves native Moodle as source and target;
- provides a persistent button to return to native Moodle view;
- includes RTL, keyboard focus and reduced-motion handling.

The shell only renders when adapter extraction confidence is high.

## 2026-09-08 — Bootstrap wiring

Replaced the original monolithic bootstrap with an orchestrator that loads:

1. detector;
2. adapter registry;
3. Moodle course adapter;
4. shell;
5. bootstrap.

Any missing module, unsupported page, low-confidence context, missing adapter or runtime exception falls back to native Moodle.

Manifest version raised to `0.2.0`.

## 2026-09-08 — Premium visual system direction lock

The previous shell was judged technically correct but visually too conservative for the product goal.

The visual target is now explicitly: **the teacher should feel they entered a new premium workspace, not a mildly restyled Moodle page.**

Implemented in `src/shell.js` + `src/styles.css`:

- large immersive hero area with layered gradients and controlled glow;
- glass/blur command surfaces with graceful fallback behavior;
- strong typography hierarchy and balanced RTL composition;
- premium top brand pill and persistent native-view escape control;
- course-derived statistic cards for sections and activities;
- central command/search bar with live filtering;
- numbered section cards with strong visual hierarchy;
- richer activity rows with icon treatment and directional affordance;
- card depth, hover elevation and staggered micro-motion;
- responsive mobile composition;
- reduced-motion accessibility support;
- Moodle native page remains preserved underneath and can be restored instantly.

No external images, third-party trackers or decorative assets were added. The premium effect is produced locally from CSS, semantic course data and native links only.

Important: this visual system is **not yet declared final**. It must be judged against real Ministry Moodle screenshots/DOM before a Teacher Release. The next visual iteration should be driven by the actual Moodle page structure and Yaniv's final visual profile, not generic UI fashion.

## Current verified state

Verified from repository structure/code only:

- isolated branch exists;
- no change to `main`;
- Teacher Hub code is untouched;
- Guide/Presentation code is untouched;
- extension requests no broad browser permissions;
- V1 code contains no Moodle writes;
- V1 has an explicit native-view escape hatch;
- DOM selectors are centralized in the course adapter;
- premium shell is built from local CSS/JS only;
- search/filter operates locally over the extracted read-only semantic model.

## Not yet verified — do not claim

- real teacher detection on Ministry Moodle;
- student account non-activation;
- exact Ministry Moodle course selectors;
- dynamic/AJAX navigation compatibility;
- Chrome/Edge installation on a teacher device;
- accessibility on the real Moodle DOM;
- full visual quality against a real course;
- compatibility across course formats;
- Teacher Release readiness.

## Next implementation gates

1. Validate the premium shell against a real authorized Ministry Moodle course DOM/screenshot.
2. Add bounded/idempotent dynamic-page remount support for Moodle AJAX/navigation changes.
3. Add a compatibility diagnostic panel that exposes only non-personal detector/adapter evidence locally.
4. Add explicit unsupported-state handling rather than partial visual transformation.
5. Add fixture-based adapter tests using sanitized Moodle HTML snapshots already approved for repository use.
6. Validate that a student account remains completely native.
7. Tune the visual profile from real Moodle evidence: density, card proportions, command actions and teacher workflow priority.
8. Only after those validations, mark a first Teacher Release candidate.
