# LTI 1.3 Phase 4 — Service Claims Diagnostics

Date: 20260507-195629

Added truth-first diagnostics for LTI 1.3 automation permissions.

This checks whether the real Moodle LTI 1.3 launch payload includes:

- NRPS Names and Roles service claim
- AGS Assignment and Grade Services claim

This does not fake automatic sync.
Manual import remains the safe fallback until real NRPS/AGS calls are implemented and verified.
