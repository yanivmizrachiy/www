# Moodle Teacher Hub — Moodle Logs Import

Implements real Moodle Logs / יומני מעקב import.

## Real source profile

The uploaded Moodle logs export had:

- 89,995 rows
- 9 columns
- columns: זמן, שם מלא, משתמש מושפע, הארוע מתייחס ל:, רכיב, שם האירוע, תיאור, מקור, כתובת IP

## Safety

- No fake logs.
- No practice time invented at import stage.
- Raw log rows are not returned by public diagnostics.
- Teacher Release remains NO.
- The uploaded source file must not be committed to GitHub.

## Next step

Open `/logs-import`, upload the real Moodle logs export, click `ייבא יומני מעקב אמיתי`, then validate `log_events > 0`.
