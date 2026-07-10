# Cutover Runbook — העלאת הגרסה החדשה לאוויר

מדריך צעד-אחר-צעד להעברת האתר החי לגרסה העובדת. נכתב 2026-07-10.

## 0. מצב לפני (הכל ירוק, אומת)
- ענף עובד: `rebuild/lti13-secure-teacher-hub` — typecheck ✓, build ✓, בדיקת LTI e2e 14/14 ✓, תואם למסד 1:1.
- שני תיקוני מסד כבר הורצו (RLS של teacher_sessions + 3 טבלאות course-structure).
- **משתני סביבה ב-Render: מלאים.** כל מה שהשרת דורש קיים. מה שחסר הוא אופציונלי בלבד:
  - `MOODLE_WS_TOKEN` / `MOODLE_WS_BASE_URL` — נתיב "חיבור מורחב" (בונוס), לא חוסם.
  - `LTI13_ALLOWED_REGISTRATIONS`, `LTI_ALLOW_OLD_TIMESTAMP` — יש ברירות מחדל.
  - `LTI13_PLATFORM_ISSUER`/`LTI13_PLATFORM_AUTH_URL` — הקוד מקבל את השמות שקיימים ב-Render (`LTI13_ISSUER`, `LTI13_AUTH_LOGIN_URL`) כ-alias.
- האתר החי כרגע מריץ את `gemini/recovery-sync-20260503-073319` (קוד ישן ושבור-נתונים).

## 1. ה-Cutover (הדרך הנכונה — דרך Render, בלי כתיבת היסטוריה)
1. היכנס ל-https://dashboard.render.com → התחבר.
2. בחר את השירות **`www`**.
3. **Settings** → אזור **Build & Deploy** → שדה **Branch**.
4. שנה מ-`gemini/recovery-sync-20260503-073319` ל-**`rebuild/lti13-secure-teacher-hub`**.
5. **Save Changes**. Render מתחיל בנייה אוטומטית (~2-4 דקות).
   - יתרון: `gemini` נשאר שלם כגיבוי אוטומטי. אין force-push, אין כתיבת היסטוריה.

## 2. אימות אחרי ה-deploy (מה אמור לקרות)
פתח `https://www-tijc.onrender.com/health`. הגרסה **החדשה** מזוהה כך:
- ✅ מופיע `"canonicalLtiEndpoint":"/api/lti/launch"` ו-`"supabaseConfigured":true` ו-`"readyForMoodleUse":true`.
- ❌ אם עדיין מופיע `"lti11Ready"` ו-`"launch_url":".../lti/launch-1p1"` — זו עדיין הגרסה הישנה (הבנייה טרם הסתיימה, המתן ורענן).

בדיקות מהירות נוספות:
- `https://www-tijc.onrender.com/guide` → נטען (מצגת).
- `https://www-tijc.onrender.com/admin-hub` → מסך התחברות מנהל.

## 3. אימות מול Moodle אמיתי (הצעד שסוגר הכל)
1. היכנס ל-Moodle של משרד החינוך כמורה, לקורס עם הכלי המותקן.
2. לחץ על הכלי (External Tool).
3. אמור להיפתח "המודל החכם" עם **שמך ושם הקורס האמיתיים**.
4. אם רואים שם+קורס → הזרימה עובדת מקצה-לקצה. ✅
5. אם שגיאה → צלם/העתק אותה; מגלגלים אחור (סעיף 4) ומאבחנים.

## 4. גלגול אחור (אם משהו משתבש) — מיידי
דרך Render: Settings → Branch → החזר ל-`gemini/recovery-sync-20260503-073319` → Save. חוזר למצב הקודם תוך דקות.
(הענף `gemini` לא נגע, אז הגלגול הוא מיידי ומלא.)

## 5. ניקוי אחרי הצלחה
אחרי שהגרסה החדשה יציבה ואומתה מול Moodle:
- אפשר למחוק את `gemini/recovery-sync-20260503-073319` (כבר לא בשימוש).
- אפשר לאחד: להפוך את `rebuild/lti13-secure-teacher-hub` לענף הראשי, או למזג ל-`main`.
- יעד סופי: ענף אחד נקי שממנו Render בונה.

## הערה על מגבלה
ה-cutover חייב להיעשות דרך לוח הבקרה של Render (או ע"י מי שיש לו גישה ל-Render), כי
זו פעולת production. אין דרך לבצע אותה מהקוד בלבד.
