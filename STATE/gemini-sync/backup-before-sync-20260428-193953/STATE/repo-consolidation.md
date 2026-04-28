# Repo Consolidation — Moodle Teacher Hub

תיעוד איחוד חכם של שני הריפואים שנוצרו סביב פרויקט Moodle Teacher Hub.

---

## ריפואים שנמצאו

1. `yanivmizrachiy/www`
2. `yanivmizrachiy/moodle-teacher-hub`

---

## החלטה מחייבת

הריפו הרשמי והמחייב להמשך הוא:

```text
yanivmizrachiy/www
```

הריפו `yanivmizrachiy/moodle-teacher-hub` מסומן כ־legacy / מקור ידע ישן בלבד.

---

## פעולות שבוצעו בפועל

- README של `www` עודכן כך שיצהיר ש־`www` הוא מקור האמת היחיד.
- נוצר `docs/legacy-moodle-teacher-hub-snapshot.md` בתוך `www` כדי לשמר ידע חשוב מהריפו הישן.
- נוצרו/עודכנו מסמכי governance ב־`www`:
  - `PROJECT_RULES.md`
  - `docs/system-rules.md`
  - `docs/requirements.md`
  - `STATE/project-status.md`
- הוחלט שאין למחוק את הריפו הישן בשלב זה כדי לא לאבד היסטוריה או קוד.

---

## מה לא בוצע עדיין

לא בוצע מיזוג קוד מלא ברמת git history או tree מלא, כי לא בוצע עדיין audit מלא של כל הקבצים בשני הריפואים.

לפני מיזוג קוד פיזי חובה לבצע:

1. רשימת קבצים מלאה לשני הריפואים.
2. השוואת קבצים כפולים.
3. זיהוי secrets או data פרטי.
4. בדיקת build.
5. בדיקת endpoints.
6. החלטה מה להעתיק ומה להשאיר legacy.

---

## מדיניות עבודה מעכשיו

- כל עבודה חדשה תתבצע רק ב־`yanivmizrachiy/www`.
- אין לפתוח PR/commit חדש ל־`moodle-teacher-hub` אלא אם המשתמש מבקש במפורש.
- כל ידע שימושי מהריפו הישן יועבר ל־docs/STATE בתוך `www` לפני מחיקה או נטישה.
- אין למחוק את הריפו הישן בלי אישור מפורש מהמשתמש.

---

## סטטוס איחוד

```text
Canonical repo: yanivmizrachiy/www
Legacy repo: yanivmizrachiy/moodle-teacher-hub
Documentation consolidation: done
Physical code merge: not yet done
Risk of losing data: avoided
```
