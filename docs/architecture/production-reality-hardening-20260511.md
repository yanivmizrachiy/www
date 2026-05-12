# Production Reality Hardening — Moodle Teacher Hub

## Purpose

This document prevents the project from drifting into demo behavior or accidental rebuilds.

Moodle Teacher Hub is intended as a real product for real teachers, possibly commercial in the future.

## Critical distinction

A screen existing in the app does not mean the capability is complete.

Examples:

- `Grades` route exists, but grades are complete only after real Gradebook/AGS/WS source and validation.
- `Activity` route exists, but practice time is complete only after real Logs or official Moodle time source.
- `Tasks` route exists, but tasks/chapters are complete only after real Moodle sections/tasks source.
- `Reports` route exists, but reports are complete only after real data, export, and validation.

## No rebuild rule

Do not restart from scratch.

Upgrade the existing app:

- Dashboard -> premium command center.
- Students -> participants/student hub.
- Tasks -> chapters/tasks hub.
- Grades -> grade intelligence.
- Activity -> practice time hub.
- Reports -> reports center.
- Export -> Excel/PDF/WhatsApp helper.
- Import -> smart fallback import.

## LTI separation

LTI 1.3 and LTI 1.0/1.1 must remain clearly separated.

- LTI 1.3: NRPS/AGS/Advantage flow.
- LTI 1.0/1.1: OAuth1/HMAC compatibility flow if needed.

Do not treat success in one route as proof for the other.

## Teacher release gate

Before broad teacher release, the product must have:

1. Durable persistence.
2. Teacher/course/context separation.
3. Automation Core.
4. Capability Detector.
5. Feature Gates.
6. Central `סנכרן מרחב`.
7. Premium Hebrew RTL UI.
8. Real tasks/grades/time/reports.
9. No fake active buttons.
10. Installation guide.
11. Multi-teacher testing.
12. Privacy boundaries.

## Next code milestone

Automation Core must be the next implementation milestone.
