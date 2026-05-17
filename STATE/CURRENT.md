# Moodle Teacher Hub — Current State

Canonical branch: `main`
Teacher release: **NO**

Last synchronized: 20260517-053736

## Verified real imports

```
students = 62
grade_items_written = 243
grade_results_written = 1693
log_events_written = 89995
skipped_rows = 0
```

## Verified truth flags

```
fake_logs = false
empty_grades_saved_as_zero = false
teacher_release_changed = false
```

## Practice-time truth gate

```
practice_time_available = false
blocker_key = NO_DURATION_FIELD
fake_time = false
window_estimation_enabled = false
```

Reason: Moodle Logs report contains no explicit duration field. No practice
time calculated. Timestamp-window estimation permanently disabled.

## Remaining blockers

```
multi_teacher_or_multi_course_isolation = not validated
teacher_release_ready = false
```
