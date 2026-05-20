# Work Order: Dynamic LTI Capability Probes V1

Assigned to: Claude / coding agent  
Issued by: GPT project manager  
Teacher Release: NO

## Mission

Move Moodle Teacher Hub from pilot validation to dynamic automation for every teacher and every Moodle context.

Course 259 is evidence only. Do not hardcode it.

## Required pre-flight

Read:

1. PROJECT_RULES.md
2. STATE/project-status.md
3. docs/AI_CONTROL_TOWER.md
4. docs/architecture/MOODLE_MAX_AUTOMATION_MULTI_TEACHER_SPEC.md
5. STATE/automation/DEEP_LAUNCH_CONTEXT_AUDIT.json

## Hard restrictions

Do not rewrite the app.

Do not touch protected pipelines unless a verified bug requires it:

- Participants import
- Gradebook import
- Logs import
- Supabase migrations
- LTI launch handshake
- Practice time truth gate
- Teacher Release gate

Forbidden:

- no demo data
- no fake automatic sync
- no hardcoded course id
- no hardcoded teacher name/id
- no secrets or tokens in repo
- no raw student rows in diagnostics
- no Teacher Release YES

## Build target

Implement or prepare the smallest safe code change that advances:

1. Dynamic launch context normalization.
2. NRPS/AGS claim capability detection.
3. Context-bound import provenance.
4. Course Structure / Activity Completion next-step readiness.
5. Clear Hebrew status in /automation without false claims.

## Required checks

Run:

npm run audit:moodle-automation
npm run audit:multi-teacher-safety
npm run audit:deep-launch-context
npm run check
npm run build
npm run doctor

## Stop rule

Open exactly one PR and stop. Do not merge.

## Final report

Return:

1. PR link
2. branch
3. files changed
4. checks passed
5. protected pipelines unchanged
6. Teacher Release remains NO
7. what capability is now more automatic
8. what remains blocked