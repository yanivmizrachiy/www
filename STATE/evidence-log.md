# Evidence Log — www / Moodle Teacher Hub

לוג הוכחות עבור הריפו `yanivmizrachiy/www`.

הכלל המרכזי: מה שלא מופיע כאן כהוכחה — לא נחשב מאומת.

---

## 2026-04-27 — Repository governance setup

### Verified

- הריפו `yanivmizrachiy/www` אותר בגיטהאב.
- נמצא `README.md` קיים.
- נמצא `.gitignore` קיים שמחריג `.env`, לוגים, backups, `dist`, `coverage` וקבצי מערכת.
- נוצר/אומת `PROJECT_RULES.md` כמקור אמת עליון.
- נוצר/אומת `docs/system-rules.md`.
- נוצר/אומת `docs/requirements.md`.
- נוצר `STATE/project-status.md`.
- נוצר `STATE/evidence-log.md`.

### Not verified yet

- build מלא.
- הרצת שרת.
- `/health`.
- `/dev/login`.
- `/lti/launch-1p1` מול Moodle אמיתי.
- חיבור Moodle API חי.
- SSO משרד החינוך מלא.
- ייצוא Excel אמיתי.
- ייצוא PDF אמיתי.
- עריכה דו־כיוונית מול Moodle.

### Current truth status

```text
Repository governance: verified
Product requirements captured: verified
Code/runtime verification: not completed
Production-ready: no
```
