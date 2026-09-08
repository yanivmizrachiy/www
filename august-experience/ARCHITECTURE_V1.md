# August Experience Layer — Architecture V1

Status: implementation branch, not a Teacher Release.

## Product boundary

August changes the teacher experience inside the existing authorized Moodle course. Moodle remains the source of identity, authorization, course data and writes. August must not create a parallel course, collect Ministry credentials, or silently write data.

Teacher Hub remains a separate product surface and reusable service/data engine. Guide/Presentation remains separate. August Experience is a third, isolated surface.

## Improvements over the August 23 vision

1. **Presentation-first V1** — first release is read-only UI transformation. No grade/content/participant writes.
2. **Fail-open** — any detector/adapter uncertainty restores native Moodle instead of hiding unknown UI.
3. **Teacher-only activation** — never infer permission from labels alone. Activation requires a verified teacher/editing capability signal. Until verified, native Moodle remains untouched.
4. **DOM contract + confidence** — every adapter returns `supported`, `confidence`, evidence and extracted semantic model. Low confidence means no transformation.
5. **Mutation resilience** — Moodle dynamic navigation/AJAX changes are handled through a bounded MutationObserver and idempotent re-render, never scattered observers.
6. **Native escape hatch** — a persistent “תצוגת Moodle רגילה” control is mandatory on every transformed page.
7. **Accessibility parity** — keyboard, focus order, semantic landmarks, contrast, reduced motion, zoom and RTL are release gates.
8. **Privacy by construction** — no Moodle page text, student data or DOM snapshots leave the browser in V1. Telemetry is off by default and may only contain non-personal compatibility events if later enabled explicitly.
9. **Versioned adapters** — selectors are centralized per Moodle surface/version. No feature code may query Moodle DOM directly.
10. **Design-system portability** — tokens/components stay independent of the delivery mechanism so the same visual system can later move to an official Moodle theme/plugin.
11. **Kill switch** — local disable plus remotely distributable release disable policy must be possible before broad rollout.
12. **Compatibility matrix** — release is per verified Moodle surface/browser combination, not a blanket “works on Moodle” claim.

## V1 scope

Transform only the authenticated teacher course landing page after positive capability detection.

V1 may:
- add August header/navigation;
- reorganize visible course sections into accessible cards;
- improve hierarchy, spacing, typography and RTL;
- provide local search/filter over already-rendered course items;
- expose native Moodle links/actions without changing their authorization semantics;
- switch instantly between August and native view.

V1 must not:
- submit forms automatically;
- modify grades, participants, activities or course content;
- intercept passwords/authentication;
- call undocumented privileged endpoints;
- hide an unknown/unsupported Moodle control;
- activate for students.

## Modules

```text
august-experience/
  ARCHITECTURE_V1.md
  extension/
    manifest.json
    src/
      bootstrap.js
      detector.js
      adapter-registry.js
      adapters/
        moodle-course.js
      shell.js
      styles.css
```

### detector
Determines host, Moodle surface, course identity hints and teacher/editing capability evidence. Returns a confidence score and evidence flags.

### adapter-registry
The only gateway between August features and Moodle DOM. Selects a compatible adapter and refuses transformation when no adapter is verified.

### adapter
Extracts a semantic read-only course model and references to native actions. It owns all selectors.

### shell
Renders August UI from the semantic model. It does not know Moodle selectors.

## Release gates

A build is not a Teacher Release until all are true:

- real authorized Moodle course tested;
- teacher activation verified;
- student account verified to remain native;
- native escape hatch tested;
- refresh/back/forward and dynamic navigation tested;
- Chrome/Edge desktop tested;
- RTL, keyboard, 200% zoom and reduced-motion tested;
- unsupported-page fail-open tested;
- zero credential capture verified;
- zero Moodle writes from August V1 verified;
- screenshots contain no real student PII;
- rollback/disable procedure tested.

## Delivery strategy

The first implementation target is a Manifest V3 browser extension because it can prove Same Space without requiring Moodle administrator installation. The architecture deliberately keeps adapters and design tokens portable to a future official Moodle Theme/Plugin/Course Format if administrator support becomes available.
