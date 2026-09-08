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

## Current verified state

Verified from repository structure/code only:

- isolated branch exists;
- no change to `main`;
- Teacher Hub code is untouched;
- Guide/Presentation code is untouched;
- extension requests no broad browser permissions;
- V1 code contains no Moodle writes;
- V1 has an explicit native-view escape hatch;
- DOM selectors are centralized in the course adapter.

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

1. Add bounded/idempotent dynamic-page remount support for Moodle AJAX/navigation changes.
2. Add a compatibility diagnostic panel that exposes only non-personal detector/adapter evidence locally.
3. Add local course search/filter over the extracted semantic model.
4. Add explicit unsupported-state handling rather than partial visual transformation.
5. Add fixture-based adapter tests using sanitized Moodle HTML snapshots already approved for repository use.
6. Validate against a real authorized teacher course.
7. Validate that a student account remains completely native.
8. Only after those validations, refine the visual system toward the final Yaniv design profile.
