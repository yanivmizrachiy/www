# Final Teacher Installation Model — Moodle Teacher Hub

מסמך זה מגדיר את יעד הסיום של Moodle Teacher Hub מבחינת התקנה/פתיחה של הכלי בכל מרחב לימודי של כל מורה.

מקור אמת עליון: `PROJECT_RULES.md`.

---

## 1. יעד סופי

בסיום הפיתוח, המוצר לא אמור להיות רק בדיקה במרחב Moodle של יניב.

היעד הסופי הוא שליניב יהיה קישור/תצורת התקנה אמיתיים, שכל מורה יוכל להוסיף למרחב הלימודי שלו ב־Moodle ככלי חיצוני.

כל מורה:

1. נכנס למרחב Moodle שלו.
2. מוסיף/פותח את הכלי החיצוני Moodle Teacher Hub.
3. הכלי נפתח מתוך אותו מרחב.
4. האפליקציה מקבלת context של אותו מרחב דרך LTI.
5. המורה רואה רק את הנתונים האמיתיים של אותו מרחב.

---

## 2. מה הקישור צריך להיות

הקישור הסופי צריך להיות Tool URL / Launch URL ציבורי ויציב, לדוגמה מבנה מסוג:

```text
https://<public-app-domain>/lti-launch
```

או URL ציבורי אחר של Edge Function / backend launch endpoint, בתנאי שהוא:

- יציב.
- ציבורי.
- לא זמני.
- לא tunnel זמני.
- לא כתובת trycloudflare זמנית.
- ללא Markdown wrapping.
- ללא רווחים בתחילה/בסוף.
- תואם בדיוק ל־OAuth signature base string.

ה־Tool URL שנצפה כרגע במרחב של יניב הוא:

```text
https://iibrglxkiszrbzakrnlo.functions.supabase.co/lti-launch
```

סטטוס: observed from user screenshot, not yet fully verified end-to-end in a real successful Moodle launch.

---

## 3. מה כל מורה יצטרך להגדיר ב־Moodle

הגדרת כלי חיצוני צפויה לכל מורה/מרחב:

- שם הכלי: `Moodle Teacher Hub`
- Tool URL / Launch URL: הכתובת הציבורית הסופית של הכלי.
- LTI version: כרגע נצפה `LTI 1.0/1.1`.
- Consumer Key: לדוגמה `yaniv-lti-tool`, או key אחר אם יוגדר במודל ההפצה הסופי.
- Shared Secret: חייב להישמר בצורה מאובטחת, לא בגיטהאב ולא בפרונט.
- Privacy/settings: לפי מה ש־Moodle מאפשר לשלוח — שם, אימייל, role, course/context, אם זמין.
- Launch container: בהתאם לתצורת Moodle ולמה שנבדק בפועל.

---

## 4. מודל אבטחה

אסור להכניס לריפו:

- Shared Secret.
- Moodle Web Services token.
- service role key.
- נתוני תלמידים אמיתיים.
- דוחות Moodle פרטיים.

ה־secret הסופי חייב להישמר רק בסביבת deploy/Supabase secrets או מנגנון סודי מאובטח אחר.

---

## 5. מודל נתונים לכל מורה

כל מורה מקבל context נפרד לפי launch/session.

המערכת חייבת למנוע ערבוב בין:

- מורה א׳ ומורה ב׳.
- מרחב אחד ומרחב אחר.
- מחשב אחד ומכשיר אחר ללא session תקין.

כל נתון מיובא חייב להיות משויך ל־site/course/session/teacher context כאשר המידע זמין.

---

## 6. מה לא נחשב סיום

הדברים הבאים אינם מספיקים כדי לסמן את ההתקנה הסופית כגמורה:

- רק מסך יפה.
- רק GitHub Pages.
- רק LTI screen שלא אומת.
- רק קישור שעובד בדפדפן אבל לא מתוך Moodle.
- רק dashboard בלי נתוני אמת.
- רק import בלי provenance.
- כפתורים שלא עובדים.

---

## 7. Definition of Done להתקנה הסופית

התקנה סופית תיחשב מוכנה רק כאשר:

1. יש Tool URL ציבורי ויציב.
2. הכלי נפתח מתוך Moodle אמיתי.
3. LTI 1.0/1.1 OAuth verification עובד בפועל.
4. session token נוצר ונשמר בצד לקוח רק לפי הכללים.
5. context של קורס/מורה מתקבל אם Moodle שולח אותו.
6. אין דרישת סיסמת Moodle בתוך האתר.
7. אין טענה לחיבור API חי ללא token אמיתי.
8. import של דוח Moodle אמיתי/אנונימי עובד end-to-end.
9. כל route מרכזי נטען.
10. כל הכפתורים בעברית עובדים או מציגים blocked/missing אמיתי.
11. `STATE/evidence-log.md` מתעד את הבדיקה.
12. `STATE/project-status.md` מעודכן.

---

## 8. קשר לפרומפט Google AI Studio

כל AI שממשיך את הפרויקט חייב להבין:

- קודם בודקים במרחב של יניב.
- בסיום צריך מודל התקנה לכל מורה.
- לא בונים אפליקציה חד-פעמית רק ליניב.
- לא בונים מוצר שדורש Web Services token אם אין כזה.
- חייבים לשפר כל הזמן את הדרך שבה המורה מקבל את הנתונים באופן האוטומטי המקסימלי האפשרי.
- כל שינוי חייב להתועד בריפו.
