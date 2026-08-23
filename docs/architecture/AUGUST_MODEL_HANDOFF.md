# Handoff — המודל של אוגוסט

עודכן: 2026-08-23

## החלטת ארכיטקטורה

`yanivmizrachiy/www` נשאר Moodle Teacher Hub / backend קיים. **המודל של אוגוסט** יעבור לריפו נפרד ולא ייבנה בתוך `www`.

## כלל שימור

אין למחוק או להעתיק את `www` בשלמותו. הפרויקט החדש ישתמש ביכולות הקיימות דרך חוזים מפורשים בלבד.

נכסים שמוגדרים לשימוש חוזר:

- LTI 1.1/1.3 context/session work.
- NRPS / AGS work לפי הרשאות מאומתות.
- Supabase persistence והמודל הקיים.
- Participants / Gradebook / Logs imports.
- capability detection.
- evidence/truth gates.
- data-model lessons, במיוחד teacher/course/student identity.
- Moodle mappings ומחקר קיים.

## הפרדה

- `www`: Moodle engine, imports, data services, backend, existing Teacher Hub.
- `august-moodle-model`: Browser Extension / Content Layer / Moodle DOM adapters / August UI.

## חוזה עתידי

ה־Extension לא יקבל secrets ולא Supabase service role. חיבור ל־`www` ייעשה רק דרך API מאומת ו־course/teacher scoped.

## בטיחות

- PR #260 נסגר ולא ימוזג.
- אין שינוי ב־LTI, Supabase, imports או Render בעקבות מסמך זה.
- Teacher Release נשאר NO.
- אין credentials של משרד החינוך בפרויקט החדש.
