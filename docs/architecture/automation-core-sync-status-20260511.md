# Automation Core — Sync Status Implementation

## Purpose

This document describes the first real Automation Core implementation.

## Added capability model

The first sync status implementation checks:

- LTI session
- NRPS participants claim
- Participants names/emails
- course sections
- course tasks
- grade items
- grade results
- logs
- practice time
- reports
- export
- persistence

## Teacher experience

The Dashboard now has a first premium command-center layer.

The teacher sees:

- `סנכרן מרחב`
- counts for students/tasks/grades/logs
- feature buttons
- missing-data explanations

## Important limitation

This PR does not claim full automatic Moodle extraction yet.

It safely reports what is currently available from real data and what is missing.
