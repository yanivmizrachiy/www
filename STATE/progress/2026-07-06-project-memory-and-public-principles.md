# Progress — Project Memory and Public Principles

Date: 2026-07-06  
Repo: `yanivmizrachiy/www`  
Teacher Release: **NO**

## What changed

Created the central project memory file:

```text
PROJECT_MEMORY.md
```

Created a safe public/deployment copy:

```text
public/PROJECT_MEMORY.md
```

The public copy is intended to be available as a static asset when the deployment serves the `public` directory.

## Why this matters

The project now has a single documented memory/principles source for the evolving requirements around two separate products:

1. Live web presentation / guide for teachers.
2. Moodle Teacher Hub / WWW data tool installed as an External Tool in Moodle.

## Core rule recorded

The guide system and Teacher Hub system must stay separated.

- The guide is a general live presentation for teachers.
- Teacher Hub is a Moodle-connected data tool for each teacher/course context.

## Safety boundaries

No code logic was changed.

Untouched:

- LTI launch flow.
- Participants import.
- Gradebook import.
- Logs import.
- Supabase persistence.
- Render deployment config.
- Teacher Release gate.

Teacher Release remains:

```text
NO
```

## Next recommended work

Claude Code should now start from `PROJECT_MEMORY.md`, then plan and implement the new Guide/Admin structure safely:

- `/guide`
- `/guide/presentation`
- `/guide/admin`
- `/guide/slides`
- `/guide/assets`
- `/guide/moodle-map`
- `/guide/share`
- `/guide/install`
- `/admin-hub/analytics`
- `/admin-hub/project-memory`

Before implementation, update this progress area with the exact plan and impacted files.
