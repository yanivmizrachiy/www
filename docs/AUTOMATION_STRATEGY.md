# Moodle Teacher Hub — Automation Strategy

Updated: 2026-05-18

## Purpose

This document defines the product-level automation direction for `yanivmizrachiy/www`.

The final product goal is **maximum automatic Moodle data sync** for every teacher and every Moodle course space, while keeping strict truthfulness about what is currently verified.

## Current truth

The current working model is:

```text
Moodle Launch / LTI
→ identifies teacher/course/session context
→ teacher uploads or pastes real Moodle reports into the app
→ app detects and maps report structure as much as possible
→ app persists verified data to Supabase
→ dashboard and reports display real stored data
```

This means:

- Data is real.
- No demo data is allowed.
- Participants import works from real Moodle data.
- Gradebook import works from real Moodle data.
- Logs import works from real Moodle data.
- Full automatic Moodle extraction is **not yet verified**.

Manual Real Data Import is the current safe fallback. It is not the final product vision.

## Automation-first target

The target architecture is:

```text
Moodle Launch / LTI
→ verified teacher/course context
→ automatic capability detection
→ automatic sync where Moodle permissions allow it
→ manual real-report fallback only for unsupported/capped data
→ Supabase persistence
→ teacher-facing dashboard and reports
```

## Capability classes

Every data area must be classified as one of these states:

| State | Meaning |
|---|---|
| `automatic_verified` | The app pulls the data automatically from Moodle through a verified API/service. |
| `manual_real_import_working` | The teacher uploads/pastes a real Moodle report and the app imports it safely. |
| `planned_adapter_not_verified` | Code/planning exists, but no verified Moodle access exists yet. |
| `blocked_missing_permission_or_token` | Blocked because Moodle credentials/services/permissions are not available. |
| `blocked_missing_source_field` | Blocked because the source report does not contain a required official field. |

## Required automatic sync investigation

The next technical investigation should verify, with evidence, which of these can be used:

1. LTI Launch context only.
2. NRPS / Names and Role Provisioning Service.
3. AGS / Assignment and Grade Services.
4. Moodle Web Services token.
5. Any Ministry-of-Education Moodle restriction that blocks API access.

No screen may claim automatic full sync until the relevant source is verified and documented in `STATE/current-capabilities.json` and `STATE/evidence-log.md`.

## Fallback rule

If automatic sync is not verified for a data type, the UI must clearly guide the teacher to import a real Moodle report.

The fallback must still be as automatic as possible:

- auto-detect report type;
- auto-map known columns;
- reject fake/demo rows;
- show a safe preview;
- persist only valid real data;
- never convert missing grades to zero;
- never invent practice time.

## Teacher release rule

Teacher Release remains **NO** until:

1. Multi-teacher or multi-course isolation is verified.
2. No data mixing is verified.
3. Every visible data capability is classified truthfully.
4. All central screens are usable and not misleading.
5. `npm run check` and `npm run build` pass.

## Immediate roadmap

1. Maintain `PROJECT_RULES.md` as source of truth.
2. Keep `STATE/current-capabilities.json` updated.
3. Add a teacher-facing Moodle connection/capability status screen.
4. Improve manual import fallback into a smart unified import wizard.
5. Investigate automatic Moodle sync services safely.
6. Validate a second teacher or second Moodle course before Teacher Release.
